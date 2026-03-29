# Decap CMS Setup Guide

## Overview
Decap CMS enables non-technical users to edit site content via `/admin` dashboard. All edits auto-commit to GitHub and trigger Vercel rebuilds.

## 1. GitHub OAuth Configuration

### Step 1: Create GitHub OAuth App
1. Go to GitHub Settings → Developer Settings → [OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** PumpCoin CMS
   - **Homepage URL:** `https://pumpcoin.vercel.app` (your live domain)
   - **Authorization callback URL:** `https://auth.netlify.com/callback`
4. Copy your **Client ID** and **Client Secret**

### Step 2: Update CMS Config
Edit `public/admin/config.yml` and replace:
```yaml
app_id: YOUR_GITHUB_OAUTH_APP_ID
```
with your actual Client ID

### Step 3: Deploy to Vercel (or Netlify)
- Vercel auto-detects Astro and builds the site
- Decap CMS will use `https://auth.netlify.com` for OAuth

## 2. Testing Locally

Run the dev server with local backend:
```bash
npm run dev
```

Then visit: `http://localhost:4321/admin`

The `local_backend: true` in config.yml enables local testing without pushing to GitHub.

## 3. How Non-Tech Users Edit Content

1. **Go to Admin Dashboard**
   - Visit `your-domain.com/admin`
   - Login with GitHub account

2. **Edit Collections**
   - Click collection (Testimonials, Pricing, Team, FAQ, Home)
   - Edit fields in UI
   - Click **"Save"**

3. **Content Auto-Updates**
   - Changes auto-commit to GitHub
   - Vercel rebuilds site (2-3 mins)
   - Site updates live

## 4. Collections Available

### Home
- Title, Tagline, Disclaimer
- Stats array (value, label)
- Features array (emoji, title, description)
- CTA button text

### Testimonials
- Quote, Author, Role, Stars
- Create/edit/delete testimonial entries

### Pricing
- Tier name, Price, Features list
- CTA text
- Support multiple pricing tiers

### Team
- Name, Role, Bio, Photo
- Upload team member images

### FAQ
- Question/Answer pairs
- Reorderable accordion items

## 5. Authentication

### For GitHub OAuth (Production)
- Users authenticate via GitHub
- Only users with GitHub repo access can edit
- More secure for teams

### Local Testing
- No auth needed
- Use `local_backend: true` in config
- Perfect for dev/testing

## 6. File Locations

```
public/admin/config.yml       ← CMS Configuration
src/pages/admin/index.astro   ← Admin panel page
src/content/                  ← Content collections
  ├── home/
  ├── testimonials/
  ├── pricing/
  ├── team/
  └── faq/
```

## 7. Workflow

**Non-Tech User:**
```
1. Opens domain.com/admin
2. Logs in with GitHub
3. Edits testimonial (e.g., change quote)
4. Clicks Save
5. Change auto-commits to GitHub
6. Vercel rebuilds (automatic)
7. Site updates live in ~2 minutes
```

**Developer:**
No code changes needed - everything stays in git!

## 8. Troubleshooting

**"Cannot authenticate"**
- Ensure GitHub OAuth app is created
- Check Client ID is correct in config.yml
- Verify callback URL matches (https://auth.netlify.com/callback)

**"Changes not saving"**
- Check GitHub repo is public or private access is granted
- Verify user has push access to repo

**"Vercel not rebuilding"**
- Ensure Vercel is connected to GitHub repo
- Check Vercel settings for auto-deploy on push

## 9. Next Steps

1. ✅ Create GitHub OAuth App (steps above)
2. ✅ Update `public/admin/config.yml` with Client ID
3. ✅ Deploy to Vercel
4. ✅ Open `/admin` and test editing a testimonial
5. ✅ Share `/admin` link with your team!

Enjoy managing content without code! 🚀
