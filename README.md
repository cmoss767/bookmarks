# Markd

Markd is a simple iOS application built with React Native that allows you to save URLs from other apps (like your web browser) using the native iOS Share Sheet.

## Features

- **Save Bookmarks**: Quickly save links from any app that supports sharing URLs.
- **Centralized List**: View all your saved bookmarks in a clean, simple list.
- **Native Integration**: Uses a native iOS Share Extension for seamless integration with the operating system.

## Architecture

The project uses a hybrid architecture to combine the power of React Native with native iOS capabilities:

- **Main Application**: The main app is built with **React Native**. It is responsible for displaying the list of saved bookmarks. The primary screen is `src/screens/HomeScreen.tsx`.

- **Share Extension**: The share functionality is a native **iOS Share Extension** written in **Swift** (`ios/MarkdShareExtension/ShareViewController.swift`). This extension appears in the iOS Share Sheet and captures incoming URLs.

- **Data Sharing**: To pass the bookmark from the native Share Extension to the React Native app, we use an **App Group**. This creates a shared data container that both the main app and the extension have permission to access.
  - **`react-native-shared-group-preferences`**: This library acts as the bridge, allowing the React Native code to read data from the shared container that was written by the native Swift extension.

```mermaid
graph TD
    A[Other Apps e.g., Safari] --&gt;|User Shares URL| B(iOS Share Sheet);
    B --&gt; C{MarkdShareExtension};
    C --&gt;|Writes URL to| D[Shared Storage (App Group)];
    D --&gt;|Is read by| E{Main React Native App};
    E --&gt;|Displays Bookmark in| F(HomeScreen UI);
```

## Project Setup

To run this project, you will need Node.js, Watchman, the React Native CLI, and Xcode.

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd Markd

# Install JavaScript dependencies
npm install

# Install iOS dependencies (CocoaPods)
cd ios
pod install
cd ..
```

### 2. Configure App Group in Xcode

This project requires an **App Group** to share data between the main app and the Share Extension. You must configure this in Xcode before the app will run correctly.

1.  Open the project in Xcode by opening the `ios/Markd.xcworkspace` file.
2.  Select the `Markd` project in the left sidebar, then select the **`Markd` target**.
3.  Go to the **"Signing & Capabilities"** tab.
4.  Click **"+ Capability"** and add **"App Groups"**.
5.  In the App Groups section, click the **"+"** button and add a new group. The ID must be `group.org.reactjs.native.example.BookmarksApp`. Make sure it is checked.
6.  Now, select the **`MarkdShareExtension` target** from the dropdown menu.
7.  Repeat steps 3-5 for the extension, ensuring you add the **exact same App Group ID** (`group.org.reactjs.native.example.BookmarksApp`) and that it is checked.

### 3. Running the Application

You can now run the app.

#### From Terminal
This is the recommended approach.

```bash
# Start the Metro bundler
npm start

# In a new terminal, run the app on the iOS simulator
npx react-native run-ios
```

#### From Xcode
1.  Launch the Metro bundler in a terminal window with `npm start`.
2.  In Xcode, ensure your desired simulator is selected.
3.  Click the "Run" button (▶).
