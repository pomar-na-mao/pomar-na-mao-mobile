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

**Pomar na Mão** is a comprehensive mobile application designed for farmers and agricultural professionals to efficiently manage their orchards and farms. The app enables field inspectors to perform plant inspections using GPS-based geolocation and track the health status of plants.

### Key Features

- 🌐 **Geolocation-Based Inspections** - Locate and identify plants using GPS coordinates on interactive maps
- 📋 **Inspection Routines** - Create, manage, and complete systematic plant inspections
- 🚜 **Field Work Management** - Track and manage agricultural field activities
- 🗺️ **Interactive Maps** - Visualize plants and inspection routes with map markers
- 🌱 **Plant Information Management** - Comprehensive plant data tracking including variety, mass, life cycle, and planting dates
- 📝 **Occurrence Tracking** - Detailed tracking of plant health issues and environmental factors
- 📱 **Dual-Tab Modal Interface** - Intuitive plant data management with separate tabs for occurrences and information
- 🎯 **Enhanced Plant Inspection** - Advanced inspection workflows with detailed plant health monitoring
- 📊 **Comprehensive Data Validation** - Robust form validation using Zod schemas for data integrity
- 🌈 **Dynamic UI Components** - Reusable, theme-aware UI components with consistent styling

---

## 🏗️ Architecture

The app follows a modular architecture with clear separation of concerns:

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
│   ├── themes/             # Theme definitions
│   ├── constants/          # App constants (theme, messages, values)
│   └── styles/             # Shared styling
├── ui/                     # Presentation layer (UI components)
│   ├── add-plant/          # Plant addition components
│   ├── inspect-annotation/ # Annotation components
│   ├── inspect-routines/   # Inspection routine components
│   └── shared/             # Reusable UI components
└── utils/                  # Utility functions
    ├── date/               # Date formatting utilities
    ├── geolocation/        # GPS & geometry calculations
    └── plant-data/         # Plant data processing
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
- npm
- Expo CLI

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/lucasspeixoto/pomar-na-mao-mobile.git
cd pomar-na-mao-mobile
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create an `.env` file with your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. **Start the development server**

```bash
npm start
```

---

## 📂 Project Structure

### Routes (Expo Router)

- `/` - Home dashboard
- `/add-plant` - Add new plant to the orchard
- `/field-works` - Field work management
- `/inspect-annotation` - Detailed plant annotation
- `/inspect-routine` - Inspection routine management
- `/(inspect-routine)/inspect-routine-in-action-detection/[id]` - Active inspection workflow

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
