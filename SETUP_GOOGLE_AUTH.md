# How to Get Your Google Client ID (Expo Go Friendly)

Since you are likely using **Expo Go**, you only need a **Web Client ID**. This is easier and works on both Android and iOS during testing.

### 1. Create a Project (If you haven't)
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `Aariv App`.

### 2. Configure Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** > **Create**.
3. Fill in App Name ("Aariv"), Support Email, and Developer Email.
4. Click **Save** until finished.

### 3. Create Credentials (Web Client ID)
1. Go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials > OAuth client ID**.
3. Application type: **Web application**.
4. Name: `Aariv Web Auth`.
5. **Important**: Under **Authorized redirect URIs**, add these:
   - `https://auth.expo.io/@your-username/aariv`
   - *(Replace `your-username` with your Expo username. If you don't know it, run `npx expo whoami` or check your Expo profile)*.
6. Click **Create**.

### 4. Paste the ID
Copy the **Client ID** (ends in `...apps.googleusercontent.com`) and paste it here.

I will set it up so it works on your phone immediately.
