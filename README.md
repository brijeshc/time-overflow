# Welcome to Time Overflow

This is a React Native [Expo](https://expo.dev) project.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Expo vector icons

Kindly check this link for ionicons list. https://icons.expo.fyi/Index

## EAS build commands

Kindly check https://docs.expo.dev/build/setup/ for more information
before each build: clean cd android
./gradlew clean
cd ..
- `eas build --platform android`
- `eas build --platform ios`
- `eas build:configure` `npx expo prebuild`
`eas build -p android --profile preview`

For clean build
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
npx expo prebuild --clean


- `eas build --profile development --platform ios`
