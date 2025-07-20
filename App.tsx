import React from 'react';
import { ReduxProvider } from 'app/store/ReduxProvider';
import { MainAppNavigator } from 'app/navigation/MainAppNavigator';
import './global.css';

export default function App() {
  return (
    <ReduxProvider>
      <MainAppNavigator />
    </ReduxProvider>
  );
}
