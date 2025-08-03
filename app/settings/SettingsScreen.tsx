import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Input, InputField } from '../../components/ui/input';
import { Divider } from '../../components/ui/divider';
import { Spinner } from '../../components/ui/spinner';
import { notificationService } from '../services/notificationService';
import StorageService from '../services/storageService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  const [theme, setTheme] = useState<'light' | 'dark'>(colorScheme || 'light');
  const [language, setLanguage] = useState('en');
  const [notificationPrefs, setNotificationPrefs] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeCountdown, setUpgradeCountdown] = useState(10);
  const upgradeTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation<any>();
  const [loggingOut, setLoggingOut] = useState(false);

  // Countdown for upgrade modal
  useEffect(() => {
    if (showUpgradeModal && upgradeCountdown > 0) {
      upgradeTimerRef.current = setTimeout(() => setUpgradeCountdown(c => c - 1), 1000);
    } else if (showUpgradeModal && upgradeCountdown === 0) {
      upgradeTimerRef.current = setTimeout(() => {
        setShowUpgradeModal(false);
        setUpgradeCountdown(10);
      }, 1000);
    }
    return () => {
      if (upgradeTimerRef.current) clearTimeout(upgradeTimerRef.current);
    };
  }, [showUpgradeModal, upgradeCountdown]);

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
    setUpgradeCountdown(10);
  };

  const handleCloseUpgrade = () => {
    setShowUpgradeModal(false);
    setUpgradeCountdown(10);
    if (upgradeTimerRef.current) clearTimeout(upgradeTimerRef.current);
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setSuccess(true);
    } catch (e) {
      setError('Failed to mark all as read');
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const prefs = await notificationService.getPreferences();
        setNotificationPrefs(prefs);
        const storedTheme = await StorageService.getTheme();
        if (storedTheme) setTheme(storedTheme);
        // Language: could fetch from backend or storage
        const storedLang = await StorageService.getPreferences();
        if (storedLang?.language) setLanguage(storedLang.language);
      } catch (e: any) {
        setError(e.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await notificationService.updatePreferences(notificationPrefs);
      await StorageService.saveTheme(theme);
      await StorageService.savePreferences({ language });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError(null);
    try {
      await authService.logout();
      // No navigation.reset needed; auth state will handle redirect
    } catch (e: any) {
      setError(e.message || 'Failed to logout');
    } finally {
      setLoggingOut(false);
    }
  };

  // Section component
  function SettingsSection({ title, children }: any) {
    return (
      <Box style={{ marginBottom: 24, backgroundColor: currentTheme.colors.card, borderRadius: 12, padding: 16 }}>
        <Text size="lg" style={{ fontWeight: '700', marginBottom: 8 }}>{title}</Text>
        {children}
      </Box>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: currentTheme.spacing.md }} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ width: '100%' }}>
          <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
            Settings
          </Text>
          <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
          {loading ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size="large" />
            </Box>
          ) : error ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
            </Box>
          ) : (
            <VStack space="lg">
              {/* Subscription Plan */}
              <SettingsSection title="Subscription">
                <Text size="md" style={{ marginBottom: 8 }}>
                  <MaterialCommunityIcons name="star" size={18} color={currentTheme.colors.primary} /> Current Plan: <Text style={{ fontWeight: '700' }}>{notificationPrefs.subscriptionPlan || 'Free'}</Text>
                </Text>
                <Button action="primary" onPress={handleUpgrade} style={{ marginBottom: 8 }}>
                  <ButtonText>Upgrade to Pro</ButtonText>
                </Button>
              </SettingsSection>
              {/* Theme & Language */}
              <SettingsSection title="Theme & Language">
                <Text size="md" style={{ fontWeight: '600', marginBottom: 8 }}>Theme</Text>
                <Box style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <Button action={theme === 'light' ? 'primary' : 'secondary'} onPress={() => setTheme('light')} style={{ marginRight: 8 }}>
                    <ButtonText>Light</ButtonText>
                  </Button>
                  <Button action={theme === 'dark' ? 'primary' : 'secondary'} onPress={() => setTheme('dark')}>
                    <ButtonText>Dark</ButtonText>
                  </Button>
                </Box>
                <Text size="md" style={{ fontWeight: '600', marginBottom: 8 }}>Language</Text>
                <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
                  <InputField
                    value={language}
                    onChangeText={setLanguage}
                    placeholder="en, fr, ar"
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
              </SettingsSection>
              {/* Notifications */}
              <SettingsSection title="Notifications">
                <VStack space="sm">
                  <Box style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text size="md" style={{ flex: 1, color: currentTheme.colors.text.secondary }}>Email</Text>
                    <Button action={notificationPrefs.email ? 'primary' : 'secondary'} size="sm" onPress={() => setNotificationPrefs((p: any) => ({ ...p, email: !p.email }))}>
                      <ButtonText>{notificationPrefs.email ? 'On' : 'Off'}</ButtonText>
                    </Button>
                  </Box>
                  <Box style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text size="md" style={{ flex: 1, color: currentTheme.colors.text.secondary }}>Push</Text>
                    <Button action={notificationPrefs.push ? 'primary' : 'secondary'} size="sm" onPress={() => setNotificationPrefs((p: any) => ({ ...p, push: !p.push }))}>
                      <ButtonText>{notificationPrefs.push ? 'On' : 'Off'}</ButtonText>
                    </Button>
                  </Box>
                  <Box style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text size="md" style={{ flex: 1, color: currentTheme.colors.text.secondary }}>SMS</Text>
                    <Button action={notificationPrefs.sms ? 'primary' : 'secondary'} size="sm" onPress={() => setNotificationPrefs((p: any) => ({ ...p, sms: !p.sms }))}>
                      <ButtonText>{notificationPrefs.sms ? 'On' : 'Off'}</ButtonText>
                    </Button>
                  </Box>
                  <Box style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text size="md" style={{ flex: 1, color: currentTheme.colors.text.secondary }}>Marketing</Text>
                    <Button action={notificationPrefs.marketing ? 'primary' : 'secondary'} size="sm" onPress={() => setNotificationPrefs((p: any) => ({ ...p, marketing: !p.marketing }))}>
                      <ButtonText>{notificationPrefs.marketing ? 'On' : 'Off'}</ButtonText>
                    </Button>
                  </Box>
                  <Button action="secondary" onPress={markAllAsRead} style={{ marginTop: 8 }}>
                    <ButtonText>Mark All as Read</ButtonText>
                  </Button>
                </VStack>
              </SettingsSection>
              {/* Account */}
              <SettingsSection title="Account">
                <Button action="secondary" onPress={() => {/* navigate to profile edit */}} style={{ marginBottom: 8 }}>
                  <ButtonText>Edit Profile</ButtonText>
                </Button>
                <Button action="secondary" variant="outline" onPress={() => {/* navigate to change password */}} style={{ marginBottom: 8 }}>
                  <ButtonText>Change Password</ButtonText>
                </Button>
                <Button action="secondary" variant="outline"  onPress={() => {/* navigate to delete account */}} style={{ marginBottom: 8, backgroundColor: currentTheme.colors.error}}>
                  <ButtonText style={{ color: currentTheme.colors.text.primary }}>Delete Account</ButtonText>
                </Button>
                <Button action="primary" onPress={handleLogout} disabled={loggingOut} style={{ marginTop: 8 }}>
                  <ButtonText>{loggingOut ? 'Logging out...' : 'Logout'}</ButtonText>
                </Button>
              </SettingsSection>
              <Button action="primary" onPress={handleSave} disabled={saving} style={{ marginTop: currentTheme.spacing.lg }}>
                <ButtonText>{saving ? 'Saving...' : 'Save Settings'}</ButtonText>
              </Button>
              {success && (
                <Text size="md" style={{ color: currentTheme.colors.secondary }}>Settings saved!</Text>
              )}
              {error && (
                <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
              )}
            </VStack>
          )}
        </VStack>
      </ScrollView>
      {/* Upgrade Modal moved outside ScrollView/VStack */}
      <Modal visible={showUpgradeModal} transparent animationType="fade">
        <Box style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <Box style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 320, alignItems: 'center' }}>
            <Text size="xl" style={{ fontWeight: '700', marginBottom: 12 }}>Upgrade Coming Soon!</Text>
            <Text size="md" style={{ color: '#333', marginBottom: 20, textAlign: 'center' }}>
              Pro features will be available soon. Stay tuned!
            </Text>
            <Text size="lg" style={{ color: currentTheme.colors.primary, fontWeight: '700', marginBottom: 12 }}>
              {upgradeCountdown > 0 ? `Closing in ${upgradeCountdown}...` : 'Closing...'}
            </Text>
            <Button action="secondary" onPress={handleCloseUpgrade}>
              <ButtonText>Close</ButtonText>
            </Button>
          </Box>
        </Box>
      </Modal>
    </SafeAreaView>
  );
} 