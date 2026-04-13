# Pomar na Mão 🍎🌳

<p align="center">
  <strong>A mobile farm management application for agricultural inspections and plant geolocation.</strong>
</p>

<p align="center">
  <a href="https://expo.dev">
    <img src="https://img.shields.io/badge/Built%20with-Expo-4630EB.svg?style=flat-square&logo=expo" alt="Built with Expo" />
  </a>
  <img src="https://img.shields.io/badge/TypeScript-5.9+-3178C6.svg?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?style=flat-square&logo=react" alt="React Native" />
</p>

---

## 📱 Overview

**Pomar na Mão** is a comprehensive mobile application designed for farmers and agricultural professionals to efficiently manage their orchards and farms. The app enables field inspectors to perform plant inspections using GPS-based geolocation, track the health status of plants, and synchronize data both online and offline.

### Key Features

- 🌐 **Geolocation-Based Inspections** - Locate and identify plants using GPS coordinates on interactive maps
- 📋 **Inspection Routines** - Create, manage, and complete systematic plant inspections
- 🔄 **Offline/Online Sync** - Work offline with local SQLite storage and sync when connected
- ✅ **Approval Workflows** - Submit inspections for manager approval
- 📊 **Field Work Management** - Track and manage agricultural field activities
- 👥 **User Authentication** - Secure login system with Supabase backend
- 🗺️ **Interactive Maps** - Visualize plants and inspection routes with map markers
- 🌱 **Plant Information Management** - Comprehensive plant data tracking including variety, mass, life cycle, and planting dates
- 📝 **Occurrence Tracking** - Detailed tracking of plant health issues and environmental factors
- 📱 **Dual-Tab Modal Interface** - Intuitive plant data management with separate tabs for occurrences and information
- 🗓️ **Date Management** - Advanced date handling for planting schedules and growth tracking
- 🔄 **Real-time Data Updates** - Live synchronization of plant data changes across the system
- 🎯 **Enhanced Plant Inspection** - Advanced inspection workflows with detailed plant health monitoring
- 📊 **Comprehensive Data Validation** - Robust form validation using Zod schemas for data integrity
- 🌈 **Dynamic UI Components** - Reusable, theme-aware UI components with consistent styling
- 🔄 **Advanced State Management** - Sophisticated state management for complex inspection workflows

---

## 🆕 Recent Features & Improvements

### Plant Data Management System

- **Dual-Tab Interface**: Seamlessly switch between plant occurrences and information management
- **Comprehensive Plant Tracking**: Monitor variety, mass, life cycle, planting dates, and detailed descriptions
- **Advanced Occurrence Tracking**: Track 18+ different plant health issues and environmental factors
- **Real-time Data Validation**: Zod-powered form validation ensures data integrity

### Enhanced User Interface

- **Dynamic Modal System**: Contextual plant data management with intuitive tab navigation
- **Theme-Aware Components**: Consistent styling across all UI elements with light/dark theme support
- **Interactive Form Elements**: Custom dropdowns, date pickers, and multi-line text inputs
- **Responsive Design**: Optimized for various screen sizes and orientations

### Advanced Data Handling

- **Plant Information Schema**: Structured data validation for plant attributes
- **Date Management System**: Sophisticated date handling for planting schedules and growth tracking
- **State Management**: Advanced Zustand-based state management for complex workflows
- **Real-time Updates**: Live synchronization of plant data changes across the application

### Technical Enhancements

- **Type Safety**: Comprehensive TypeScript integration with strict type checking
- **Performance Optimization**: Efficient data handling and rendering optimizations
- **Code Organization**: Clean separation of concerns with modular architecture
- **Developer Experience**: Enhanced debugging and development tools

---

## 🏗️ Architecture

The app follows a **Clean Architecture** pattern with clear separation of concerns:

```
src/
├── app/                    # Expo Router screens & layouts
├── data/                   # Data layer (repositories, services, stores)
│   ├── repositories/       # Data access objects
│   ├── services/           # Business logic services
│   └── store/              # Zustand state management
├── domain/                 # Domain layer (models, schemas)
│   └── models/             # Business entities
├── shared/                 # Shared utilities & constants
│   ├── constants/          # App constants (theme, messages, values)
│   ├── hooks/              # Custom React hooks
│   └── styles/             # Shared styling
├── ui/                     # Presentation layer (UI components)
│   ├── auth/               # Authentication UI
│   ├── inspect-routines/  # Inspection routine components
│   └── shared/             # Reusable UI components
└── utils/                  # Utility functions
    ├── date/               # Date formatting utilities
    ├── geolocation/        # GPS & geometry calculations
    └── plant-data/          # Plant data processing
```

### Technology Stack

| Category             | Technology                        |
| -------------------- | --------------------------------- |
| **Framework**        | Expo SDK 54 + React Native 0.81   |
| **Language**         | TypeScript 5.9                    |
| **Navigation**       | Expo Router 6                     |
| **State Management** | Zustand 5                         |
| **Backend**          | Supabase (Auth + Database)        |
| **Local Storage**    | Expo SQLite                       |
| **Maps**             | React Native Maps                 |
| **Forms**            | React Hook Form + Zod             |
| **HTTP Client**      | TanStack Query                    |
| **Styling**          | StyleSheet + Expo Linear Gradient |
| **Validation**       | Zod Schema Validation             |
| **UI Components**    | Custom Theme-Aware Components     |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android builds)
- Xcode (for iOS builds)
- Supabase project (for backend)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/lucasspeixoto/pomar-na-mao-mobile.git
cd pomar-na-mao-mobile
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure environment variables**

Create an `.env` file with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server**

```bash
npm start
# or
npx expo start
```

5. **Run on device/emulator**

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

---

## 📖 App Screens

### Authentication

- **Login** - Secure user authentication
- **Forgot Password** - Password recovery flow

### Main Features

- **Home** - Dashboard with overview and quick actions
- **Inspections** - View and manage inspection routines
  - Pending inspections
  - Completed inspections
  - In-progress detection
- **Approvals** - Review and approve submitted inspections
- **Sync** - Synchronize offline data with the server
- **Profile** - User settings and logout

### Inspection Workflow

1. **Create Routine** - Start a new inspection routine
2. **Select Plants** - Choose plants based on filters (region, status)
3. **In-Field Detection** - Use GPS to locate and inspect plants
4. **Submit** - Complete and submit for approval
5. **Approval** - Manager reviews and approves inspections

---

## 🛠️ Available Scripts

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm start`       | Start Expo development server |
| `npm run android` | Run on Android                |
| `npm run ios`     | Run on iOS                    |
| `npm run web`     | Run on web                    |
| `npm run lint`    | Run ESLint                    |
| `npm run format`  | Format code with Prettier     |
| `npm run doctor`  | Run Expo doctor               |

---

## 📂 Project Structure

### Routes (Expo Router)

- `/` - Home dashboard
- `/login` - Login screen
- `/forgot-password` - Password recovery
- `/(tabs)/` - Tab navigation
  - `index` - Main home tab
  - `my-farm` - Farm overview
  - `profile` - User profile
- `/(inspect-routine)/` - Inspection workflows
  - `inspect-routine-confirmation-details/` - Review inspection
  - `inspect-routine-in-action-detection/` - Active inspection
  - `inspect-routine-plants-sync-details/` - Sync inspection data
- `/approvals` - Approval queue
- `/field-works` - Field work management
- `/syncs` - Data synchronization

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👨‍💻 Author

**Lucas Peixoto** - [GitHub](https://github.com/lucasspeixoto)

---

<div align="center">
  <sub>Built with ❤️ for modern agriculture</sub>
</div>
