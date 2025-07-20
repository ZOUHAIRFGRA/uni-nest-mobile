import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingScreen } from './OnboardingScreen';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { useAuthActions } from '../../app/store/hooks';

interface AuthNavigatorProps {
  onAuthSuccess: () => void;
}

export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ onAuthSuccess }) => {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'login' | 'register'>('onboarding');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const auth = useAuthActions();

  // Check if user is authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      onAuthSuccess();
    }
  }, [auth.isAuthenticated, onAuthSuccess]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setCurrentScreen('login');
  };

  const handleNavigateToLogin = () => {
    setCurrentScreen('login');
  };

  const handleNavigateToRegister = () => {
    setCurrentScreen('register');
  };

  const handleNavigateToForgotPassword = () => {
    // TODO: Implement forgot password screen
    console.log('Navigate to forgot password');
  };

  const handleLoginSuccess = () => {
    onAuthSuccess();
  };

  const handleRegisterSuccess = () => {
    onAuthSuccess();
  };

  // Show onboarding first
  if (showOnboarding) {
    return (
      <OnboardingScreen onComplete={handleOnboardingComplete} />
    );
  }

  // Show auth screens
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {currentScreen === 'login' && (
          <LoginScreen
            onNavigateToRegister={handleNavigateToRegister}
            onNavigateToForgotPassword={handleNavigateToForgotPassword}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        
        {currentScreen === 'register' && (
          <RegisterScreen
            onNavigateToLogin={handleNavigateToLogin}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AuthNavigator;
