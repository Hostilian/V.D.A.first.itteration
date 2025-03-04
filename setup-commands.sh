# Create a new Expo project with TypeScript template
npx create-expo-app@latest video-diary-app --template typescript

# Navigate to the project directory
cd video-diary-app

# Install core dependencies
npm install expo-router @tanstack/react-query zustand expo-av
npm install expo-image-picker expo-file-system
npm install @react-native-async-storage/async-storage
npm install expo-sqlite react-native-reanimated
npm install @react-native-community/slider
npm install nativewind tailwindcss@3.3.2 --save-dev

# Install required Expo libraries
npx expo install expo-linking expo-constants expo-status-bar
npx expo install react-native-safe-area-context react-native-screens
npx expo install react-native-gesture-handler

# Create required directories
mkdir -p app/video components store hooks utils constants database lib/web
mkdir -p services/ffmpeg
