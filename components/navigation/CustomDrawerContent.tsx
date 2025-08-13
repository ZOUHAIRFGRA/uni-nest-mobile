import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from '../../app/store/hooks';
import { Text } from '../ui/text';
import { Box } from '../ui/box';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider } from '../ui/divider';
import { useNavigation } from '@react-navigation/native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Image as CustomImage } from '../ui/image';

export default function CustomDrawerContent(props: any) {
  const navigation = useNavigation<any>();
  const user = useSelector((state) => state.auth.user);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
     
      {/* Profile Section */}
      <TouchableOpacity
        style={styles.profileSection}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Profile')}
      >
        <Box style={styles.avatarBox}>
          {user?.profileImage ? (
            <CustomImage source={{ uri: user.profileImage }} style={styles.avatar} alt="avatar" />
          ) : user?.firstName ? (
            <Box style={[styles.avatar, { backgroundColor: '#e0e7ef', alignItems: 'center', justifyContent: 'center' }]}> 
              <Text size="xl" style={{ color: '#6C63FF', fontWeight: '700' }}>
                {user.firstName.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}
              </Text>
            </Box>
          ) : (
            <MaterialCommunityIcons name="account-circle" size={64} color="#6C63FF" />
          )}
        </Box>
        <Text size="lg" style={styles.name}>
          {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Your Name'}
        </Text>
        <Text size="sm" style={styles.email}>
          {user?.email || 'your@email.com'}
        </Text>
      </TouchableOpacity>
      <Divider style={{ marginVertical: 16 }} />
      {/* Drawer Items */}
      <View style={styles.menuSection}>
        <DrawerItemList {...props} />
      </View>
      <View style={styles.bottomSection}>
        <Divider style={{ marginVertical: 12 }} />
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <MaterialCommunityIcons name="cog" size={22} color="#6C63FF" />
          <Text size="md" style={styles.logoutText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <MaterialCommunityIcons name="logout" size={22} color="#ef4444" />
          <Text size="md" style={[styles.logoutText, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
    borderRadius: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#e0e7ef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  email: {
    color: '#6b7280',
    marginBottom: 2,
  },
  menuSection: {
    flex: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  bottomSection: {
    marginBottom: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 2,
  },
  logoutText: {
    marginLeft: 12,
    fontWeight: '600',
    color: '#374151',
  },
});
