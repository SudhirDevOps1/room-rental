# RoomRental / NestFinder

Find rooms near you or list your space. A location-based room rental marketplace built with React, Vite, Tailwind CSS, Firebase, Leaflet maps, realtime requests and chat.

## A. Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy environment template:

```bash
cp .env.example .env
```

3. Fill `.env` with Firebase web app values:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start dev server:

```bash
npm run dev
```

5. Production build:

```bash
npm run build
```

If env keys are missing, the app does not go blank. It shows a clear Firebase warning and runs in local demo sync mode.

## B. Firebase Project Setup

1. Go to https://console.firebase.google.com
2. Create a project, for example `RoomRental`.
3. Open `Project settings` then add a Web App.
4. Copy the Firebase config values into `.env` locally and into Vercel/Cloudflare variables for production.
5. Enable Authentication.
6. Enable Phone provider in Authentication > Sign-in method.
7. Add your production domains in Authentication > Settings > Authorized domains.
8. Create Firestore Database.
9. Create Firebase Storage.
10. Add Firestore and Storage rules from this README.

## C. Vercel Environment Variables

In Vercel Dashboard, open Project > Settings > Environment Variables and add these exact variables.

| Variable | Example | Notes |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | `AIza...` | Firebase web API key. Safe for client apps, but restrict domain in Firebase/GCP. |
| `VITE_FIREBASE_AUTH_DOMAIN` | `roomrental.firebaseapp.com` | From Firebase config. |
| `VITE_FIREBASE_PROJECT_ID` | `roomrental` | Firestore project id. |
| `VITE_FIREBASE_STORAGE_BUCKET` | `roomrental.appspot.com` | Storage bucket. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1234567890` | Sender id. |
| `VITE_FIREBASE_APP_ID` | `1:...:web:...` | Firebase app id. |

After adding variables, redeploy the project. Vite only reads environment variables at build time.

## D. GitHub + Vercel Deployment

```bash
git init
git add .
git commit -m "production room rental marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/room-rental.git
git push -u origin main
```

Then in Vercel:

1. Click `Add New Project`.
2. Import the GitHub repository.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add the six `VITE_FIREBASE_*` variables above.
7. Deploy.

This repo includes `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## E. Cloudflare Pages Environment Variables

Cloudflare Pages:

1. Go to Cloudflare Dashboard > Workers & Pages.
2. Create application > Pages > Connect to Git.
3. Select repository.
4. Build command: `npm run build`.
5. Build output directory: `dist`.
6. Go to Settings > Environment variables.
7. Add all six `VITE_FIREBASE_*` values for Production and Preview.
8. Redeploy.

SPA routing is handled by `public/_redirects`:

```txt
/* /index.html 200
```

### Cloudflare Worker Note

Do not put Firebase client keys inside Worker secrets unless the Worker is acting as a backend. For this Vite frontend, set them in Cloudflare Pages environment variables. If you later add a Worker API, use Worker secrets only for private server-only keys such as admin SDK credentials, never expose private keys in frontend code.

## F. Firestore Rules

Copy into Firebase Console > Firestore Database > Rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }

    match /users/{userId} {
      allow read: if signedIn();
      allow create, update: if signedIn() && request.auth.uid == userId;
    }

    match /rooms/{roomId} {
      allow read: if true;
      allow create: if signedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if signedIn() && resource.data.ownerId == request.auth.uid;
    }

    match /requests/{requestId} {
      allow create: if signedIn() && request.resource.data.seekerId == request.auth.uid;
      allow read, update: if signedIn() &&
        (resource.data.seekerId == request.auth.uid || resource.data.ownerId == request.auth.uid);
    }

    match /chats/{chatId} {
      allow read, write: if signedIn() && request.auth.uid in resource.data.participants;

      match /messages/{messageId} {
        allow read, create: if signedIn();
      }
    }
  }
}
```

## G. Storage Rules

Copy into Firebase Console > Storage > Rules:

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /rooms/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## H. Blank Screen Troubleshooting

Most blank screens happen because environment variables are missing or named incorrectly.

Check these items:

1. Variable names must start with `VITE_` exactly.
2. Use `VITE_FIREBASE_API_KEY`, not `FIREBASE_API_KEY`.
3. Add variables in Vercel/Cloudflare for the correct environment, usually Production.
4. Redeploy after changing variables.
5. Open browser console. The app logs missing Firebase variables clearly.
6. Add your deployed domain in Firebase Authentication authorized domains.
7. Enable Firestore, Storage and Phone Auth in Firebase.

The app also includes an Error Boundary in `src/main.tsx` so startup failures show a useful message instead of a blank screen.

## I. How to Test Full Flow After Deployment

1. Open the deployed URL.
2. Use the demo account banner or sign in with custom demo OTP `123456`.
3. Search by any location: `Bhabua, Kaimur, Bihar`, `Patna`, `Delhi`, `Koramangala`.
4. Click `Use My Location / Near Me` to sort by distance.
5. Open a room detail page and send a rental request.
6. Switch to an owner demo account from the top test menu.
7. Open My Listings > Tenant Applications.
8. Accept the request.
9. Go to Inbox and verify realtime chat and last message preview.
10. Mark a room as rented and confirm it disappears from search results.

## Custom Location Feature

The app no longer forces fixed city dropdowns. Search and room registration accept any India/global text location, such as:

- `Bhabua, Kaimur, Bihar`
- `Mohania, Bihar`
- `Varanasi, Uttar Pradesh`
- `Village name + District + State`
- `Any city or locality in India`

Known cities use built-in coordinates. Unknown places are resolved using OpenStreetMap Nominatim when possible. If geocoding fails, text search still works by city, ward, landmark, state and pincode.

## Security Notes

Firebase web API keys are not secret like server keys. They are meant to be used in client apps, but you must protect your app with:

- Firebase Auth authorized domains
- Firestore rules
- Storage rules
- Google Cloud API key restrictions by HTTP referrer
- Never commit `.env` with real keys

## Build Status

Use this before deployment:

```bash
npm run build
```

The latest verified build completed successfully.