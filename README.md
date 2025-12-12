# 🌤️ Weather App

A beautiful, modern weather application built with **React Native** and **Expo**. Features a stunning glassmorphism UI design with real-time weather data, hourly forecasts, and air quality information.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/NativeWind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 📍 **GPS Location Detection** - Automatically fetches weather for your current location
- 🔍 **City Search** - Search weather for any city worldwide (including small villages!)
- 🌡️ **Real-time Weather** - Temperature, humidity, pressure, wind speed
- ⏰ **24-Hour Forecast** - Hourly weather predictions with icons
- 🌅 **Sunrise & Sunset** - Daily sun timings
- 🌙 **Day/Night Mode** - Dynamic UI based on local time
- 💨 **Air Quality Index** - AQI, PM2.5, and PM10 readings
- 🎨 **Modern UI** - Glassmorphism design with dynamic backgrounds

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/weather-app.git
   cd weather-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Scan the QR code** with Expo Go (Android) or Camera app (iOS)

## 🛠️ Built With

- **[React Native](https://reactnative.dev/)** - Cross-platform mobile framework
- **[Expo](https://expo.dev/)** - Development platform
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[NativeWind](https://www.nativewind.dev/)** - TailwindCSS for React Native
- **[Open-Meteo API](https://open-meteo.com/)** - Free weather data (no API key needed!)
- **[Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)** - GPS functionality
- **[Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** - Gradient overlays

## 📱 APIs Used

| API | Purpose | Key Required |
|-----|---------|--------------|
| [Open-Meteo Weather](https://open-meteo.com/) | Weather data | ❌ No |
| [Open-Meteo Air Quality](https://open-meteo.com/) | AQI data | ❌ No |
| [Open-Meteo Geocoding](https://open-meteo.com/) | City search | ❌ No |
| [Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org/) | Reverse geocoding | ❌ No |

## 📂 Project Structure

```
weather-app/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Main weather screen
│   │   └── explore.tsx
│   ├── _layout.tsx
│   └── modal.tsx
├── components/
├── constants/
├── hooks/
├── assets/
├── app.json
├── package.json
└── tailwind.config.js
```

## 📦 Building for Production

### Android APK (for sharing/testing)
```bash
eas build -p android --profile preview
```

### Android AAB (for Play Store)
```bash
eas build -p android --profile production
```

### iOS (requires Apple Developer Account - $99/year)
```bash
eas build -p ios --profile production
```

## 🤝 Contributing

Contributions are welcome! Feel free to fork and submit a PR.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Weather data by [Open-Meteo](https://open-meteo.com/)
- Icons by [Ionicons](https://ionic.io/ionicons)
- Background images from [Unsplash](https://unsplash.com/)

---

⭐ **Star this repo if you found it helpful!**
