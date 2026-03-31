module.exports = async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // If no code, redirect to GitHub to initiate OAuth flow
  if (!code) {
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', 'https://pumpcoin.vercel.app/api/auth/callback');
    githubAuthUrl.searchParams.set('scope', 'repo');
    return res.redirect(githubAuthUrl.toString());
  }

  // Exchange code for token
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    const token = tokenData.access_token;

    // Return HTML that sets the token in window.location.hash for Decap CMS to read
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Authorization successful</title></head>
      <body>
        <p>Authorization successful! Redirecting...</p>
        <script>
          // Set token in hash and notify parent window
          const hash = '#access_token=${token}&token_type=bearer&expires_in=3600';
          window.location.hash = hash;
          
          // Also notify parent in case it's a popup
          if (window.opener) {
            window.opener.postMessage({
              type: 'authorization:github',
              hash: hash
            }, window.location.origin);
            setTimeout(() => window.close(), 100);
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
