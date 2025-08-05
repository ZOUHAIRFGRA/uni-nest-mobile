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
import { ChevronDownIcon, X as CloseIcon, Upload, Download, Eye } from 'lucide-react-native';
import { Input, InputField } from '../../components/ui/input';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '../../components/ui/modal';

interface Document {
  _id: string;
  landlordId: string;
  propertyId?: {
    _id: string;
    title: string;
    location?: {
      type: string;
      coordinates: number[];
    };
  };
  title: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  expiryDate?: string;
  tags: string[];
  isShared: boolean;
  accessLevel: string;
  version: number;
  isActive: boolean;
  downloadCount: number;
  documentId: string;
  uploadDate: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentCategory {
  type: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

// Category mapping for backend categories to UI display
const categoryMapping: Record<string, DocumentCategory> = {
  'insurance_policy': { type: 'insurance_policy', name: 'Insurance', icon: 'shield-check-outline', color: '#06B6D4', count: 0 },
  'lease_agreement': { type: 'lease_agreement', name: 'Contracts', icon: 'file-document-outline', color: '#3B82F6', count: 0 },
  'tax_document': { type: 'tax_document', name: 'Tax Documents', icon: 'calculator', color: '#EF4444', count: 0 },
  'receipt': { type: 'receipt', name: 'Receipts', icon: 'receipt', color: '#10B981', count: 0 },
  'invoice': { type: 'invoice', name: 'Invoices', icon: 'file-chart-outline', color: '#F59E0B', count: 0 },
  'legal': { type: 'legal', name: 'Legal', icon: 'gavel', color: '#8B5CF6', count: 0 },
  'other': { type: 'other', name: 'Other', icon: 'file-outline', color: '#6B7280', count: 0 }
};

const DocumentManagementScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [properties, setProperties] = useState<{ _id: string; title: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [uploadCategory, setUploadCategory] = useState('lease_agreement');
  const [uploadProperty, setUploadProperty] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load documents from API - match service method signature:
      // getDocuments(category?, propertyId?, tenantId?, tags?, search?, page = 1, limit = 20)
      const response = await landlordService.getDocuments(
        selectedCategory !== 'all' ? selectedCategory : undefined, // category
        selectedProperty !== 'all' ? selectedProperty : undefined, // propertyId
        undefined, // tenantId
        undefined, // tags
        searchQuery || undefined, // search
        1, // page
        20 // limit
      ) as any;

      if (response?.success) {
        const documentsData = response.data?.documents || [];
        setDocuments(documentsData);

        // Extract unique properties from documents for the filter dropdown
        const uniqueProperties = documentsData
          .filter((doc: Document) => doc.propertyId && doc.propertyId.title)
          .reduce((acc: { _id: string; title: string }[], doc: Document) => {
            const exists = acc.find(p => p._id === doc.propertyId?._id);
            if (!exists && doc.propertyId) {
              acc.push({ _id: doc.propertyId._id, title: doc.propertyId.title });
            }
            return acc;
          }, []);
        setProperties(uniqueProperties);
      }

      // Create categories from actual document data and mapping
      const categoryData = Object.values(categoryMapping).map(cat => ({ ...cat, count: 0 }));
      
      // Count documents by category
      const documentsData = response?.data?.documents || [];
      documentsData.forEach((doc: Document) => {
        const mappedCategory = categoryMapping[doc.category];
        if (mappedCategory) {
          const category = categoryData.find(cat => cat.type === doc.category);
          if (category) {
            category.count++;
          }
        }
      });

      setCategories(categoryData);

    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedProperty, searchQuery]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = documents.filter(doc => {
    const categoryMatch = selectedCategory === 'all' || doc.category === selectedCategory;
    const propertyMatch = selectedProperty === 'all' || doc.propertyId?._id === selectedProperty;
    const statusMatch = selectedStatus === 'all' || 
      (selectedStatus === 'active' && doc.isActive) ||
      (selectedStatus === 'expired' && doc.expiryDate && new Date(doc.expiryDate) < new Date()) ||
      (selectedStatus === 'archived' && !doc.isActive);
    const searchMatch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && propertyMatch && statusMatch && searchMatch;
  });

  const handleDocumentPicker = async () => {
    try {
      // Mock document picker for development
      const mockDocument = {
        name: 'Sample Document.pdf',
        uri: 'file://sample.pdf',
        size: 1234567,
        mimeType: 'application/pdf'
      };
      
      Alert.alert('Document Picker', 'In a real app, this would open the document picker', [
        { text: 'Cancel' },
        { text: 'Select Mock', onPress: () => setSelectedDocument(mockDocument) }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedDocument) {
      Alert.alert('Error', 'Please select a document first');
      return;
    }

    try {
      setUploading(true);
      
      const response = await landlordService.uploadDocument({
        propertyId: uploadProperty || undefined,
        title: selectedDocument.name,
        category: uploadCategory,
        fileUrl: selectedDocument.uri,
        fileName: selectedDocument.name,
        fileSize: selectedDocument.size || 0,
        mimeType: selectedDocument.mimeType || 'application/pdf'
      }) as any;

      if (response?.success) {
        Alert.alert('Success', 'Document uploaded successfully');
        loadDocuments();
        setShowUploadModal(false);
        setSelectedDocument(null);
        setUploadCategory('lease_agreement');
        setUploadProperty('');
      } else {
        Alert.alert('Error', response?.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      if (document.fileUrl) {
        await Linking.openURL(document.fileUrl);
      } else {
        Alert.alert('Error', 'Document URL not available');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  const handleViewDocument = async (document: Document) => {
    try {
      if (document.fileUrl) {
        await Linking.openURL(document.fileUrl);
      } else {
        Alert.alert('Error', 'Document URL not available');
      }
    } catch (error) {
      console.error('View error:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  const getStatusColor = (document: Document): string => {
    if (!document.isActive) return '#6B7280'; // archived - gray
    if (document.expiryDate && new Date(document.expiryDate) < new Date()) return '#EF4444'; // expired - red
    return '#10B981'; // active - green
  };

  const getStatusText = (document: Document): string => {
    if (!document.isActive) return 'ARCHIVED';
    if (document.expiryDate && new Date(document.expiryDate) < new Date()) return 'EXPIRED';
    return 'ACTIVE';
  };

  const isExpiringSoon = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
          <Text className="mt-4 text-gray-600">Loading documents...</Text>
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
          <HStack className="justify-between items-center">
            <Text className="text-2xl font-bold text-gray-900">Document Management</Text>
            <Button
              variant="solid"
              size="sm"
              className="bg-blue-600"
              onPress={() => setShowUploadModal(true)}
            >
              <Upload size={16} color="white" />
              <ButtonText className="ml-1">Upload</ButtonText>
            </Button>
          </HStack>

          {/* Search */}
          <HStack space="sm">
            <Input variant="outline" className="flex-1">
              <InputField
                placeholder="Search documents..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={loadDocuments}
                returnKeyType="search"
              />
            </Input>
            <Button
              variant="outline"
              size="sm"
              onPress={loadDocuments}
            >
              <MaterialCommunityIcons name="magnify" size={20} color="#6B7280" />
            </Button>
          </HStack>
        </VStack>

        {/* Categories Grid */}
        <Card className="p-4 bg-white mb-6">
          <VStack space="md">
            <Text className="text-lg font-semibold text-gray-900">Categories</Text>
            
            <VStack space="sm">
              {/* Add "All Categories" option */}
              <Pressable
                onPress={() => setSelectedCategory('all')}
                className="mb-2"
              >
                <Card className={`p-3 ${selectedCategory === 'all' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                  <HStack space="sm" className="items-center justify-center">
                    <MaterialCommunityIcons 
                      name="file-multiple-outline" 
                      size={20} 
                      color="#6B7280" 
                    />
                    <Text className="text-sm font-medium text-gray-900">
                      All Categories
                    </Text>
                    <Badge variant="solid" style={{ backgroundColor: '#6B728020' }}>
                      <BadgeText style={{ color: '#6B7280' }} className="text-xs">
                        {documents.length}
                      </BadgeText>
                    </Badge>
                  </HStack>
                </Card>
              </Pressable>

              {/* Category Grid */}
              {categories.reduce((rows: DocumentCategory[][], category, index) => {
                if (index % 2 === 0) rows.push([category]);
                else rows[rows.length - 1].push(category);
                return rows;
              }, []).map((row, rowIndex) => (
                <HStack key={rowIndex} space="sm">
                  {row.map((category) => (
                    <Pressable
                      key={category.type}
                      onPress={() => setSelectedCategory(category.type)}
                      className="flex-1"
                    >
                      <Card className={`p-3 ${selectedCategory === category.type ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                        <VStack space="xs" className="items-center">
                          <MaterialCommunityIcons 
                            name={category.icon as any} 
                            size={24} 
                            color={category.color} 
                          />
                          <Text className="text-sm font-medium text-gray-900 text-center">
                            {category.name}
                          </Text>
                          <Badge variant="solid" style={{ backgroundColor: category.color + '20' }}>
                            <BadgeText style={{ color: category.color }} className="text-xs">
                              {category.count}
                            </BadgeText>
                          </Badge>
                        </VStack>
                      </Card>
                    </Pressable>
                  ))}
                  {row.length === 1 && <Box className="flex-1" />}
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Card>

        {/* Filters */}
        <Card className="p-4 bg-white mb-6">
          <VStack space="md">
            <Text className="text-lg font-semibold text-gray-900">Filters</Text>
            
            <HStack space="md">
              <VStack space="sm" className="flex-1">
                <Text className="text-sm font-medium text-gray-700">Property</Text>
                <Select
                  selectedValue={selectedProperty}
                  onValueChange={(value) => setSelectedProperty(value)}
                >
                  <SelectTrigger variant="outline" size="sm">
                    <SelectInput placeholder="All Properties" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="All Properties" value="all" />
                      {properties.map((property) => (
                        <SelectItem key={property._id} label={property.title} value={property._id} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>

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
                      <SelectItem label="Active" value="active" />
                      <SelectItem label="Archived" value="archived" />
                      <SelectItem label="Expired" value="expired" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Documents List */}
        <VStack space="md" className="mb-6">
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-4 bg-white">
                <VStack space="md">
                  <HStack className="justify-between items-start">
                    <HStack space="sm" className="flex-1">
                      <Box className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                      <VStack space="xs" className="flex-1">
                        <Box className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <Box className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                      </VStack>
                    </HStack>
                    <VStack space="xs" className="items-end">
                      <Box className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
                      <Box className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                    </VStack>
                  </HStack>
                  <HStack className="justify-between items-center">
                    <Box className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                    <Box className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                  </HStack>
                </VStack>
              </Card>
            ))
          ) : filteredDocuments.length === 0 ? (
            <Card className="p-8 bg-white">
              <VStack space="md" className="items-center">
                <MaterialCommunityIcons name="file-document-outline" size={64} color="#D1D5DB" />
                <Text className="text-lg font-semibold text-gray-900">No Documents Found</Text>
                <Text className="text-sm text-gray-600 text-center">
                  {selectedCategory !== 'all' || selectedProperty !== 'all' || searchQuery
                    ? 'No documents match your current filters. Try adjusting the filters above.'
                    : 'Upload your first document to get started with document management.'}
                </Text>
                {(selectedCategory !== 'all' || selectedProperty !== 'all' || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setSelectedCategory('all');
                      setSelectedProperty('all');
                      setSearchQuery('');
                    }}
                  >
                    <ButtonText>Clear Filters</ButtonText>
                  </Button>
                )}
              </VStack>
            </Card>
          ) : (
            filteredDocuments.map((document) => (
              <Card key={document._id} className="p-4 bg-white">
                <VStack space="md">
                  {/* Header */}
                  <HStack className="justify-between items-start">
                    <HStack space="sm" className="flex-1">
                      <MaterialCommunityIcons 
                        name={categoryMapping[document.category]?.icon as any || 'file-outline'} 
                        size={24} 
                        color={categoryMapping[document.category]?.color || '#6B7280'} 
                      />
                      <VStack space="xs" className="flex-1">
                        <Text className="font-semibold text-gray-900" numberOfLines={2}>
                          {document.title}
                        </Text>
                        {document.propertyId?.title && (
                          <Text className="text-sm text-gray-600" numberOfLines={1}>
                            {document.propertyId.title}
                          </Text>
                        )}
                        {document.description && (
                          <Text className="text-sm text-blue-600" numberOfLines={1}>
                            {document.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    
                    <VStack space="xs" className="items-end">
                      <Badge 
                        variant="solid" 
                        style={{ backgroundColor: getStatusColor(document) + '20' }}
                      >
                        <BadgeText style={{ color: getStatusColor(document) }} className="text-xs">
                          {getStatusText(document)}
                        </BadgeText>
                      </Badge>
                      {document.expiryDate && isExpiringSoon(document.expiryDate) && (
                        <Badge variant="solid" className="bg-red-100">
                          <BadgeText className="text-red-800 text-xs">EXPIRING SOON</BadgeText>
                        </Badge>
                      )}
                    </VStack>
                  </HStack>

                  {/* Details */}
                  <VStack space="sm">
                    <HStack className="justify-between">
                      <Text className="text-sm text-gray-600">Size:</Text>
                      <Text className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</Text>
                    </HStack>
                    
                    <HStack className="justify-between">
                      <Text className="text-sm text-gray-600">Uploaded:</Text>
                      <Text className="text-sm text-gray-900">{formatDate(document.uploadDate)}</Text>
                    </HStack>

                    {document.expiryDate && (
                      <HStack className="justify-between">
                        <Text className="text-sm text-gray-600">Expires:</Text>
                        <Text className={`text-sm ${isExpiringSoon(document.expiryDate) ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(document.expiryDate)}
                        </Text>
                      </HStack>
                    )}

                    {document.tags.length > 0 && (
                      <VStack space="xs">
                        <Text className="text-sm text-gray-600">Tags:</Text>
                        <HStack space="xs" className="flex-wrap">
                          {document.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100">
                              <BadgeText className="text-gray-700 text-xs">{tag}</BadgeText>
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                    )}
                  </VStack>

                  {/* Action Buttons */}
                  <HStack space="sm">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onPress={() => handleViewDocument(document)}
                    >
                      <Eye size={16} color="#6B7280" />
                      <ButtonText className="ml-1">View</ButtonText>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onPress={() => handleDownloadDocument(document)}
                    >
                      <Download size={16} color="#6B7280" />
                      <ButtonText className="ml-1">Download</ButtonText>
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onPress={() => Linking.openURL(`mailto:?subject=Document: ${document.title}&body=Please find the attached document.`)}
                    >
                      <MaterialCommunityIcons name="share" size={16} color="#6B7280" />
                      <ButtonText className="ml-1">Share</ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              </Card>
            ))
          )}
        </VStack>

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          size="lg"
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Text className="text-lg font-semibold">Upload Document</Text>
              <ModalCloseButton>
                <CloseIcon size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack space="md">
                <VStack space="sm">
                  <Text className="text-sm font-medium text-gray-700">Document Type</Text>
                  <Select
                    selectedValue={uploadCategory}
                    onValueChange={(value) => setUploadCategory(value)}
                  >
                    <SelectTrigger variant="outline">
                      <SelectInput placeholder="Select document type" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Lease Agreement" value="lease_agreement" />
                        <SelectItem label="Receipt" value="receipt" />
                        <SelectItem label="Invoice" value="invoice" />
                        <SelectItem label="Legal Document" value="legal" />
                        <SelectItem label="Insurance Policy" value="insurance_policy" />
                        <SelectItem label="Tax Document" value="tax_document" />
                        <SelectItem label="Other" value="other" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </VStack>

                <VStack space="sm">
                  <Text className="text-sm font-medium text-gray-700">Property (Optional)</Text>
                  <Select
                    selectedValue={uploadProperty}
                    onValueChange={(value) => setUploadProperty(value)}
                  >
                    <SelectTrigger variant="outline">
                      <SelectInput placeholder="Select property" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="No Property" value="" />
                        {properties.map((property) => (
                          <SelectItem key={property._id} label={property.title} value={property._id} />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </VStack>

                <VStack space="sm">
                  <Text className="text-sm font-medium text-gray-700">Select Document</Text>
                  <Button
                    variant="outline"
                    onPress={handleDocumentPicker}
                  >
                    <Upload size={16} color="#6B7280" />
                    <ButtonText className="ml-2">Choose File</ButtonText>
                  </Button>
                  
                  {selectedDocument && (
                    <Card className="p-3 bg-gray-50">
                      <HStack className="justify-between items-center">
                        <VStack space="xs" className="flex-1">
                          <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                            {selectedDocument.name}
                          </Text>
                          <Text className="text-xs text-gray-600">
                            {formatFileSize(selectedDocument.size || 0)}
                          </Text>
                        </VStack>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => setSelectedDocument(null)}
                        >
                          <CloseIcon size={16} color="#6B7280" />
                        </Button>
                      </HStack>
                    </Card>
                  )}
                </VStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack space="sm" className="justify-end">
                <Button
                  variant="outline"
                  onPress={() => setShowUploadModal(false)}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button
                  variant="solid"
                  className="bg-blue-600"
                  isDisabled={!selectedDocument || uploading}
                  onPress={handleUploadDocument}
                >
                  {uploading && <Spinner size="small" />}
                  <ButtonText className={uploading ? 'ml-2' : ''}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </ButtonText>
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentManagementScreen;
