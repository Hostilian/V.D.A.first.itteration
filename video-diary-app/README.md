# Video Diary App

A React Native mobile application that allows users to import videos, crop specific 5-second segments, add metadata, and save them for future reference.

![Video Diary App Screenshots](./screenshots.png)

## Features

- **Import Videos**: Select videos from your device
- **Crop Videos**: Create precise 5-second segments using an interactive scrubber
- **Add Metadata**: Include a name and description for each video entry
- **Video Library**: Browse and play your saved video diary entries
- **Persistent Storage**: All video entries persist between app sessions

## Tech Stack

- **Expo**: React Native development framework
- **Expo Router**: File-based navigation system
- **Zustand**: State management with persistent storage
- **TanStack Query**: Asynchronous state management
- **SQLite**: Local database for structured data storage
- **Expo Video**: Video playback capabilities
- **React Native Reanimated**: Advanced animations
- **TypeScript**: Type safety throughout the application

## Installation

### Prerequisites

- Node.js (v16 or newer)
- npm or Yarn
- Expo CLI (`npm install -g expo-cli`)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/video-diary-app.git
   cd video-diary-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Run on a device or emulator:























































This project is licensed under the MIT License - see the LICENSE file for details.## License5. Open a Pull Request4. Push to the branch (`git push origin feature/amazing-feature`)3. Commit your changes (`git commit -m 'Add some amazing feature'`)2. Create your feature branch (`git checkout -b feature/amazing-feature`)1. Fork the repository## Contributing```└── utils/                  # Utility functions├── store/                  # Zustand state management│   └── web/                # Web specific implementations├── lib/                    # Platform-specific code├── hooks/                  # Custom React hooks├── database/               # SQLite setup and queries├── constants/              # App constants and theme├── components/             # Reusable UI components├── assets/                 # App icons and images│       └── crop.tsx        # Video cropping workflow│       ├── [id].tsx        # Video details screen│   └── video/              # Video-related screens│   ├── index.tsx           # Home/video list screen│   ├── _layout.tsx         # Main navigation layout├── app/                    # Expo Router screens
video-diary-app/```## Project Structure- Delete the entry if needed- See the name, description, and other details- View the cropped video with playback controls### Video Details4. **Save**: Your cropped video is saved to your diary3. **Add Details**: Enter a name and description2. **Crop Video**: Use sliders to select a 5-second segment1. **Select Video**: Choose a video from your device### Creating a New Entry- Use the + button to create a new entry- Tap on an entry to view its details- Browse your saved video diary entries### Main Screen## Usage Guide   - Press 'i' for iOS simulator   - Press 'a' for Android emulator   - Scan the QR code with Expo Go app (Android) or Camera app (iOS)
