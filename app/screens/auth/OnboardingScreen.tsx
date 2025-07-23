import React from 'react';
import { Center } from '../../../components/ui/center';
import { Button, ButtonText } from '../../../components/ui/button';
import { VStack } from '../../../components/ui/vstack';
import { Text } from '../../../components/ui/text';
import { Box } from '../../../components/ui/box';
import { useNavigation } from '@react-navigation/native';

// Always use useNavigation<any>() for navigation in screens to avoid TS errors with .navigate
export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  return (
    <Center className="flex-1 bg-background-0 px-6">
      {/* Logo/Illustration */}
      <Box className="mb-8">
        {/* Replace with your logo or illustration */}
        <Box className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center mb-4">
          <Text size="3xl" className="text-typography-0">🏠</Text>
        </Box>
      </Box>
      {/* App Title & Value Prop */}
      <VStack space="md" className="mb-8 items-center">
        <Text size="2xl" bold className="text-typography-900 text-center">Welcome to Match & Settle</Text>
        <Text size="md" className="text-typography-600 text-center">
          AI-powered student housing & roommate matching. Find your perfect home and compatible roommates, fast.
        </Text>
      </VStack>
      {/* Action Buttons */}
      <VStack space="3xl" className="w-full">
        <Button action="primary" size="lg" onPress={() => navigation.navigate('Register')}>
          <ButtonText size="lg">Get Started</ButtonText>
        </Button>
        <Button action="secondary" size="lg" variant="outline" onPress={() => navigation.navigate('Login')}>
          <ButtonText size="lg">Login</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
} 