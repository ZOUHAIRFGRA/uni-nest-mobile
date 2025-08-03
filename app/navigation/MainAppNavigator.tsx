import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GluestackUIProvider } from '../../components/ui/gluestack-ui-provider';
import { Center } from '../../components/ui/center';
import OnboardingScreen from '../auth/OnboardingScreen';
import LoginScreen from '../auth/LoginScreen';
import RegisterScreen from '../auth/RegisterScreen';
import DashboardScreen from '../dashboard/DashboardScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from '../store/hooks';
import { useAuthInitialization } from '../hooks/useAuthInitialization';
import { Spinner } from '../../components/ui/spinner';
import { createDrawerNavigator } from '@react-navigation/drawer';
import PropertySearchScreen from '../property/PropertySearchScreen';
import MatchesScreen from '../matching/MatchesScreen';
import BookingsScreen from '../booking/BookingsScreen';
import ProfileScreen from '../profile/ProfileScreen';
import RoommateMatchingScreen from '../matching/RoommateMatchingScreen';
import FavoritesScreen from '../property/FavoritesScreen';
import NotificationsScreen from '../notification/NotificationsScreen';
import SettingsScreen from '../settings/SettingsScreen';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropertyDetailsScreen from '../property/PropertyDetailsScreen';
import PropertyMapScreen from '../property/PropertyMapScreen';
import MatchDetailsScreen from '../matching/MatchDetailsScreen';
import BookingDetailsScreen from '../booking/BookingDetailsScreen';
import BookingCreateScreen from '../booking/BookingCreateScreen';
import RoommatePreferencesScreen from '../matching/RoommatePreferencesScreen';
import PropertyRecommendationsScreen from '../property/PropertyRecommendationsScreen';
import PropertyCreateScreen from '../property/PropertyCreateScreen';
import RoommateInviteScreen from '../booking/RoommateInviteScreen';
import BookingPaymentScreen from '../booking/BookingPaymentScreen';
import DisputeScreen from '../booking/DisputeScreen';
import ViewUserProfileScreen from '../profile/ViewUserProfileScreen';
import ChatScreen from '../chat/ChatScreen';
import BookingManagementScreen from '../booking/BookingManagementScreen';
import DirectMessageScreen from '../chat/DirectMessageScreen';

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

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const PropertyStack = createStackNavigator();
function PropertyStackNavigator() {
  return (
    <PropertyStack.Navigator screenOptions={{ headerShown: false }}>
      <PropertyStack.Screen name="PropertySearch" component={PropertySearchScreen} />
      <PropertyStack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <PropertyStack.Screen name="PropertyMap" component={PropertyMapScreen} />
      <PropertyStack.Screen name="PropertyCreate" component={PropertyCreateScreen} />
      <PropertyStack.Screen name="Favorites" component={FavoritesScreen} />
      <PropertyStack.Screen name="PropertyRecommendations" component={PropertyRecommendationsScreen} />
    </PropertyStack.Navigator>
  );
}

const MatchStack = createStackNavigator();
function MatchStackNavigator() {
  return (
    <MatchStack.Navigator screenOptions={{ headerShown: false }}>
      <MatchStack.Screen name="Matches" component={MatchesScreen} />
      <MatchStack.Screen name="MatchDetails" component={MatchDetailsScreen} />
      <MatchStack.Screen name="RoommatePreferences" component={RoommatePreferencesScreen} />
    </MatchStack.Navigator>
  );
}

const BookingStack = createStackNavigator();
function BookingStackNavigator({ route }: any) {
  const user = useSelector((state) => state.auth.user);
  const isLandlord = user?.role === 'Landlord';
  
  return (
    <BookingStack.Navigator screenOptions={{ headerShown: false }}>
      {isLandlord ? (
        <>
          <BookingStack.Screen name="BookingManagement" component={BookingManagementScreen} />
          <BookingStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          <BookingStack.Screen name="DisputeScreen" component={DisputeScreen} />
        </>
      ) : (
        <>
          <BookingStack.Screen name="Bookings" component={BookingsScreen} />
          <BookingStack.Screen name="BookingCreate" component={BookingCreateScreen} />
          <BookingStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          <BookingStack.Screen name="RoommateInvite" component={RoommateInviteScreen} />
          <BookingStack.Screen name="BookingPayment" component={BookingPaymentScreen} />
          <BookingStack.Screen name="DisputeScreen" component={DisputeScreen} />
        </>
      )}
    </BookingStack.Navigator>
  );
}

