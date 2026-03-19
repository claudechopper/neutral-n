# How to Get Neutral News Live on the Internet

This guide assumes you have never done anything like this before. Every step is spelled out.

You need three accounts (all free to sign up):

1. **GitHub** — to store your code online
2. **Railway** — to run your app on the internet
3. **Google** — to get the AI key that powers the summaries

Total time: about 15–20 minutes. (Add 2 minutes if you want password protection.)

**Note:** You can set a password to keep the site private and only share it with friends. See Part 3B.

---

## PART 1: Get Your Google Gemini API Key

This is the key that lets the app use Google's Gemini AI to summarize news stories.

1. Go to **https://aistudio.google.com/app/apikey**
2. Click **Create API key** (or **+ Create API key** if it's your first one)
3. Select a Google Cloud project (or create a new one if prompted)
4. Google will generate and show you your API key
5. **Copy the key** — it's a long random string
6. Paste it somewhere safe (a notes app, a text file — you'll need it in Part 3)

**Cost note:** Google Gemini charges per API call, but it's cheaper than Claude. This app will cost roughly **$0.05–$0.15/day** depending on how many new stories appear. You'll need to add a payment method in Google Cloud if usage exceeds the free tier.

---

## PART 2: Upload Your Code to GitHub

GitHub is where your code lives online. Railway reads it from there.

### If you've never used GitHub before:

1. Go to **https://github.com** and click **Sign up** (it's free)
2. Confirm your email address
3. Once logged in, click the **+** button in the top-right corner, then **New repository**
4. Name it `neutral-news`
5. Leave it set to **Public** (Railway needs to see it)
6. Check the box that says **Add a README file** — WAIT, actually **uncheck** it. We already have one.
7. Click **Create repository**

You'll see a page with instructions. Now you need to upload the project files.

### Easiest way — upload through the browser:

1. On your new repository page, click **"uploading an existing file"** (it's a blue link in the instructions)
2. Open the `news-app` folder on your computer
3. **Select ALL the files and folders inside it** (not the `news-app` folder itself — the stuff *inside* it)
4. Drag them into the GitHub upload area in your browser
5. Wait for them to upload
6. Scroll down and click the green **Commit changes** button

You should now see all your files listed on the GitHub page (server.js, config.js, public/, etc.).

**Important:** Make sure you see `server.js` at the top level of the repo — NOT inside a subfolder. If you accidentally uploaded the folder itself, the files will be at `news-app/server.js` instead of just `server.js`, and Railway won't find them.

---

## PART 3: Deploy on Railway

Railway runs your app 24/7 on the internet.

1. Go to **https://railway.com** and click **Login** → **Login with GitHub**
2. Authorize Railway to access your GitHub account
3. Once you're in the Railway dashboard, click **New Project**
4. Click **Deploy from GitHub repo**
5. Find and select your `neutral-news` repository
6. Railway will detect it's a Node.js app and start building it automatically

### Add your API key:

7. Click on the service that appeared (it'll be named after your repo)
8. Click the **Variables** tab
9. Click **New Variable**
10. In the left box (name), type: `GOOGLE_API_KEY`
11. In the right box (value), paste the Google API key you copied in Part 1
12. Click **Add**
13. Also add another variable: name = `PORT`, value = `3000`

### Get your public URL:

14. Click the **Settings** tab
15. Scroll down to **Networking**
16. Under **Public Networking**, click **Generate Domain**
17. Railway will give you a URL like `neutral-news-production-xxxx.up.railway.app`
18. **That's your live website.** Click it.

### First scrape:

19. The page will be empty — that's normal, no stories have been fetched yet
20. Click the **"Refresh feeds"** button on the page
21. Wait 30–60 seconds (it's fetching news and running each through AI)
22. Stories will appear on the page

From now on, the app will automatically scrape at 6 AM, 11 AM, and 6 PM Eastern every day.

---

## PART 3B: Add Password Protection (Optional)

If you want to keep the site private so only people you share the password with can access it:

1. On the Railway dashboard, click on your service
2. Click the **Variables** tab
3. You should already have `GOOGLE_API_KEY` and `PORT` there
4. Click **New Variable** twice to add:
   - Name: `APP_USERNAME`, Value: `reader` (or any username you want)
   - Name: `APP_PASSWORD`, Value: `mysecretpassword123` (use something strong)
5. Click **Add** for each one

Now when anyone tries to access your Railway URL, they'll see a login popup asking for username and password. They need both to get in.

**Username:** `reader` (or whatever you set)
**Password:** `mysecretpassword123` (or whatever you set)

Share the username and password with friends, but keep the URL secret so only people you give both credentials to can access it.

**To remove password protection later:** Just delete the `APP_PASSWORD` variable from Railway. The site becomes public again.

---

## PART 4: You're Done

Bookmark your Railway URL. That's your news page. It updates three times a day automatically.

### Costs to expect:

- **Railway**: Free tier gives you $5/month of usage. This app is lightweight and should stay within that. If it goes over, Railway's hobby plan is $5/month.
- **Google Gemini API**: Roughly $1.50–$4.50/month depending on news volume (much cheaper than Claude). Check your usage at https://console.cloud.google.com/ under Billing.

### If something breaks:

- **No stories appearing?** Click "Refresh feeds" manually. Check Railway logs (click your service → Deployments → click the latest → View Logs) for error messages.
- **API errors?** Your Google key might be invalid or out of credits. Check https://console.cloud.google.com/ under Billing.
- **Twitter/Rhonda Patrick section empty?** The Nitter RSS mirrors might be down. This is expected — those are community services. The other three categories will still work fine.

---

## Quick Reference

| What | Where |
|---|---|
| Your live site | Your Railway URL (from step 17) |
| Server logs | Railway dashboard → your service → Deployments → View Logs |
| Change settings | Edit `config.js` on GitHub, Railway auto-redeploys |
| Anthropic billing | https://console.anthropic.com/ → Billing |
| Railway billing | https://railway.com → Account → Billing |
