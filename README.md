# Capstone App

A mobile application built with React Native and Expo for personal finance management.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Expo Go app on your mobile device
- A mobile device (iOS or Android)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd plutus-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open the Expo Go app on your mobile device and scan the QR code that appears in your terminal.

## Features

- Personal finance tracking
- Budget management
- Transaction history
- Secure authentication
- Cross-platform support (iOS and Android)

## Tech Stack

- React Native
- Expo
- TypeScript
- Supabase (Backend)
- NativeWind (Styling)

## Development

- `npm start` - Start the development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser
- `npm test` - Run tests
- `npm run lint` - Run linter

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Roboflow API Key
EXPO_PUBLIC_ROBOFLOW_API_KEY=your_roboflow_api_key

# Google Gemini API Key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the 0BSD License - see the LICENSE file for details.
