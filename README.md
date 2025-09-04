# Plutus - AI-Powered Antique & Collectible Valuation App

<div align="center">
  <img src="app/assets/images/CAPSTONE.png" alt="Plutus Logo" width="200"/>
  
  **Transform your smartphone into a professional antique appraiser**
  
  [![React Native](https://img.shields.io/badge/React_Native-0.76.7-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-52.0.37-000020?logo=expo&logoColor=white)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.49.1-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
</div>

##  Project Overview

**Plutus** is a cutting-edge mobile application that leverages computer vision and artificial intelligence to provide instant valuations for antiques, collectibles, and vintage items. Simply point your camera at an item, and our AI-powered system will identify, analyze, and provide detailed valuation insights.

### Why Plutus?

The antique and collectibles market is worth over $200 billion globally, yet most people have no way to accurately assess the value of items they own or encounter. Traditional appraisals are expensive, time-consuming, and often inaccessible. Plutus democratizes this process by putting professional-grade valuation tools directly in users' pockets.

## 📂 Supporting Materials

For a deeper look into the project beyond the codebase:

- [📑 Final Report](docs/Final%20Report%20-%20Capstone%20Final.pdf) – Comprehensive write-up detailing the methodology, data pipeline, modeling approach, and evaluation.
- [🎤 Stakeholder Presentation](docs/Capstone%20Stakeholder%20Presentation.pdf) – Slide deck presented to stakeholders, highlighting business value, technical solution, and next steps.
- [🖼️ Project Poster](docs/Capstone%20Final%20Poster.pdf) – One-page visual summary of the project for quick understanding.

## ✨ Key Features

### 🔍 **Smart Item Recognition**
- **Computer Vision**: Advanced object detection using Roboflow's custom-trained models
- **Multi-Category Support**: Furniture, jewelry, artwork, ceramics, and more
- **Real-time Processing**: Instant identification with confidence scoring

### 🤖 **AI-Powered Valuation**
- **Google Gemini Integration**: Sophisticated price estimation using large language models
- **Contextual Analysis**: Considers material, era, condition, and provenance
- **Confidence Metrics**: Transparent accuracy indicators for each valuation

### 📊 **Comprehensive Analysis**
- **Detailed Reports**: Material composition, historical period, and cultural significance
- **Market Insights**: Current market trends and comparable sales data
- **Professional Documentation**: Export-ready reports for insurance or sales

### 📱 **Intuitive User Experience**
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Scan History**: Track and manage all your appraisals
- **Offline Capability**: Core features work without internet connectivity

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React Native 0.76.7** with Expo 52.0.37 for cross-platform development
- **TypeScript** for type-safe development
- **NativeWind** for utility-first styling
- **React Navigation** for seamless screen transitions
- **React Native Reanimated** for smooth animations

### **Backend & Services**
- **Supabase** for database, authentication, and file storage
- **Roboflow API** for computer vision and object detection
- **Google Gemini API** for AI-powered valuation analysis
- **Expo Camera** for native camera integration

### **Key Integrations**
```typescript
// Computer Vision Pipeline
Camera → Roboflow Detection → Item Classification → Metadata Retrieval

// AI Valuation Pipeline  
Item Data → Gemini Analysis → Price Estimation → Confidence Scoring

// Data Flow
Image Upload → Supabase Storage → Database Logging → Results Display
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app (for mobile testing)
- iOS/Android device or simulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/plutus-app.git
   cd plutus-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Services
   EXPO_PUBLIC_ROBOFLOW_API_KEY=your_roboflow_api_key
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device**
   - Scan the QR code with Expo Go (iOS/Android)
   - Or use `npm run ios` / `npm run android` for simulators

## 🔧 Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run in web browser
npm test           # Run test suite
npm run lint       # Run ESLint
```

## 😊 Key Achievements

- **Multi-AI Integration**: Successfully integrated Roboflow computer vision with Google Gemini for comprehensive analysis
- **Real-time Processing**: Achieved sub-3-second response times for item identification
- **Cross-platform**: Single codebase supporting iOS, Android, and web platforms
- **Scalable Architecture**: Modular design supporting easy feature additions
- **Professional UI**: Polished interface with smooth animations and intuitive navigation

## 🔮 Future Enhancements

- **Machine Learning Improvements**: Custom model training for better accuracy
- **Social Features**: Community sharing and expert verification
- **Marketplace Integration**: Direct connection to auction houses and dealers
- **AR Features**: Augmented reality for item placement and visualization
- **Advanced Analytics**: Market trend analysis and investment insights

## 📊 Technical Metrics

- **Response Time**: < 3 seconds for complete analysis
- **Accuracy Rate**: 85%+ for common antique categories
- **Platform Support**: iOS, Android, Web
- **Bundle Size**: < 50MB optimized build
- **API Integration**: 3 external services seamlessly integrated

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Capstone Project Team** - [ASU | Master of Science in Artificial Intelligence and Business]
- **Surosh Kumar** - Full Stack Developer & AI Integration Lead
- **Madeline Kaufman** - Full Stack Developer & AI Integration Lead
- **Tyler Lai** - AI and Business Consultant & Researcher
- **Patrick Richey** - AI and Business Consultant & Researcher
- **M.T. Wilson** - AI and Business Consultant & Researcher

