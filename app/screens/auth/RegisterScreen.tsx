import React, { useState } from 'react';
import { Center } from '../../../components/ui/center';
import { Button, ButtonText } from '../../../components/ui/button';
import { VStack } from '../../../components/ui/vstack';
import { Text } from '../../../components/ui/text';
import { Box } from '../../../components/ui/box';
import { HStack } from '../../../components/ui/hstack';
import { useNavigation } from '@react-navigation/native';

const steps = [
  'Role',
  'Personal',
  'University',
  'Preferences',
  'Lifestyle',
  'Photo',
];

// RegisterScreen: Multi-step registration form
export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'Student' | 'Landlord'>('Student');

  // Go to next step
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  // Go to previous step
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // Render step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <VStack space="md" className="w-full">
            <Text size="xl" bold className="mb-2 text-typography-900">Select Role</Text>
            <HStack space="md" className="w-full">
              <Button action={role === 'Student' ? 'primary' : 'secondary'} size="lg" onPress={() => setRole('Student')}>
                <ButtonText size="lg">Student</ButtonText>
              </Button>
              <Button action={role === 'Landlord' ? 'primary' : 'secondary'} size="lg" onPress={() => setRole('Landlord')}>
                <ButtonText size="lg">Landlord</ButtonText>
              </Button>
            </HStack>
          </VStack>
        );
      case 1:
        return <Text>Personal Info Step (TODO)</Text>;
      case 2:
        return role === 'Student' ? <Text>University Info Step (TODO)</Text> : null;
      case 3:
        return <Text>Preferences Step (TODO)</Text>;
      case 4:
        return <Text>Lifestyle Step (TODO)</Text>;
      case 5:
        return <Text>Profile Photo Step (TODO)</Text>;
      default:
        return null;
    }
  };

  return (
    <Center className="flex-1 bg-background-0 px-6">
      {/* Progress Indicator */}
      <HStack space="md" className="mb-6">
        {steps.map((label, idx) => (
          <Box
            key={label}
            className={`h-2 flex-1 rounded-full ${idx <= step ? 'bg-primary-500' : 'bg-background-200'}`}
          />
        ))}
      </HStack>
      {/* Step Content */}
      <Box className="w-full mb-8">{renderStep()}</Box>
      {/* Navigation Buttons */}
      <HStack space="md" className="w-full">
        <Button action="secondary" size="lg" onPress={prev} disabled={step === 0}>
          <ButtonText size="lg">Back</ButtonText>
        </Button>
        <Button action="primary" size="lg" onPress={next}>
          <ButtonText size="lg">{step === steps.length - 1 ? 'Finish' : 'Next'}</ButtonText>
        </Button>
      </HStack>
      {/* Login Link */}
      <Box className="mt-8 flex-row justify-center">
        <Text size="md" className="text-typography-600">Already have an account? </Text>
        <Button variant="link" action="primary" onPress={() => navigation.navigate('Login')}>
            <ButtonText size="md">Login</ButtonText>
        </Button>
      </Box>
    </Center>
  );
} 