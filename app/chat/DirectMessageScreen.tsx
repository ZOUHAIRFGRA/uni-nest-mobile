import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { Text } from '../../components/ui/text';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Input, InputField } from '../../components/ui/input';
import { chatService } from '../services/chatService';
import { Spinner } from '../../components/ui/spinner';
import {  useRoute } from '@react-navigation/native';
import { authService } from '../services/authService';

export default function DirectMessageScreen() {
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const route = useRoute<any>();
  const chatId = route.params?.chatId;

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    authService.getStoredUserData().then(user => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        if (chatId) {
          const msgs = await chatService.getMessages(chatId);
          console.log("[DM MSGS]",msgs)
          setMessages(msgs);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;
    setSending(true);
    try {
      await chatService.sendMessage(chatId, input.trim());
      setInput('');
      const msgs = await chatService.getMessages(chatId);
      setMessages(msgs);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setError(e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1, padding: currentTheme.spacing.md }}>
        <Text size="3xl" style={{ fontWeight: '700', color: currentTheme.colors.text.primary, marginBottom: currentTheme.spacing.sm }}>
          Conversation
        </Text>
        {loading ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="large" />
          </Box>
        ) : error ? (
          <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text size="md" style={{ color: currentTheme.colors.error }}>{error}</Text>
          </Box>
        ) : (
          <>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={80}
            >
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
              >
                <VStack space="md">
                  {messages.map((msg: any, idx: number) => {
                    const isMine = currentUserId && (msg.sender === currentUserId || msg.sender?._id === currentUserId);
                    return (
                      <Box
                        key={msg._id || msg.id || idx}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          backgroundColor: isMine ? '#6C63FF' : currentTheme.colors.card,
                          borderRadius: 18,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          marginBottom: 6,
                          maxWidth: '80%',
                          shadowColor: isMine ? '#6C63FF' : '#000',
                          shadowOpacity: isMine ? 0.15 : 0.05,
                          shadowRadius: 6,
                          elevation: isMine ? 2 : 1,
                        }}
                      >
                        <Text size="md" style={{ color: isMine ? '#fff' : currentTheme.colors.text.primary }}>{msg.content}</Text>
                        <Text size="xs" style={{ color: isMine ? '#E0E0E0' : currentTheme.colors.text.secondary, marginTop: 4, alignSelf: 'flex-end' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </Box>
                    );
                  })}
                </VStack>
              </ScrollView>
              <Box style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Input style={{ flex: 1, backgroundColor: currentTheme.colors.input, borderRadius: currentTheme.borderRadius.input, borderColor: currentTheme.colors.border }}>
                  <InputField
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a message..."
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                    onSubmitEditing={handleSend}
                  />
                </Input>
                <Button action="primary" onPress={handleSend} disabled={sending || !input.trim()} style={{ marginLeft: 8 }}>
                  <ButtonText>Send</ButtonText>
                </Button>
              </Box>
            </KeyboardAvoidingView>
          </>
        )}
      </VStack>
    </SafeAreaView>
  );
} 