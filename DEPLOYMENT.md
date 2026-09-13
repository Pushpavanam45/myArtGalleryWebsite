# Deployment Guide for Spade Arts Art Gallery

This guide explains how to deploy your application to Vercel (Frontend) and Render (Backend) for free.

## 1. Cloudinary Setup (Persistent Image Storage)
Render's free tier deletes local files every time the server restarts. We use Cloudinary to store artwork images permanently.

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account.
2. In your Dashboard, find your **Cloud Name**, **API Key**, and **API Secret**.
3. You will need these for the Render backend environment variables.

## 2. GitHub Preparation
1. Ensure your code is pushed to your GitHub repository.
2. Ensure you haven't accidentally committed your `.env` files or Firebase `serviceAccountKey.json`. (Our `.gitignore` protects them, but double-check).

## 3. Backend Deployment (Render)
1. Go to [Render](https://render.com/) and create a free account.
2. Click **New** -> **Web Service**.
3. Connect your GitHub account and select this repository.
4. Set the following configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Click **Advanced** and add these Environment Variables:
   - `FRONTEND_URL`: (You will fill this in *after* Vercel deployment, e.g., `https://spade-arts.vercel.app`)
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: The single-line JSON string you generated locally.
   - `CLOUDINARY_CLOUD_NAME`: From Cloudinary.
   - `CLOUDINARY_API_KEY`: From Cloudinary.
   - `CLOUDINARY_API_SECRET`: From Cloudinary.
   - `BREVO_API_KEY`: Your Brevo API Key.
   - `BREVO_SENDER_EMAIL`: Your Brevo verified sender.
   - `BREVO_SENDER_NAME`: Spade Arts
   - `BREVO_RECEIVER_EMAIL`: spadearts45@gmail.com
6. Click **Create Web Service**.
7. Once deployed, copy the Render URL (e.g., `https://spade-arts-backend.onrender.com`).

## 4. Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com/) and create a free account.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Expand **Environment Variables** and add:
   - `VITE_BACKEND_URL`: The Render URL you copied in step 3 (e.g., `https://spade-arts-backend.onrender.com`). *Important: Do not add a trailing slash.*
   - *(Add any `VITE_FIREBASE_*` variables if you are not hardcoding them).*
5. Click **Deploy**.
6. Once deployed, copy your Vercel domain (e.g., `https://spade-arts.vercel.app`).

## 5. Final Connections
1. **Update Render CORS**: Go back to your Render Dashboard -> Environment Variables, and set `FRONTEND_URL` to your Vercel domain.
2. **Update Firebase Auth**: Go to Firebase Console -> Authentication -> Settings -> Authorized Domains. Add your Vercel domain so admin login works in production.

## 6. Testing
1. Visit your Vercel domain.
2. Test the Contact form.
3. Log in to `/admin/login` and try uploading an artwork. It should now save to Cloudinary and display in your public gallery!
