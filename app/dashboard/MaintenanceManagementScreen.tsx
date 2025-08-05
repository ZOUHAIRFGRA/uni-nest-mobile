import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, RefreshControl, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Card } from '../../components/ui/card';
import { Button, ButtonText } from '../../components/ui/button';
import { Badge, BadgeText } from '../../components/ui/badge';
import { HStack } from '../../components/ui/hstack';
import { VStack } from '../../components/ui/vstack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { landlordService } from '../services/landlordService';
import { Pressable } from '../../components/ui/pressable';
import { Spinner } from '../../components/ui/spinner';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '../../components/ui/select';
import { ChevronDownIcon, X as CloseIcon } from 'lucide-react-native';
import { Input, InputField } from '../../components/ui/input';
import { Textarea, TextareaInput } from '../../components/ui/textarea';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '../../components/ui/modal';
import { MaintenanceRequest as BaseMaintenanceRequest } from '../types';

// Extended interface for UI with populated property and tenant names
interface MaintenanceRequestUI extends BaseMaintenanceRequest {
  propertyName: string;
  tenantName: string;
  assignedContractor?: string;
}

interface Contractor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  rating: number;
  availability: 'available' | 'busy' | 'unavailable';
}

const MaintenanceManagementScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<MaintenanceRequestUI[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequestUI | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');

  const loadMaintenanceData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load maintenance requests
      const requestsResponse = await landlordService.getMaintenanceRequests(
        undefined,
        selectedStatus !== 'all' ? selectedStatus : undefined
      );
      
      if (requestsResponse.success) {
        // Transform the data to match our UI interface
        const requestsWithNames: MaintenanceRequestUI[] = (requestsResponse.data?.requests || []).map(request => ({
          ...request,
          propertyName: 'Property Name', // This would come from the API in real implementation
          tenantName: 'Tenant Name', // This would come from the API in real implementation
          assignedContractor: undefined
        }));
        setRequests(requestsWithNames);
      }

      // Note: In production, contractors would be loaded from API
      setContractors([]);

    } catch (error) {
      console.error('Error loading maintenance data:', error);
      Alert.alert('Error', 'Failed to load maintenance data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadMaintenanceData();
  }, [loadMaintenanceData]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadMaintenanceData();
  }, [loadMaintenanceData]);

  const filteredRequests = requests.filter(request => {
    const statusMatch = selectedStatus === 'all' || request.status === selectedStatus;
    const priorityMatch = selectedPriority === 'all' || request.priority === selectedPriority;
    return statusMatch && priorityMatch;
  });

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'assigned': return '#3B82F6';
      case 'in_progress': return '#8B5CF6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plumbing': return 'pipe-wrench' as const;
      case 'electrical': return 'lightning-bolt' as const;
      case 'heating': return 'air-conditioner' as const;
      case 'appliances': return 'washing-machine' as const;
      case 'structural': return 'hammer' as const;
      case 'cleaning': return 'broom' as const;
      default: return 'wrench' as const;
    }
  };

  const handleAssignContractor = async (requestId: string, contractorId: string) => {
    try {
      const response = await landlordService.updateMaintenanceStatus(
        requestId,
        'assigned',
        `Assigned to contractor: ${contractorId}`
      ) as any;
      
      if (response.success) {
        Alert.alert('Success', 'Contractor assigned successfully');
        loadMaintenanceData();
      } else {
        Alert.alert('Error', 'Failed to assign contractor');
      }
      setShowAssignModal(false);
    } catch {
      Alert.alert('Error', 'Failed to assign contractor');
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string, notes: string) => {
    try {
      const response = await landlordService.updateMaintenanceStatus(requestId, status, notes) as any;
      
      if (response.success) {
        Alert.alert('Success', 'Status updated successfully');
        loadMaintenanceData();
      } else {
        Alert.alert('Error', 'Failed to update status');
      }
      setShowUpdateModal(false);
    } catch {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const callContractor = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
          <Text className="mt-4 text-gray-600">Loading maintenance requests...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <VStack space="md" className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Maintenance Management</Text>
          
          {/* Stats Cards */}
          <HStack space="sm">
            <Card className="flex-1 p-3 bg-white">
              <VStack space="xs" className="items-center">
                <Text className="text-xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </Text>
                <Text className="text-xs text-gray-600 text-center">Pending</Text>
              </VStack>
            </Card>
            
            <Card className="flex-1 p-3 bg-white">
              <VStack space="xs" className="items-center">
                <Text className="text-xl font-bold text-blue-600">
                  {requests.filter(r => r.status === 'in_progress').length}
                </Text>
                <Text className="text-xs text-gray-600 text-center">In Progress</Text>
              </VStack>
            </Card>
            
            <Card className="flex-1 p-3 bg-white">
              <VStack space="xs" className="items-center">
                <Text className="text-xl font-bold text-red-600">
                  {requests.filter(r => r.priority === 'urgent').length}
                </Text>
                <Text className="text-xs text-gray-600 text-center">Urgent</Text>
              </VStack>
            </Card>
          </HStack>
        </VStack>

        {/* Filters */}
        <Card className="p-4 bg-white mb-6">
          <VStack space="md">
            <Text className="text-lg font-semibold text-gray-900">Filters</Text>
            
            <HStack space="md">
              <VStack space="sm" className="flex-1">
                <Text className="text-sm font-medium text-gray-700">Status</Text>
                <Select
                  selectedValue={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value)}
                >
                  <SelectTrigger variant="outline" size="sm">
                    <SelectInput placeholder="All Status" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="All Status" value="all" />
                      <SelectItem label="Pending" value="pending" />
                      <SelectItem label="Assigned" value="assigned" />
                      <SelectItem label="In Progress" value="in_progress" />
                      <SelectItem label="Completed" value="completed" />
                      <SelectItem label="Cancelled" value="cancelled" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>

              <VStack space="sm" className="flex-1">
                <Text className="text-sm font-medium text-gray-700">Priority</Text>
                <Select
                  selectedValue={selectedPriority}
                  onValueChange={(value) => setSelectedPriority(value)}
                >
                  <SelectTrigger variant="outline" size="sm">
                    <SelectInput placeholder="All Priority" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="All Priority" value="all" />
                      <SelectItem label="Urgent" value="urgent" />
                      <SelectItem label="High" value="high" />
                      <SelectItem label="Medium" value="medium" />
                      <SelectItem label="Low" value="low" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Maintenance Requests */}
        <VStack space="md" className="mb-6">
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4 bg-white">
                <VStack space="md">
                  <HStack space="md" className="items-start">
                    <Box className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                    <VStack space="sm" className="flex-1">
                      <Box className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <Box className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </VStack>
                    <VStack space="xs" className="items-end">
                      <Box className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
                      <Box className="h-5 bg-gray-200 rounded-full animate-pulse w-12" />
                    </VStack>
                  </HStack>
                  <Box className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                  <Box className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  <HStack space="sm" className="justify-between items-center">
                    <Box className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                    <Box className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                  </HStack>
                </VStack>
              </Card>
            ))
          ) : filteredRequests.length === 0 ? (
            <Card className="p-8 bg-white">
              <VStack space="md" className="items-center">
                <MaterialCommunityIcons name="wrench-outline" size={64} color="#D1D5DB" />
                <Text className="text-lg font-semibold text-gray-900">No Maintenance Requests</Text>
                <Text className="text-sm text-gray-600 text-center">
                  {selectedStatus !== 'all' || selectedPriority !== 'all' 
                    ? 'No requests match your current filters. Try adjusting the filters above.'
                    : 'No maintenance requests have been submitted yet. New requests will appear here.'}
                </Text>
                {(selectedStatus !== 'all' || selectedPriority !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setSelectedStatus('all');
                      setSelectedPriority('all');
                    }}
                  >
                    <ButtonText>Clear Filters</ButtonText>
                  </Button>
                )}
              </VStack>
            </Card>
          ) : (
            filteredRequests.map((request, index) => (
              <Card key={`request-${request.id}-${index}`} className="p-4 bg-white">
                <VStack space="md">
                  {/* Header */}
                  <HStack className="justify-between items-start">
                    <HStack space="sm" className="flex-1">
                      <MaterialCommunityIcons 
                        name={getCategoryIcon(request.category)} 
                        size={24} 
                        color={getPriorityColor(request.priority)} 
                      />
                      <VStack space="xs" className="flex-1">
                        <Text className="font-semibold text-gray-900" numberOfLines={1}>
                          {request.title}
                        </Text>
                        <Text className="text-sm text-gray-600" numberOfLines={1}>
                          {request.propertyName}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <VStack space="xs" className="items-end">
                      <Badge 
                        variant="solid" 
                        style={{ backgroundColor: getStatusColor(request.status) + '20' }}
                      >
                        <BadgeText style={{ color: getStatusColor(request.status) }} className="text-xs">
                          {request.status.replace('_', ' ').toUpperCase()}
                        </BadgeText>
                      </Badge>
                      <Badge 
                        variant="solid" 
                        style={{ backgroundColor: getPriorityColor(request.priority) + '20' }}
                      >
                        <BadgeText style={{ color: getPriorityColor(request.priority) }} className="text-xs">
                          {request.priority.toUpperCase()}
                        </BadgeText>
                      </Badge>
                    </VStack>
                  </HStack>

                  {/* Description */}
                  <Text className="text-sm text-gray-700" numberOfLines={3}>
                    {request.description}
                  </Text>

                  {/* Details */}
                  <VStack space="sm">
                    <HStack className="justify-between">
                      <Text className="text-sm text-gray-600">Tenant:</Text>
                      <Text className="text-sm font-medium text-gray-900">{request.tenantName}</Text>
                    </HStack>
                    
                    <HStack className="justify-between">
                      <Text className="text-sm text-gray-600">Created:</Text>
                      <Text className="text-sm text-gray-900">{formatDate(request.createdAt)}</Text>
                    </HStack>

                    {request.assignedContractor && (
                      <HStack className="justify-between">
                        <Text className="text-sm text-gray-600">Contractor:</Text>
                        <Text className="text-sm font-medium text-blue-600">{request.assignedContractor}</Text>
                      </HStack>
                    )}

                    {request.estimatedCost && (
                      <HStack className="justify-between">
                        <Text className="text-sm text-gray-600">Estimated Cost:</Text>
                        <Text className="text-sm font-medium text-green-600">
                          {request.estimatedCost.toLocaleString()} MAD
                        </Text>
                      </HStack>
                    )}

                    {request.actualCost && (
                      <HStack className="justify-between">
                        <Text className="text-sm text-gray-600">Actual Cost:</Text>
                        <Text className="text-sm font-medium text-green-600">
                          {request.actualCost.toLocaleString()} MAD
                        </Text>
                      </HStack>
                    )}
                  </VStack>

                  {/* Action Buttons */}
                  <HStack space="sm">
                    {request.status === 'pending' && (
                      <Button 
                        variant="solid" 
                        size="sm" 
                        className="flex-1 bg-blue-600"
                        onPress={() => {
                          setSelectedRequest(request);
                          setShowAssignModal(true);
                        }}
                      >
                        <MaterialCommunityIcons name="account-plus" size={16} color="white" />
                        <ButtonText className="ml-1">Assign</ButtonText>
                      </Button>
                    )}
                    
                    {(request.status === 'assigned' || request.status === 'in_progress') && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onPress={() => {
                          setSelectedRequest(request);
                          setUpdateNotes('');
                          setEstimatedCost(request.estimatedCost?.toString() || '');
                          setShowUpdateModal(true);
                        }}
                      >
                        <MaterialCommunityIcons name="update" size={16} color="#6B7280" />
                        <ButtonText className="ml-1">Update</ButtonText>
                      </Button>
                    )}

                    {request.assignedContractor && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onPress={() => {
                          const contractor = contractors.find(c => c.name === request.assignedContractor);
                          if (contractor) callContractor(contractor.phone);
                        }}
                      >
                        <MaterialCommunityIcons name="phone" size={16} color="#6B7280" />
                        <ButtonText className="ml-1">Call</ButtonText>
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </Card>
            ))
          )}
        </VStack>

        {/* Assign Contractor Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          size="lg"
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Text className="text-lg font-semibold">Assign Contractor</Text>
              <ModalCloseButton>
                <CloseIcon size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack space="md">
                <Text className="text-sm text-gray-600">
                  Select a contractor for: {selectedRequest?.title}
                </Text>
                
                <VStack space="sm">
                  {contractors.filter(c => c.availability === 'available').map((contractor) => (
                    <Pressable
                      key={contractor.id}
                      onPress={() => setSelectedContractor(contractor.id)}
                    >
                      <Card className={`p-3 ${selectedContractor === contractor.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                        <HStack className="justify-between items-center">
                          <VStack space="xs" className="flex-1">
                            <Text className="font-medium text-gray-900">{contractor.name}</Text>
                            <Text className="text-sm text-gray-600">{contractor.specialty}</Text>
                            <HStack space="xs" className="items-center">
                              <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
                              <Text className="text-sm text-gray-600">{contractor.rating}</Text>
                            </HStack>
                          </VStack>
                          <VStack space="xs" className="items-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onPress={() => callContractor(contractor.phone)}
                            >
                              <MaterialCommunityIcons name="phone" size={16} color="#6B7280" />
                            </Button>
                          </VStack>
                        </HStack>
                      </Card>
                    </Pressable>
                  ))}
                </VStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack space="sm" className="justify-end">
                <Button
                  variant="outline"
                  onPress={() => setShowAssignModal(false)}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button
                  variant="solid"
                  className="bg-blue-600"
                  isDisabled={!selectedContractor}
                  onPress={() => {
                    if (selectedRequest && selectedContractor) {
                      handleAssignContractor(selectedRequest.id, selectedContractor);
                    }
                  }}
                >
                  <ButtonText>Assign</ButtonText>
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Update Status Modal */}
        <Modal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          size="lg"
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Text className="text-lg font-semibold">Update Maintenance Request</Text>
              <ModalCloseButton>
                <CloseIcon size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack space="md">
                <Text className="text-sm text-gray-600">
                  Update status for: {selectedRequest?.title}
                </Text>
                
                <VStack space="sm">
                  <Text className="text-sm font-medium text-gray-700">Status</Text>
                  <Select
                    selectedValue={selectedRequest?.status}
                    onValueChange={(value) => {
                      if (selectedRequest) {
                        setSelectedRequest({ ...selectedRequest, status: value as any });
                      }
                    }}
                  >
                    <SelectTrigger variant="outline">
                      <SelectInput placeholder="Select status" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Assigned" value="assigned" />
                        <SelectItem label="In Progress" value="in_progress" />
                        <SelectItem label="Completed" value="completed" />
                        <SelectItem label="Cancelled" value="cancelled" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </VStack>

                <VStack space="sm">
                  <Text className="text-sm font-medium text-gray-700">Estimated Cost (MAD)</Text>
                  <Input variant="outline">
                    <InputField
                      placeholder="Enter estimated cost"
                      value={estimatedCost}
                      onChangeText={setEstimatedCost}
                      keyboardType="numeric"
                    />
                  </Input>
                </VStack>

                <VStack space="sm">
                  <Text className="text-sm font-medium text-gray-700">Notes</Text>
                  <Textarea>
                    <TextareaInput
                      placeholder="Add update notes..."
                      value={updateNotes}
                      onChangeText={setUpdateNotes}
                    />
                  </Textarea>
                </VStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack space="sm" className="justify-end">
                <Button
                  variant="outline"
                  onPress={() => setShowUpdateModal(false)}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button
                  variant="solid"
                  className="bg-blue-600"
                  onPress={() => {
                    if (selectedRequest) {
                      handleUpdateStatus(selectedRequest.id, selectedRequest.status, updateNotes);
                    }
                  }}
                >
                  <ButtonText>Update</ButtonText>
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MaintenanceManagementScreen;
