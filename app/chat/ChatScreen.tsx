import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Input, InputField } from '../../components/ui/input';
import { Divider } from '../../components/ui/divider';
import { chatService } from '../services/chatService';
import { Spinner } from '../../components/ui/spinner';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card } from '../../components/ui/card';
import { Pressable } from 'react-native';
import { authService } from '../services/authService';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const chatId = route.params?.chatId;

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch chat list or messages
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      setError(null);
      try {
        const chatList = await chatService.getChats();
        // console.log("[CHAT LIST]",chatList)
        setChats(chatList);
      } catch (e: any) {
        setError(e.message || 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    authService.getStoredUserData().then(user => {
      // console.log("[CURRENT USER ID]",user)
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const goToChat = (id: string) => {
    navigation.navigate('DirectMessage', { chatId: id });
  };

  // Search users by name/email
  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const users = await chatService.searchUsers(query);
      setSearchResults(users);
    } catch (e) {
      console.log("[ERROR SEARCH USERS]",e)
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Start or open chat with user
  const handleStartChat = async (userId: string) => {
    try {
      const chat = await chatService.startChat(userId);
      navigation.navigate('DirectMessage', { chatId: chat._id || chat.id });
      setSearch('');
      setSearchResults([]);
    } catch (e) {
      console.log("[ERROR START CHAT]",e)
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          Messages
        </Text>
        <Input style={{ backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border, marginBottom: currentTheme.spacing.sm }}>
          <InputField
            value={search}
            onChangeText={handleSearch}
            placeholder="Search users by name or email..."
            style={{ fontFamily: currentTheme.typography.fontFamily }}
            allowFontScaling
            returnKeyType="search"
          />
        </Input>
        {search && searchResults.length > 0 ? (
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            <VStack space="md">
              {searchResults.map((user: any) => (
                <Card key={user._id} style={{ padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card, flexDirection: 'row', alignItems: 'center', marginBottom: currentTheme.spacing.sm }}>
                  <Box style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginRight: currentTheme.spacing.md }}>
                    {/* Profile image */}
                    {/* Replace with your Image component if needed */}
                    <Text size="xl" style={{ textAlign: 'center', lineHeight: 48 }}>{user.firstName?.[0]}</Text>
                  </Box>
                  <VStack style={{ flex: 1 }}>
                    <Text size="md" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{user.firstName} {user.lastName}</Text>
                    <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>{user.email}</Text>
                  </VStack>
                  <Button action="primary" size="sm" onPress={() => handleStartChat(user._id)}>
                    <ButtonText>Message</ButtonText>
                  </Button>
                </Card>
              ))}
            </VStack>
          </ScrollView>
        ) : search && !searching && searchResults.length === 0 ? (
          <Text size="md" style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing.sm }}>No users found.</Text>
        ) : null}
        <Divider style={{ marginVertical: currentTheme.spacing.sm }} />
        {!currentUserId ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
          </Box>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <VStack space="md">
              {chats.length === 0 ? (
                <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>No chats found.</Text>
              ) : (
                chats.map((chat: any) => {
                  const other = chat.participants.find((p: any) => p._id !== currentUserId);
                  if (!other) return null;
                  const unreadCount = chat.unreadCounts && chat.unreadCounts[currentUserId] ? chat.unreadCounts[currentUserId] : 0;
                  return (
                    <Pressable
                      key={chat._id}
                      onPress={() => goToChat(chat._id)}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`Open chat with ${other.firstName} ${other.lastName}`}
                    >
                      <Card
                        style={{ flexDirection: 'row', alignItems: 'center', padding: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.card, marginBottom: currentTheme.spacing.sm, borderWidth: unreadCount > 0 ? 2 : 0, borderColor: unreadCount > 0 ? currentTheme.colors.primary : 'transparent', backgroundColor: unreadCount > 0 ? `${currentTheme.colors.primary}10` : currentTheme.colors.card }}
                      >
                        <Box style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: currentTheme.colors.card, marginRight: currentTheme.spacing.md, borderWidth: 1, borderColor: currentTheme.colors.border }}>
                          {other.profileImage ? (
                            <Image source={{ uri: other.profileImage }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                          ) : (
                            <Text size="xl" style={{ textAlign: 'center', lineHeight: 48 }}>{other.firstName?.[0]}</Text>
                          )}
                        </Box>
                        <VStack style={{ flex: 1 }}>
                          <Text size="md" style={{ fontWeight: '700', color: currentTheme.colors.text.primary }}>{other.firstName} {other.lastName}</Text>
                          {chat.lastMessage && (
                            <Text size="sm" style={{ color: currentTheme.colors.text.secondary, marginTop: 2 }} numberOfLines={1} ellipsizeMode="tail">
                              {chat.lastMessage.content}
                            </Text>
                          )}
                        </VStack>
                        {chat.lastMessage && (
                          <Text size="xs" style={{ color: currentTheme.colors.text.secondary, marginLeft: 8, alignSelf: 'flex-start' }}>
                            {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        )}
                        {unreadCount > 0 && (
                          <Box style={{ backgroundColor: currentTheme.colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
                            <Text size="sm" style={{ color: '#fff', fontWeight: '700' }}>{unreadCount}</Text>
                          </Box>
                        )}
                      </Card>
                    </Pressable>
                  );
                })
              )}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </SafeAreaView>
  );
} 