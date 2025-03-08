# Time Overflow

A productivity-focused time logging app that helps you track and optimize your daily activities.
The app is published in Google Play Store.
https://play.google.com/store/apps/details?id=com.timeoverflow.app

## About

Time Overflow is designed to help you understand and improve how you spend your time. By logging your daily activities, you can:

- Track time spent on different tasks
- Set daily targets for activities
- Visualize your time allocation
- Make data-driven decisions to boost productivity

## Features

- Simple and intuitive time logging interface
- Customizable daily targets
- Historical data tracking
- Visual analytics of time usage
- Offline support with local data storage

## Getting Started

1. Install dependencies:
```bash
npm install
npx expo start

## Expo vector icons

Kindly check this link for ionicons list. https://icons.expo.fyi/Index

## EAS build commands

Kindly check https://docs.expo.dev/build/setup/ for more information
before each build: 
npx expo prebuild --clean 
Then update app.json versionName to new version if you want to generate unique production build
- `eas build --platform android`
- `eas build --platform ios`
- `eas build:configure` `npx expo prebuild`

For clean build
cd android && ./gradlew clean && cd ..
rm -rf node_modules
npm install
npx expo prebuild --clean

Development builds
`eas build -p android --profile preview`

## Tech Stack
React Native with Expo
AsyncStorage for local data persistence
TypeScript for type safety
Kotlin for Android native components

## Contributing
Contributions are welcome! Feel free to submit issues and pull requests.

## License
This project is licensed under the MIT License.
