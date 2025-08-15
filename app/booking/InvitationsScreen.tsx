import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, ScrollView, RefreshControl, Alert } from 'react-native';
import { getTheme } from '../utils/theme';
import { VStack } from '../../components/ui/vstack';
import { HStack } from '../../components/ui/hstack';
import { Text } from '../../components/ui/text';
import { Button, ButtonText } from '../../components/ui/button';
import { Box } from '../../components/ui/box';
import { Badge, BadgeText } from '../../components/ui/badge';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { roommateService, RoommateInvitation } from '../services/roommateService';

export default function InvitationsScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedInvitations, setReceivedInvitations] = useState<RoommateInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<RoommateInvitation[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    try {
      setError(null);
      const [receivedData, sentData] = await Promise.all([
        roommateService.getReceivedInvitations({ status: 'all' }),
        roommateService.getSentInvitations({ status: 'all' })
      ]);
      
      setReceivedInvitations(receivedData.invitations);
      setSentInvitations(sentData.invitations);
      setPendingCount(receivedData.pendingCount);
    } catch (e: any) {
      setError(e.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInvitations();
  }, [loadInvitations]);

  const handleRespondToInvitation = async (
    invitationId: string, 
    response: 'accept' | 'decline',
    responseMessage?: string
  ) => {
    try {
      setLoading(true);
      await roommateService.respondToInvitation(invitationId, response, responseMessage);
      
      // Refresh invitations
      await loadInvitations();
      
      Alert.alert(
        'Success',
        `Invitation ${response === 'accept' ? 'accepted' : 'declined'} successfully!`,
        [{ text: 'OK' }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to respond to invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await roommateService.cancelInvitation(invitationId);
              await loadInvitations();
              Alert.alert('Success', 'Invitation cancelled successfully!');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to cancel invitation');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderInvitationCard = (invitation: RoommateInvitation, type: 'received' | 'sent') => {
    const isReceived = type === 'received';
    const otherUser = isReceived ? invitation.fromUser : invitation.toUser;
    const statusColor = {
      'Pending': currentTheme.colors.warning,
      'Accepted': currentTheme.colors.success,
      'Declined': currentTheme.colors.error,
      'Expired': currentTheme.colors.text.secondary,
      'Cancelled': currentTheme.colors.text.secondary
    }[invitation.status];

    return (
      <Box
        key={invitation._id}
        style={{
          backgroundColor: currentTheme.colors.card,
          borderRadius: currentTheme.borderRadius.card,
          padding: currentTheme.spacing.md,
          marginBottom: currentTheme.spacing.md,
          ...currentTheme.shadows.small
        }}
      >
        <HStack space="md" style={{ alignItems: 'flex-start' }}>
          {/* User Avatar */}
          <Box
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: currentTheme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MaterialCommunityIcons 
              name="account" 
              size={24} 
              color={currentTheme.colors.text.primary} 
            />
          </Box>

          {/* Content */}
          <VStack style={{ flex: 1 }} space="xs">
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text 
                size="lg" 
                style={{ 
                  fontWeight: '600', 
                  color: currentTheme.colors.text.primary 
                }}
              >
                {otherUser.firstName} {otherUser.lastName}
              </Text>
              <Badge 
                size="sm" 
                variant="solid" 
                style={{ backgroundColor: statusColor }}
              >
                <BadgeText style={{ color: currentTheme.colors.text.primary }}>
                  {invitation.status}
                </BadgeText>
              </Badge>
            </HStack>

            <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
              {otherUser.email}
            </Text>

            {otherUser.university && (
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                📚 {otherUser.university}
              </Text>
            )}

            {/* Property Info */}
            <Box style={{ marginTop: currentTheme.spacing.sm }}>
              <Text size="md" style={{ fontWeight: '500', color: currentTheme.colors.text.primary }}>
                🏠 {invitation.propertyId.title}
              </Text>
              <Text size="sm" style={{ color: currentTheme.colors.text.secondary }}>
                📍 {invitation.propertyId.location.address || invitation.propertyId.location.city}
              </Text>
              <Text size="sm" style={{ color: currentTheme.colors.primary }}>
                💰 {invitation.bookingData.monthlyRent} MAD/month
              </Text>
            </Box>

            {/* Message */}
            {invitation.message && (
              <Box 
                style={{ 
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.medium,
                  padding: currentTheme.spacing.sm,
                  marginTop: currentTheme.spacing.sm
                }}
              >
                <Text size="sm" style={{ color: currentTheme.colors.text.primary }}>
                  &ldquo;{invitation.message}&rdquo;
                </Text>
              </Box>
            )}

            {/* Response Message */}
            {invitation.responseMessage && (
              <Box 
                style={{ 
                  backgroundColor: currentTheme.colors.primary + '20',
                  borderRadius: currentTheme.borderRadius.medium,
                  padding: currentTheme.spacing.sm,
                  marginTop: currentTheme.spacing.sm
                }}
              >
                <Text size="sm" style={{ color: currentTheme.colors.text.primary }}>
                  Response: &ldquo;{invitation.responseMessage}&rdquo;
                </Text>
              </Box>
            )}

            {/* Date */}
            <Text size="xs" style={{ color: currentTheme.colors.text.secondary, marginTop: currentTheme.spacing.sm }}>
              {isReceived ? 'Received' : 'Sent'}: {new Date(invitation.createdAt).toLocaleDateString()}
              {invitation.respondedAt && (
                <Text> • Responded: {new Date(invitation.respondedAt).toLocaleDateString()}</Text>
              )}
            </Text>

            {/* Action Buttons */}
            {invitation.status === 'Pending' && (
              <HStack space="sm" style={{ marginTop: currentTheme.spacing.md }}>
                {isReceived ? (
                  <>
                    <Button
                      action="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      onPress={() => handleRespondToInvitation(invitation._id, 'accept')}
                      disabled={loading}
                    >
                      <ButtonText>Accept</ButtonText>
                    </Button>
                    <Button
                      action="secondary"
                      variant="outline"
                      size="sm"
                      style={{ flex: 1 }}
                      onPress={() => handleRespondToInvitation(invitation._id, 'decline')}
                      disabled={loading}
                    >
                      <ButtonText>Decline</ButtonText>
                    </Button>
                  </>
                ) : (
                  <Button
                    action="secondary"
                    variant="outline"
                    size="sm"
                    onPress={() => handleCancelInvitation(invitation._id)}
                    disabled={loading}
                  >
                    <ButtonText>Cancel</ButtonText>
                  </Button>
                )}
              </HStack>
            )}
          </VStack>
        </HStack>
      </Box>
    );
  };

  const currentInvitations = activeTab === 'received' ? receivedInvitations : sentInvitations;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <VStack space="lg" style={{ flex: 1 }}>
        {/* Header */}
        <HStack style={{ padding: currentTheme.spacing.md, alignItems: 'center' }}>
          <Button
            variant="outline"
            size="sm"
            onPress={() => navigation.goBack()}
            style={{ marginRight: currentTheme.spacing.sm }}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={currentTheme.colors.text.primary} 
            />
          </Button>
          <Text 
            size="2xl" 
            style={{ 
              fontWeight: '700', 
              color: currentTheme.colors.text.primary,
              flex: 1
            }}
          >
            Roommate Invitations
          </Text>
        </HStack>

        {/* Tab Buttons */}
        <HStack 
          space="md" 
          style={{ 
            paddingHorizontal: currentTheme.spacing.md,
            marginBottom: currentTheme.spacing.sm
          }}
        >
          <Button
            action={activeTab === 'received' ? 'primary' : 'secondary'}
            variant={activeTab === 'received' ? 'solid' : 'outline'}
            size="md"
            style={{ flex: 1 }}
            onPress={() => setActiveTab('received')}
          >
            <HStack space="xs" style={{ alignItems: 'center' }}>
              <ButtonText>Received</ButtonText>
              {pendingCount > 0 && (
                <Badge size="sm" variant="solid" style={{ backgroundColor: currentTheme.colors.error }}>
                  <BadgeText style={{ color: currentTheme.colors.text.primary, fontSize: 10 }}>
                    {pendingCount}
                  </BadgeText>
                </Badge>
              )}
            </HStack>
          </Button>
          <Button
            action={activeTab === 'sent' ? 'primary' : 'secondary'}
            variant={activeTab === 'sent' ? 'solid' : 'outline'}
            size="md"
            style={{ flex: 1 }}
            onPress={() => setActiveTab('sent')}
          >
            <ButtonText>Sent</ButtonText>
          </Button>
        </HStack>

        {/* Error Message */}
        {error && (
          <Box style={{ paddingHorizontal: currentTheme.spacing.md }}>
            <Text size="md" style={{ color: currentTheme.colors.error, textAlign: 'center' }}>
              {error}
            </Text>
          </Box>
        )}

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: currentTheme.spacing.md,
            paddingBottom: currentTheme.spacing.lg
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={currentTheme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading && !refreshing ? (
            <Box style={{ paddingVertical: currentTheme.spacing.xl, alignItems: 'center' }}>
              <Text size="md" style={{ color: currentTheme.colors.text.secondary }}>
                Loading invitations...
              </Text>
            </Box>
          ) : currentInvitations.length === 0 ? (
            <Box style={{ paddingVertical: currentTheme.spacing.xl, alignItems: 'center' }}>
              <MaterialCommunityIcons 
                name="account-group-outline" 
                size={64} 
                color={currentTheme.colors.text.secondary} 
              />
              <Text 
                size="lg" 
                style={{ 
                  color: currentTheme.colors.text.secondary,
                  textAlign: 'center',
                  marginTop: currentTheme.spacing.md
                }}
              >
                No {activeTab} invitations yet
              </Text>
              <Text 
                size="md" 
                style={{ 
                  color: currentTheme.colors.text.secondary,
                  textAlign: 'center',
                  marginTop: currentTheme.spacing.xs
                }}
              >
                {activeTab === 'received' 
                  ? 'When someone invites you to be roommates, it will appear here'
                  : 'Invitations you send will appear here'
                }
              </Text>
            </Box>
          ) : (
            <VStack space="md">
              {currentInvitations.map(invitation => 
                renderInvitationCard(invitation, activeTab)
              )}
            </VStack>
          )}
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
}
