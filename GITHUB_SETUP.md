# 🚀 How to Build APK using GitHub Actions

Follow these simple steps to get your Ludo game APK built automatically:

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click "New Repository" 
3. Name it `ludo-game` (or any name you prefer)
4. Make it **Public** (free GitHub Actions)
5. Click "Create Repository"

## Step 2: Upload Your Code

### Option A: Using GitHub Web Interface
1. On your new repository page, click "uploading an existing file"
2. Drag and drop all files from your `game` folder
3. Write commit message: "Initial Ludo game setup"
4. Click "Commit changes"

### Option B: Using Git Commands
```bash
# Navigate to your game folder
cd "c:\Users\Muhammad Ali Hussain\Desktop\game"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial Ludo game setup"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/ludo-game.git

# Push to GitHub
git push -u origin main
```

## Step 3: Automatic APK Build

Once you push the code:

1. **GitHub Actions will start automatically**
2. Go to your repository → **Actions** tab
3. You'll see "Build Android APK" workflow running
4. Wait 5-10 minutes for build to complete
5. Download the **ludo-game-apk** artifact

## Step 4: Install APK

1. Extract the downloaded zip file
2. Transfer `app-release.apk` to your Android device
3. Enable "Install from Unknown Sources" in settings
4. Install the APK and enjoy your Ludo game!

## 🔄 Updating Your Game

Every time you push changes to GitHub, a new APK will be built automatically!

```bash
# Make changes to your code
# Then commit and push
git add .
git commit -m "Updated game features"
git push
```

## 📱 Share Your Game

Your APK will be ready for sharing with friends and family!

## ⚠️ Important Notes

- Make sure your repository is **Public** for free GitHub Actions
- The build process takes 5-10 minutes
- APK artifacts are available for 90 days
- Each push triggers a new build automatically

## 🎯 Success!

Your Ludo game will now build into an APK automatically every time you update the code on GitHub!