const ProfileStack = createStackNavigator();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="ViewUserProfile" component={ViewUserProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 16 }}>
            <MaterialCommunityIcons name="menu" size={28} color="#6C63FF" />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Dashboard':
              return <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />;
            case 'PropertySearch':
              return <MaterialCommunityIcons name="magnify" size={size} color={color} />;
            case 'Matches':
              return <MaterialCommunityIcons name="account-group" size={size} color={color} />;
            case 'Profile':
              return <MaterialCommunityIcons name="account" size={size} color={color} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#666',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="PropertySearch" component={PropertyStackNavigator} options={{ title: 'Search' }} />
      <Tab.Screen name="Matches" component={MatchStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

function LandlordTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 16 }}>
            <MaterialCommunityIcons name="menu" size={28} color="#6C63FF" />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Dashboard':
              return <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />;
            case 'Properties':
              return <MaterialCommunityIcons name="home-city" size={size} color={color} />;
            case 'Bookings':
              return <MaterialCommunityIcons name="calendar-check" size={size} color={color} />;
            case 'Chat':
              return <MaterialCommunityIcons name="message-text" size={size} color={color} />;
            case 'Settings':
              return <MaterialCommunityIcons name="cog" size={size} color={color} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#666',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Properties" component={PropertyStackNavigator} />
      <Tab.Screen name="Bookings" component={BookingStackNavigator} />
      <Tab.Screen name="Chat" component={ChatStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const ChatStack = createStackNavigator();
function ChatStackNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatScreen" component={ChatScreen} />
      <ChatStack.Screen name="DirectMessage" component={DirectMessageScreen} />
    </ChatStack.Navigator>
  );
}

const MainAppNavigator: React.FC = () => {
  const { isLoading: isAuthInitializing } = useAuthInitialization();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const isLandlord = user?.role === 'Landlord';

  if (isAuthInitializing) {
    return (
      <Center style={{ flex: 1 }}>
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <GluestackUIProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'left', 'bottom']}>
        <NavigationContainer>
          {isAuthenticated ? (
            <Drawer.Navigator
              initialRouteName={isLandlord ? 'LandlordTabs' : 'MainTabs'}
              screenOptions={{
                headerShown: false,
                drawerActiveTintColor: '#6C63FF',
                drawerInactiveTintColor: '#666',
              }}
            >
              {isLandlord ? (
                <>
                  <Drawer.Screen name="LandlordTabs" component={LandlordTabs} options={{ title: 'Home' }} />
                  <Drawer.Screen name="Finance" component={NotificationsScreen} options={{ title: 'Finance & Analytics', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="chart-line" size={size} color={color} />) }} />
                  <Drawer.Screen name="Maintenance" component={NotificationsScreen} options={{ title: 'Maintenance', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="wrench" size={size} color={color} />) }} />
                  <Drawer.Screen name="Documents" component={NotificationsScreen} options={{ title: 'Documents', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="file-document" size={size} color={color} />) }} />
                  <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="bell" size={size} color={color} />) }} />
                  <Drawer.Screen name="Disputes" component={DisputeScreen} options={{ drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="gavel" size={size} color={color} />) }} />
                </>
              ) : (
                <>
                  <Drawer.Screen name="MainTabs" component={MainTabs} options={{ title: 'Home' }} />
                  <Drawer.Screen name="Bookings" component={BookingStackNavigator} />
                  <Drawer.Screen name="RoommateMatching" component={RoommateMatchingScreen} options={{ title: 'Roommate Matching' }} />
                  <Drawer.Screen name="Favorites" component={FavoritesScreen} />
                  <Drawer.Screen name="Notifications" component={NotificationsScreen} />
                  <Drawer.Screen name="Chat" component={ChatStackNavigator} options={{ title: 'Messages', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="message-text" size={size} color={color} />) }} />
                  <Drawer.Screen name="Settings" component={SettingsScreen} />
                </>
              )}
            </Drawer.Navigator>
          ) : (
            <AuthNavigator />
          )}
        </NavigationContainer>
      </SafeAreaView>
    </GluestackUIProvider>
  );
};

export default MainAppNavigator;
