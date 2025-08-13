import React from 'react';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ReduxProvider } from 'app/store/ReduxProvider';
import MainAppNavigator from 'app/navigation/MainAppNavigator';
import './global.css';
import { useNotifications } from './app/hooks/useNotificationsSimple';

// Disable React Native's network logging to prevent large base64 logs
if (__DEV__) {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    // Filter out network logs that contain base64 data
    const logString = JSON.stringify(args);
    if (logString.includes('data:image') || logString.includes('base64') || 
        (logString.includes('"method":"POST"') && logString.length > 10000)) {
      return; // Skip logging large network requests
    }
    originalConsoleLog.apply(console, args);
  };
}

function AppWithNotifications() {
  useNotifications();
  return <MainAppNavigator />;
}

export default function App() {
  return (
    <GluestackUIProvider mode="light">
      <ReduxProvider>
        <AppWithNotifications />
      </ReduxProvider>
    </GluestackUIProvider>
  );
}
