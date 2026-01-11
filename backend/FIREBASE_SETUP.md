# Firebase Setup Guide

This guide will help you set up Firebase for the Tangier Pharmacy Guard API.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "tangier-pharmacy-guard")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Enable Realtime Database

1. In the Firebase Console, select your project
2. Click on "Realtime Database" in the left sidebar
3. Click "Create Database"
4. Choose a location (select the one closest to Morocco, e.g., europe-west1)
5. Start in **test mode** for development (you can change this later)
6. Click "Enable"

## Step 3: Get Firebase Admin SDK Credentials

1. In the Firebase Console, click on the gear icon ⚙️ (Project Settings)
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. A JSON file will be downloaded - keep this file secure!

The downloaded JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Step 4: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Edit the `.env` file and fill in the values from the downloaded JSON file:

```env
# From the JSON file
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Construct the database URL
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

### Important Notes:

- **FIREBASE_PRIVATE_KEY**: Must be wrapped in double quotes and keep the `\n` characters as-is
- **FIREBASE_DATABASE_URL**: Replace `your-project-id` with your actual project ID
  - The format depends on your database location:
    - US: `https://your-project-id-default-rtdb.firebaseio.com`
    - Europe: `https://your-project-id-default-rtdb.europe-west1.firebasedatabase.app`
    - Asia: `https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app`

## Step 5: Set Database Rules (Optional - For Production)

For development, test mode rules are fine. For production, update your database rules:

1. In Firebase Console, go to "Realtime Database"
2. Click on the "Rules" tab
3. Replace the rules with:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "pharmacies": {
      ".read": true,
      ".write": false
    }
  }
}
```

This allows:
- Public read access to pharmacies (for the mobile app)
- No public write access (only the backend can write via Admin SDK)

## Step 6: Verify Setup

1. Start the development server:
```bash
npm run dev
```

2. Check the console output - you should see:
```
✅ Firebase initialized successfully
```

3. Test the scraper to populate initial data:
```bash
curl -X POST http://localhost:3000/api/pharmacies/scrape
```

4. Check your Firebase Console - you should see data under "Realtime Database"

## Troubleshooting

### Error: "PERMISSION_DENIED"
- Check that your database rules allow the Admin SDK to write
- In test mode, rules should be:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Error: "Invalid credential"
- Verify that `FIREBASE_PRIVATE_KEY` is correctly formatted with quotes
- Ensure there are no extra spaces or newlines in your `.env` file
- The private key should include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Error: "Cannot find database"
- Check that `FIREBASE_DATABASE_URL` matches your actual database URL
- Go to Firebase Console → Realtime Database to see the correct URL
- Make sure you've created the Realtime Database (not Firestore)

### Firebase Console shows no data after scraping
- Check server logs for scraping errors
- The scraper might be failing to fetch data from the source website
- Try running the scraper manually: `POST /api/pharmacies/scrape`
- Check that the source website is accessible

## Security Best Practices

1. **Never commit the `.env` file or service account JSON to Git**
   - The `.gitignore` file already excludes these files
   - Never share these credentials publicly

2. **Use environment-specific credentials**
   - Development: One Firebase project
   - Production: Separate Firebase project

3. **Rotate credentials periodically**
   - Generate new service account keys every few months
   - Delete old keys from Firebase Console

4. **Use proper database rules in production**
   - Never use test mode rules in production
   - Implement proper read/write restrictions

## Alternative: Using Service Account JSON File

Instead of using environment variables, you can use the service account JSON file directly:

1. Save the downloaded JSON file as `serviceAccountKey.json` in the backend directory
2. Update `src/services/firebase.ts`:

```typescript
import * as serviceAccount from '../serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
```

3. Make sure `serviceAccountKey.json` is in `.gitignore`

However, using environment variables (as implemented) is more flexible for deployment.

## Next Steps

After setting up Firebase:

1. Test all API endpoints
2. Set up the scheduled scraper
3. Deploy to production
4. Configure production database rules
5. Set up monitoring and alerts

For deployment instructions, see the main [README.md](README.md).
