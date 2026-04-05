const fs = require('fs');
const path = require('path');

function getSingleQueryParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

function stripQuotes(value) {
  if (!value) return value;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseSimpleEnv(content) {
  const result = {};
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    const value = stripQuotes(line.slice(eq + 1));
    result[key] = value;
  }
  return result;
}

function loadLocalEnvFallback() {
  const cwd = process.cwd();
  const candidates = [path.join(cwd, '.env.local'), path.join(cwd, '.env')];

  for (const filePath of candidates) {
    try {
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf8');
      return parseSimpleEnv(content);
    } catch {
      // Ignore local env parse errors and continue.
    }
  }

  return {};
}

function getRequestOrigin(req) {
  const forwardedProto = getSingleQueryParam(req.headers['x-forwarded-proto']);
  const proto = (forwardedProto || 'http').split(',')[0].trim();
  const forwardedHost = getSingleQueryParam(req.headers['x-forwarded-host']);
  const host = (forwardedHost || req.headers.host || '').split(',')[0].trim();
  return `${proto}://${host}`;
}

function htmlResponse(res, status, html) {
  res.statusCode = status;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.end(html);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildAuthPage({ title, message, script }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    <p>${escapeHtml(message)}</p>
    <script>
${script}
    </script>
  </body>
</html>`;
}

module.exports = async function handler(req, res) {
  const code = getSingleQueryParam(req.query?.code);
  const provider = (getSingleQueryParam(req.query?.provider) || 'github').toLowerCase();
  const scope = getSingleQueryParam(req.query?.scope) || 'repo';

  if (provider !== 'github') {
    const html = buildAuthPage({
      title: 'Unsupported provider',
      message: `Unsupported provider: ${provider}`,
      script: `// No-op`,
    });
    return htmlResponse(res, 400, html);
  }

  const localEnv = loadLocalEnvFallback();
  const clientId = process.env.GITHUB_CLIENT_ID || localEnv.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || localEnv.GITHUB_CLIENT_SECRET;

  const origin = getRequestOrigin(req);
  const callbackPath = new URL(req.url, origin).pathname;
  const redirectUri = `${origin}${callbackPath}`;

  const missingEnv = !clientId || !clientSecret;

  // STEP 1: Start OAuth (no code yet)
  // Decap/NetlifyAuthenticator expects the popup to postMessage:
  //   'authorizing:github'
  // then later:
  //   'authorization:github:success:<json>'
  // We must run JS in the popup before navigating to GitHub.
  if (!code) {
    const html = buildAuthPage({
      title: 'Authorizing with GitHub',
      message: missingEnv
        ? 'Server is missing GitHub OAuth environment variables.'
        : 'Opening GitHub authorization…',
      script: `(() => {
  const provider = ${JSON.stringify(provider)};
  const clientId = ${JSON.stringify(clientId || '')};
  const scope = ${JSON.stringify(scope)};
  const missingEnv = ${JSON.stringify(missingEnv)};

  const targetOrigin = window.location.origin;
  const authorizingMsg = 'authorizing:' + provider;

  function handshakeThen(next) {
    if (!window.opener) {
      next();
      return;
    }

    let done = false;
    let timeoutId = null;

    function cleanup() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      window.removeEventListener('message', onMessage, false);
    }

    function onMessage(e) {
      if (e.origin !== targetOrigin) return;
      if (e.data === authorizingMsg) {
        done = true;
        cleanup();
        next();
      }
    }

    window.addEventListener('message', onMessage, false);
    window.opener.postMessage(authorizingMsg, targetOrigin);

    // Decap switches listeners after it receives this echo.
    // If it never arrives, fail explicitly instead of silently continuing.
    timeoutId = setTimeout(() => {
      if (done) return;
      cleanup();
      postErrorAndClose('OAuth popup handshake timed out. Please retry.');
    }, 4000);
  }

  function postErrorAndClose(message) {
    if (window.opener) {
      const payload = { message };
      window.opener.postMessage(
        'authorization:' + provider + ':error:' + JSON.stringify(payload),
        targetOrigin,
      );
    }
    setTimeout(() => window.close(), 50);
  }

  handshakeThen(() => {
    if (missingEnv) {
      postErrorAndClose('Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET on the server');
      return;
    }

    const redirectUri = window.location.origin + window.location.pathname;

    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
    githubAuthUrl.searchParams.set('response_type', 'code');
    if (scope) githubAuthUrl.searchParams.set('scope', scope);

    window.location.assign(githubAuthUrl.toString());
  });
})();`,
    });

    return htmlResponse(res, 200, html);
  }

  // STEP 2: Complete OAuth (code is present)
  if (missingEnv) {
    const html = buildAuthPage({
      title: 'Authorization failed',
      message: 'Missing server environment variables for GitHub OAuth.',
      script: `(() => {
  const provider = ${JSON.stringify(provider)};
  const targetOrigin = window.location.origin;
  const authorizingMsg = 'authorizing:' + provider;
  const errorMsg = 'authorization:' + provider + ':error:' + JSON.stringify({
    message: 'Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET on the server',
  });

  function sendFinal() {
    if (window.opener) {
      window.opener.postMessage(errorMsg, targetOrigin);
    }
    setTimeout(() => window.close(), 50);
  }

  if (!window.opener) {
    return;
  }

  let done = false;
  function onMessage(e) {
    if (e.origin !== targetOrigin) return;
    if (e.data === authorizingMsg) {
      done = true;
      window.removeEventListener('message', onMessage, false);
      sendFinal();
    }
  }

  window.addEventListener('message', onMessage, false);
  window.opener.postMessage(authorizingMsg, targetOrigin);
  setTimeout(() => {
    if (done) return;
    window.removeEventListener('message', onMessage, false);
    sendFinal();
  }, 250);
})();`,
    });
    return htmlResponse(res, 500, html);
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json().catch(() => null);

    if (!tokenResponse.ok) {
      const details = tokenData?.error_description || tokenData?.error || `HTTP ${tokenResponse.status}`;
      throw new Error(`GitHub token request failed: ${details}`);
    }

    if (!tokenData || tokenData.error || !tokenData.access_token) {
      const details = tokenData?.error_description || tokenData?.error || 'No access_token returned';
      throw new Error(`GitHub OAuth failed: ${details}`);
    }

    const payload = {
      token: tokenData.access_token,
      provider,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    };

    const html = buildAuthPage({
      title: 'Authorization successful',
      message: 'Authorization successful. You may close this window.',
      script: `(() => {
  const provider = ${JSON.stringify(provider)};
  const payload = ${JSON.stringify(payload)};
  const targetOrigin = window.location.origin;
  const successMsg = 'authorization:' + provider + ':success:' + JSON.stringify(payload);

  function sendFinal() {
    if (window.opener) {
      // Send multiple times in case the opener listener attaches slightly late.
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          try {
            window.opener.postMessage(successMsg, targetOrigin);
          } catch (_) {
            // No-op
          }
        }, i * 60);
      }
    }
    setTimeout(() => window.close(), 350);
  }

  if (!window.opener) {
    return;
  }

  sendFinal();
})();`,
    });

    return htmlResponse(res, 200, html);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const html = buildAuthPage({
      title: 'Authorization failed',
      message,
      script: `(() => {
  const provider = ${JSON.stringify(provider)};
  const targetOrigin = window.location.origin;
  const errorMsg = 'authorization:' + provider + ':error:' + JSON.stringify({ message: ${JSON.stringify(message)} });

  function sendFinal() {
    if (window.opener) {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          try {
            window.opener.postMessage(errorMsg, targetOrigin);
          } catch (_) {
            // No-op
          }
        }, i * 60);
      }
    }
    setTimeout(() => window.close(), 350);
  }

  if (!window.opener) {
    return;
  }

  sendFinal();
})();`,
    });
    return htmlResponse(res, 500, html);
  }
};
