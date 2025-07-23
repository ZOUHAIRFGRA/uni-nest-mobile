import React from 'react';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ReduxProvider } from 'app/store/ReduxProvider';
import MainAppNavigator from 'app/navigation/MainAppNavigator';
import './global.css';

export default function App() {
  return (
    <GluestackUIProvider mode="light"><ReduxProvider>
        <MainAppNavigator />
      </ReduxProvider></GluestackUIProvider>
  );
}
