import React from 'react';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ReduxProvider } from 'app/store/ReduxProvider';
import { useNotifications } from 'app/hooks/useNotificationsSimple.js';
import MainAppNavigator from 'app/navigation/MainAppNavigator';
import './global.css';

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
