import React, { useState } from 'react';
import { Center } from '../../../components/ui/center';
import { Button, ButtonText } from '../../../components/ui/button';
import { VStack } from '../../../components/ui/vstack';
import { Text } from '../../../components/ui/text';
import { Input, InputField } from '../../../components/ui/input';
import { Box } from '../../../components/ui/box';
import { Link, LinkText } from '../../../components/ui/link';
import { useNavigation } from '@react-navigation/native';

// LoginScreen: User login form
export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: Implement login logic with backend
  const handleLogin = async () => {
    setLoading(true);
    // ...login logic
    setLoading(false);
  };

  return (
    <Center className="flex-1 bg-background-0 px-6">
      {/* Title */}
      <Text size="2xl" bold className="mb-8 text-typography-900">
        Login
      </Text>
      {/* Login Form */}
      <VStack space="md" className="w-full">
        <Input>
          <InputField
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email"
          />
        </Input>
        <Input>
          <InputField
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
          />
        </Input>
        <Button action="primary" size="lg" onPress={handleLogin}>
          <ButtonText size="lg">Login</ButtonText>
        </Button>
        <Link
          onPress={() => {
            /* TODO: Forgot password flow */
          }}
          className="self-end">
          <LinkText size="sm">Forgot Password?</LinkText>
        </Link>
      </VStack>
      {/* Register Link */}
      <Box className="mt-8 flex-row justify-center">
        <Text size="md" className="text-typography-600">
          Don&apos;t have an account?{' '}
        </Text>
        <Link onPress={() => navigation.navigate('Register')}>
          <LinkText size="md">Register</LinkText>
        </Link>
      </Box>
    </Center>
  );
}
