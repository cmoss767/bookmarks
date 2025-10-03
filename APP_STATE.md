# Markd App - Current State

## Overview
**Markd** is a React Native iOS bookmark management app that allows users to save URLs from other apps using the native iOS Share Sheet. The app features a freemium model with a 7-day trial and subscription-based monetization.

## App Architecture

### Technology Stack
- **Framework**: React Native 0.80.1
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **Storage**: AsyncStorage + App Groups for data sharing
- **Notifications**: @notifee/react-native
- **Platform**: iOS (with Android support in development)

### Hybrid Architecture
The app uses a unique hybrid architecture combining React Native with native iOS capabilities:

1. **Main App**: React Native application for UI and bookmark management
2. **Share Extension**: Native iOS Share Extension (Swift) for capturing URLs from other apps
3. **Data Bridge**: App Groups for sharing data between the main app and extension

## Current Features

### Core Functionality
- ✅ **Bookmark Saving**: Save URLs from any app via iOS Share Sheet
- ✅ **Bookmark Management**: View, open, and delete saved bookmarks
- ✅ **Daily Notifications**: Random bookmark reminders at 9 AM
- ✅ **Trial System**: 7-day free trial for new users
- ✅ **Subscription Model**: $9.99/year premium subscription

### User Flow
1. **Onboarding**: Welcome screen with feature overview and trial start
2. **Trial/Subscription**: Paywall screen for subscription management
3. **Home Screen**: Main bookmark list with management features
4. **Share Integration**: Native iOS Share Extension for URL capture

## Screen Structure

### 1. OnboardingScreen
- Welcome message and feature highlights
- "Start 7-day free trial" button
- "See plans" option to view paywall
- Automatically starts trial and navigates to Home

### 2. PaywallScreen
- Subscription pricing ($9.99/year)
- Trial status display
- Trial start and subscription purchase options
- Placeholder for StoreKit integration

### 3. HomeScreen
- Bookmark list with URL display
- Delete functionality with confirmation
- Daily reminder toggle (Enable/Disable)
- Trial/subscription status indicator
- Upgrade pill for non-subscribers

### 4. AddBookmarkScreen
- Currently placeholder implementation
- Intended for manual bookmark addition

## Data Management

### Storage System
- **AsyncStorage**: User preferences, trial status, subscription state
- **App Groups**: Shared storage between main app and Share Extension
- **Bookmark Format**: Simple string array of URLs

### Key Storage Keys
```typescript
const STORAGE_KEYS = {
  onboardingCompleted: 'onboarding.completed',
  trialStartedAt: 'trial.startedAt',
  subscriptionActive: 'subscription.active',
}
```

## Subscription & Monetization

### Trial System
- **Duration**: 7 days
- **Storage**: Trial start timestamp in AsyncStorage
- **Calculation**: Days remaining based on elapsed time
- **Access**: Full app functionality during trial

### Subscription Model
- **Price**: $9.99/year
- **Status**: Stored as boolean flag in AsyncStorage
- **Integration**: Placeholder for StoreKit (not implemented)
- **Features**: Same as trial (no premium features yet)

## Notification System

### Daily Reminders
- **Time**: 9 AM local time (configurable)
- **Content**: Random bookmark from user's collection
- **Frequency**: Daily recurring
- **Platform**: iOS and Android support via @notifee

### Implementation
- Permission request handling
- Android channel creation
- Random bookmark selection from App Groups storage
- Notification scheduling with repeat frequency

## Technical Implementation

### App Groups Configuration
- **Group ID**: `group.com.chrismoss.Markd`
- **Purpose**: Data sharing between main app and Share Extension
- **Storage**: UserDefaults with JSON serialization
- **Access**: Both React Native and Swift code

### Share Extension (Swift)
- **File**: `ios/MarkdShareExtension/ShareViewController.swift`
- **Functionality**: Captures URLs from iOS Share Sheet
- **Data Flow**: URL → App Groups → Main App
- **Error Handling**: Graceful failure with extension dismissal

### Navigation Flow
```typescript
// Conditional routing based on user state
if (!onboardingCompleted) → OnboardingScreen
else if (subscribed || trialActive) → HomeScreen  
else → PaywallScreen
```

## Current Limitations & TODOs

### Incomplete Features
- ❌ **AddBookmarkScreen**: Placeholder implementation
- ❌ **StoreKit Integration**: Subscription purchase not functional
- ❌ **Premium Features**: No differentiation between trial and paid
- ❌ **Error Handling**: Limited error states and recovery

### Technical Debt
- Hardcoded App Group ID in multiple places
- No offline state handling
- Limited bookmark metadata (title, folder support defined but unused)
- No data validation or sanitization

### Missing Features
- Bookmark search/filtering
- Bookmark organization (folders/tags)
- Export/import functionality
- Analytics/tracking
- Deep linking support

## Development Status

### Completed ✅
- Core bookmark saving via Share Extension
- Basic bookmark management (view, delete)
- Trial and subscription state management
- Daily notification system
- Navigation structure
- Basic UI/UX

### In Progress 🚧
- Manual bookmark addition (AddBookmarkScreen)
- StoreKit integration for real subscriptions

### Planned 📋
- Premium feature differentiation
- Enhanced bookmark metadata
- Search and organization features
- Analytics integration
- Android optimization

## Dependencies

### Core Dependencies
- `react-native`: 0.80.1
- `@react-navigation/native`: ^7.1.14
- `@react-navigation/native-stack`: ^7.3.21
- `@notifee/react-native`: ^9.1.8
- `react-native-shared-group-preferences`: ^1.1.24
- `@react-native-async-storage/async-storage`: ^2.2.0

### Development Dependencies
- TypeScript 5.0.4
- Jest for testing
- ESLint for code quality
- Prettier for formatting

## Build & Deployment

### iOS Configuration
- **App Group**: Must be configured in Xcode for Share Extension
- **Bundle ID**: com.chrismoss.Markd
- **Share Extension**: MarkdShareExtension target
- **CocoaPods**: Required for iOS dependencies

### Development Commands
```bash
npm start          # Start Metro bundler
npm run ios        # Run on iOS simulator
npm run android    # Run on Android
npm test           # Run tests
npm run lint       # Lint code
```

## Security & Privacy

### Data Storage
- **Local Only**: All data stored on device
- **No Cloud Sync**: No external data transmission
- **App Groups**: Secure container for extension communication
- **Permissions**: Only notification permissions required

### Privacy Considerations
- No analytics or tracking implemented
- No external API calls
- User data remains on device
- Share Extension operates in sandboxed environment

---

*Last Updated: Current as of app state analysis*
*App Version: 0.0.1*
*React Native Version: 0.80.1*