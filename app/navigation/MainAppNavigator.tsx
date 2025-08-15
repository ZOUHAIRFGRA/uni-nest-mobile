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
import CustomDrawerContent from '../../components/navigation/CustomDrawerContent';
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
import InvitationsScreen from '../booking/InvitationsScreen';
import BookingPaymentScreen from '../booking/BookingPaymentScreen';
import DisputeScreen from '../booking/DisputeScreen';
import ViewUserProfileScreen from '../profile/ViewUserProfileScreen';
import ChatScreen from '../chat/ChatScreen';
import BookingManagementScreen from '../booking/BookingManagementScreen';
import DirectMessageScreen from '../chat/DirectMessageScreen';
import FinanceAnalyticsScreen from '../dashboard/FinanceAnalyticsScreen';
import MaintenanceManagementScreen from '../dashboard/MaintenanceManagementScreen';
import DocumentManagementScreen from '../dashboard/DocumentManagementScreen';

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
    <PropertyStack.Navigator screenOptions={{ headerShown: true }}>
      <PropertyStack.Screen name="PropertySearch" component={PropertySearchScreen} options={{ headerShown: false }} />
      <PropertyStack.Screen 
        name="PropertyDetails" 
        component={PropertyDetailsScreen} 
        options={{ headerShown: false }} // Hide header for custom in-screen header
      />
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
    <MatchStack.Navigator screenOptions={{ headerShown: true }}>
      <MatchStack.Screen name="Matches" component={MatchesScreen} options={{ headerShown: false }} />
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
    <BookingStack.Navigator screenOptions={{ headerShown: true }}>
      {isLandlord ? (
        <>
          <BookingStack.Screen name="BookingManagement" component={BookingManagementScreen} options={{ headerShown: false }} />
          <BookingStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          <BookingStack.Screen name="BookingPaymentScreen" component={BookingPaymentScreen} />
          <BookingStack.Screen name="DisputeScreen" component={DisputeScreen} />
        </>
      ) : (
        <>
          <BookingStack.Screen name="Bookings" component={BookingsScreen} options={{ headerShown: false }} />
          <BookingStack.Screen name="BookingCreate" component={BookingCreateScreen} />
          <BookingStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          <BookingStack.Screen name="RoommateInvite" component={RoommateInviteScreen} />
          <BookingStack.Screen name="Invitations" component={InvitationsScreen} />
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
    <ProfileStack.Navigator screenOptions={{ headerShown: true }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="ViewUserProfile" component={ViewUserProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 16 }}>
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
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 16 }}>
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
    <ChatStack.Navigator screenOptions={{ headerShown: true }}>
      <ChatStack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
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
              drawerContent={props => <CustomDrawerContent {...props} />}
              screenOptions={{
                headerShown: false,
                swipeEdgeWidth: 40,
                drawerPosition: 'right',
                drawerActiveTintColor: '#6C63FF',
                drawerInactiveTintColor: '#666',
                drawerStyle: {
                  backgroundColor: '#f8fafc',
                  borderTopLeftRadius: 32,
                  borderBottomLeftRadius: 32,
                  width: 290,
                  shadowColor: '#000',
                  shadowOffset: { width: -4, height: 0 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 12,
                },
                drawerType: 'slide',
                overlayColor: 'rgba(44, 62, 80, 0.15)',
                drawerLabelStyle: {
                  fontWeight: '600',
                  fontSize: 17,
                  color: '#374151',
                  marginLeft: 8,
                },
                drawerItemStyle: {
                  borderRadius: 12,
                  marginVertical: 4,
                  marginHorizontal: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                },
                drawerIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="chevron-left" size={size} color={color} />
                ),
              }}
            >
              {isLandlord ? (
                <>
                  <Drawer.Screen name="LandlordTabs" component={LandlordTabs} options={{ title: 'Home', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="home" size={size} color={color} />) }} />
                  <Drawer.Screen name="Finance" component={FinanceAnalyticsScreen} options={{ title: 'Finance & Analytics', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="chart-line" size={size} color={color} />) }} />
                  <Drawer.Screen name="Maintenance" component={MaintenanceManagementScreen} options={{ title: 'Maintenance', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="wrench" size={size} color={color} />) }} />
                  <Drawer.Screen name="Documents" component={DocumentManagementScreen} options={{ title: 'Documents', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="file-document" size={size} color={color} />) }} />
                  <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="bell" size={size} color={color} />) }} />
                  <Drawer.Screen name="Disputes" component={DisputeScreen} options={{ drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="gavel" size={size} color={color} />) }} />
                </>
              ) : (
                <>
                  <Drawer.Screen name="MainTabs" component={MainTabs} options={{ title: 'Home', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="home" size={size} color={color} />) }} />
                  <Drawer.Screen name="Bookings" component={BookingStackNavigator} options={{ drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="calendar" size={size} color={color} />) }} />
                  <Drawer.Screen name="Invitations" component={InvitationsScreen} options={{ title: 'Roommate Invitations', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="account-multiple-plus" size={size} color={color} />) }} />
                  <Drawer.Screen name="RoommateMatching" component={RoommateMatchingScreen} options={{ title: 'Roommate Matching', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="account-group" size={size} color={color} />) }} />
                  <Drawer.Screen name="Favorites" component={FavoritesScreen} options={{ drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="heart" size={size} color={color} />) }} />
                  <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="bell" size={size} color={color} />) }} />
                  <Drawer.Screen name="Chat" component={ChatStackNavigator} options={{ title: 'Messages', drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="message-text" size={size} color={color} />) }} />
                  <Drawer.Screen name="Settings" component={SettingsScreen} options={{ drawerIcon: ({ color, size }) => (<MaterialCommunityIcons name="cog" size={size} color={color} />) }} />
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
