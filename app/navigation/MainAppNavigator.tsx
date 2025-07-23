import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GluestackUIProvider } from '../../components/ui/gluestack-ui-provider';
import { Center } from '../../components/ui/center';
import { Text } from '../../components/ui/text';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { createStackNavigator } from '@react-navigation/stack';

// Placeholder screens for main app
function DashboardScreen() {
  return <Center className="flex-1"><Text size="xl">Dashboard</Text></Center>;
}
function PropertySearchScreen() {
  return <Center className="flex-1"><Text size="xl">Property Search</Text></Center>;
}
function MatchesScreen() {
  return <Center className="flex-1"><Text size="xl">AI Matches</Text></Center>;
}
function BookingsScreen() {
  return <Center className="flex-1"><Text size="xl">Bookings</Text></Center>;
}
function ProfileScreen() {
  return <Center className="flex-1"><Text size="xl">Profile</Text></Center>;
}

// Auth stack: Onboarding, Login, Register
const AuthStack = createStackNavigator();
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Main app tabs
const Tab = createBottomTabNavigator();
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Search" component={PropertySearchScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root navigator: Show AuthNavigator or MainTabs based on auth state
// TODO: Replace with real auth state logic
const isAuthenticated = false; // Placeholder

const MainAppNavigator: React.FC = () => {
  return (
    <GluestackUIProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
      </NavigationContainer>
    </GluestackUIProvider>
  );
};

export default MainAppNavigator;
