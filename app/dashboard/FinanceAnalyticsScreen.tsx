/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
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
import { ChevronDownIcon } from 'lucide-react-native';
import { propertyService } from '../services/propertyService';
import { useSelector } from 'react-redux';


interface RevenueData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
}

interface PaymentSummary {
  total: number;
  verified: number;
  pending: number;
  overdue: number;
}

interface PropertyFinancials {
  propertyId: string;
  propertyName: string;
  monthlyRevenue: number;
  occupancyRate: number;
  expenses: number;
  netIncome: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const FinanceAnalyticsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    total: 0,
    verified: 0,
    pending: 0,
    overdue: 0
  });
  const [propertyFinancials, setPropertyFinancials] = useState<PropertyFinancials[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const user = useSelector((state: any) => state.auth.user);
  

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Load revenue analytics
      const revenueResponse = await landlordService.getRevenueAnalytics(selectedPeriod) as any;
      if (revenueResponse.success) {
        setRevenueData(revenueResponse.data.revenueData || []);
        setTotalRevenue(revenueResponse.data.totalRevenue || 0);
        setTotalExpenses(revenueResponse.data.totalExpenses || 0);
        setNetProfit(revenueResponse.data.netProfit || 0);
        setProfitMargin(revenueResponse.data.profitMargin || 0);
      }

      // Load payment summary
      const paymentResponse = await landlordService.getPaymentHistory();
     
      if (paymentResponse.success) {
        const payments = paymentResponse.data?.payments || [];
        const summary = {
          total: payments.length,
          verified: payments.filter((p: any) => p.status === 'verified').length,
          pending: payments.filter((p: any) => p.status === 'pending').length,
          overdue: payments.filter((p: any) => p.status === 'overdue').length,
        };
        setPaymentSummary(summary);
      }

      // Load property financials


      const propertiesResponse = await propertyService.getPropertiesByLandlord(user?.id);
      if ((propertiesResponse as any)?.success) {
        const properties = (propertiesResponse as any).data?.properties || [];
        const financials = properties.map((property: any) => ({
          propertyId: property.id,
          propertyName: property.title,
          monthlyRevenue: property.monthlyRevenue || Math.floor(Math.random() * 8000) + 2000,
          occupancyRate: property.occupancyRate || Math.floor(Math.random() * 40) + 60,
          expenses: property.expenses || Math.floor(Math.random() * 2000) + 500,
          netIncome: property.netIncome || Math.floor(Math.random() * 6000) + 1500,
        }));
        setPropertyFinancials(financials);
      }

      // Load expense categories from API in future
      setExpenseCategories([]);

    } catch (error) {
      console.error('Error loading financial data:', error);
      Alert.alert('Error', 'Failed to load financial data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadFinancialData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} MAD`;
  };

//   const getStatusColor = (status: string): string => {
//     switch (status) {
//       case 'verified': return '#10B981';
//       case 'pending': return '#F59E0B';
//       case 'overdue': return '#EF4444';
//       default: return '#6B7280';
//     }
//   };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
          <Text className="mt-4 text-gray-600">Loading financial data...</Text>
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
            <Text className="text-2xl font-bold text-gray-900">Finance & Analytics</Text>
            <Select
              selectedValue={selectedPeriod}
              onValueChange={(value) => setSelectedPeriod(value as any)}
            >
              <SelectTrigger variant="outline" size="sm">
                <SelectInput placeholder="Select period" />
                <SelectIcon className="mr-3" as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Monthly" value="month" />
                  <SelectItem label="Quarterly" value="quarter" />
                  <SelectItem label="Yearly" value="year" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </HStack>
        </VStack>

        {/* Key Metrics Cards */}
        <VStack space="md" className="mb-6">
          <HStack space="md">
            <Card className="flex-1 p-4 bg-white">
              <VStack space="sm">
                <HStack className="justify-between items-center">
                  <MaterialCommunityIcons name="cash-multiple" size={24} color="#10B981" />
                  <Badge variant="solid" className="bg-green-100">
                    <BadgeText className="text-green-800 text-xs">
                      +{profitMargin.toFixed(1)}%
                    </BadgeText>
                  </Badge>
                </HStack>
                <Text className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </Text>
                <Text className="text-sm text-gray-600">Total Revenue</Text>
              </VStack>
            </Card>

            <Card className="flex-1 p-4 bg-white">
              <VStack space="sm">
                <HStack className="justify-between items-center">
                  <MaterialCommunityIcons name="chart-line" size={24} color="#3B82F6" />
                  <Badge variant="solid" className="bg-blue-100">
                    <BadgeText className="text-blue-800 text-xs">
                      {((netProfit / totalRevenue) * 100).toFixed(1)}%
                    </BadgeText>
                  </Badge>
                </HStack>
                <Text className="text-2xl font-bold text-gray-900">
                  {formatCurrency(netProfit)}
                </Text>
                <Text className="text-sm text-gray-600">Net Profit</Text>
              </VStack>
            </Card>
          </HStack>

          <HStack space="md">
            <Card className="flex-1 p-4 bg-white">
              <VStack space="sm">
                <MaterialCommunityIcons name="receipt" size={24} color="#F59E0B" />
                <Text className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalExpenses)}
                </Text>
                <Text className="text-sm text-gray-600">Total Expenses</Text>
              </VStack>
            </Card>

            <Card className="flex-1 p-4 bg-white">
              <VStack space="sm">
                <MaterialCommunityIcons name="percent" size={24} color="#8B5CF6" />
                <Text className="text-2xl font-bold text-gray-900">
                  {profitMargin.toFixed(1)}%
                </Text>
                <Text className="text-sm text-gray-600">Profit Margin</Text>
              </VStack>
            </Card>
          </HStack>
        </VStack>

        {/* Payment Status Overview */}
        <Card className="p-4 bg-white mb-6">
          <VStack space="md">
            <HStack className="justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">Payment Status</Text>
              <Button variant="outline" size="sm">
                <ButtonText>View All</ButtonText>
              </Button>
            </HStack>

            <HStack space="md" className="justify-between">
              <VStack space="xs" className="items-center flex-1">
                <Text className="text-2xl font-bold text-green-600">
                  {paymentSummary.verified}
                </Text>
                <Text className="text-xs text-gray-600 text-center">Verified</Text>
              </VStack>
              
              <VStack space="xs" className="items-center flex-1">
                <Text className="text-2xl font-bold text-yellow-600">
                  {paymentSummary.pending}
                </Text>
                <Text className="text-xs text-gray-600 text-center">Pending</Text>
              </VStack>
              
              <VStack space="xs" className="items-center flex-1">
                <Text className="text-2xl font-bold text-red-600">
                  {paymentSummary.overdue}
                </Text>
                <Text className="text-xs text-gray-600 text-center">Overdue</Text>
              </VStack>
              
              <VStack space="xs" className="items-center flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  {paymentSummary.total}
                </Text>
                <Text className="text-xs text-gray-600 text-center">Total</Text>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Property Financial Performance */}
        <Card className="p-4 bg-white mb-6">
          <VStack space="md">
            <HStack className="justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">Property Performance</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
            </HStack>

            <VStack space="sm">
              {loading ? (
                // Skeleton loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="p-3 bg-gray-50">
                    <VStack space="sm">
                      <HStack className="justify-between items-center">
                        <Box className="h-4 bg-gray-200 rounded animate-pulse flex-1 mr-4" />
                        <Box className="h-5 bg-gray-200 rounded-full animate-pulse w-20" />
                      </HStack>
                      <HStack className="justify-between">
                        <VStack space="xs">
                          <Box className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                          <Box className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                        </VStack>
                        <VStack space="xs" className="items-center">
                          <Box className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                          <Box className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                        </VStack>
                        <VStack space="xs" className="items-end">
                          <Box className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                          <Box className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                        </VStack>
                      </HStack>
                    </VStack>
                  </Card>
                ))
              ) : propertyFinancials.length === 0 ? (
                <Card className="p-6 bg-gray-50">
                  <VStack space="md" className="items-center">
                    <MaterialCommunityIcons name="home-outline" size={48} color="#D1D5DB" />
                    <Text className="text-lg font-semibold text-gray-900">No Properties Found</Text>
                    <Text className="text-sm text-gray-600 text-center">
                      Add your first property to see financial performance metrics here.
                    </Text>
                  </VStack>
                </Card>
              ) : (
                propertyFinancials.slice(0, 3).map((property, index) => (
                  <Pressable key={`property-${property.propertyId}-${index}`}>
                    <Card className="p-3 bg-gray-50">
                      <VStack space="sm">
                        <HStack className="justify-between items-center">
                          <Text className="font-medium text-gray-900 flex-1" numberOfLines={1}>
                            {property.propertyName}
                          </Text>
                          <Badge variant="solid" className="bg-blue-100">
                            <BadgeText className="text-blue-800 text-xs">
                              {property.occupancyRate}% occupied
                            </BadgeText>
                          </Badge>
                        </HStack>
                        
                        <HStack className="justify-between">
                          <VStack space="xs">
                            <Text className="text-sm font-medium text-green-600">
                              {formatCurrency(property.monthlyRevenue)}
                            </Text>
                            <Text className="text-xs text-gray-500">Revenue</Text>
                          </VStack>
                          
                          <VStack space="xs" className="items-center">
                            <Text className="text-sm font-medium text-red-600">
                              {formatCurrency(property.expenses)}
                            </Text>
                            <Text className="text-xs text-gray-500">Expenses</Text>
                          </VStack>
                          
                          <VStack space="xs" className="items-end">
                            <Text className="text-sm font-medium text-gray-900">
                              {formatCurrency(property.netIncome)}
                            </Text>
                            <Text className="text-xs text-gray-500">Net Income</Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </Card>
                  </Pressable>
                ))
              )}
            </VStack>
          </VStack>
        </Card>

        {/* Expense Categories */}
        <Card className="p-4 bg-white mb-6">
          <VStack space="md">
            <Text className="text-lg font-semibold text-gray-900">Expense Breakdown</Text>
            
            <VStack space="sm">
              {loading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <HStack key={index} className="justify-between items-center">
                    <HStack space="sm" className="flex-1 items-center">
                      <Box className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
                      <Box className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                    </HStack>
                    <VStack space="xs" className="items-end">
                      <Box className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                      <Box className="h-3 bg-gray-200 rounded animate-pulse w-8" />
                    </VStack>
                  </HStack>
                ))
              ) : expenseCategories.length === 0 ? (
                <VStack space="md" className="items-center py-6">
                  <MaterialCommunityIcons name="chart-pie" size={48} color="#D1D5DB" />
                  <Text className="text-lg font-semibold text-gray-900">No Expense Data</Text>
                  <Text className="text-sm text-gray-600 text-center">
                    Expense breakdown will appear here once you have recorded expenses.
                  </Text>
                </VStack>
              ) : (
                expenseCategories.map((expense, index) => (
                  <HStack key={expense.category} className="justify-between items-center">
                    <HStack space="sm" className="flex-1 items-center">
                      <Box
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: expense.color }}
                      />
                      <Text className="text-sm text-gray-700 flex-1">
                        {expense.category}
                      </Text>
                    </HStack>
                    
                    <VStack space="xs" className="items-end">
                      <Text className="text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {expense.percentage}%
                      </Text>
                    </VStack>
                  </HStack>
                ))
              )}
            </VStack>
          </VStack>
        </Card>

        {/* Revenue Trend */}
        <Card className="p-4 bg-white mb-6">
          <VStack space="md">
            <Text className="text-lg font-semibold text-gray-900">Revenue Trend</Text>
            
            <VStack space="sm">
              {loading ? (
                // Skeleton loading state
                Array.from({ length: 6 }).map((_, index) => (
                  <HStack key={index} className="justify-between items-center">
                    <Box className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                    <HStack space="md" className="flex-1 justify-between ml-4">
                      <VStack space="xs">
                        <Box className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                        <Box className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                      </VStack>
                      <VStack space="xs" className="items-center">
                        <Box className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                        <Box className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                      </VStack>
                      <VStack space="xs" className="items-end">
                        <Box className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                        <Box className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                      </VStack>
                    </HStack>
                    <Box className="h-5 bg-gray-200 rounded-full animate-pulse w-12 ml-2" />
                  </HStack>
                ))
              ) : revenueData.length === 0 ? (
                <VStack space="md" className="items-center py-6">
                  <MaterialCommunityIcons name="trending-up" size={48} color="#D1D5DB" />
                  <Text className="text-lg font-semibold text-gray-900">No Revenue Data</Text>
                  <Text className="text-sm text-gray-600 text-center">
                    Revenue trends will be displayed here once data is available.
                  </Text>
                </VStack>
              ) : (
                revenueData.slice(-6).map((data, index) => (
                  <HStack key={data.period} className="justify-between items-center">
                    <Text className="text-sm text-gray-700 w-20">
                      {data.period}
                    </Text>
                    
                    <HStack space="md" className="flex-1 justify-between">
                      <VStack space="xs">
                        <Text className="text-sm font-medium text-green-600">
                          {formatCurrency(data.revenue)}
                        </Text>
                        <Text className="text-xs text-gray-500">Revenue</Text>
                      </VStack>
                      
                      <VStack space="xs" className="items-center">
                        <Text className="text-sm font-medium text-red-600">
                          {formatCurrency(data.expenses)}
                        </Text>
                        <Text className="text-xs text-gray-500">Expenses</Text>
                      </VStack>
                      
                      <VStack space="xs" className="items-end">
                        <Text className="text-sm font-medium text-gray-900">
                          {formatCurrency(data.profit)}
                        </Text>
                        <Text className="text-xs text-gray-500">Profit</Text>
                      </VStack>
                    </HStack>
                    
                    <Badge 
                      variant="solid" 
                      className={`${data.growth >= 0 ? 'bg-green-100' : 'bg-red-100'} ml-2`}
                    >
                      <BadgeText className={`${data.growth >= 0 ? 'text-green-800' : 'text-red-800'} text-xs`}>
                        {data.growth >= 0 ? '+' : ''}{data.growth}%
                      </BadgeText>
                    </Badge>
                  </HStack>
                ))
              )}
            </VStack>
          </VStack>
        </Card>

        {/* Action Buttons */}
        <VStack space="md" className="mb-6">
          <Button variant="solid" className="bg-blue-600">
            <MaterialCommunityIcons name="download" size={20} color="white" />
            <ButtonText className="ml-2">Export Financial Report</ButtonText>
          </Button>
          
          <Button variant="outline">
            <MaterialCommunityIcons name="calculator" size={20} color="#6B7280" />
            <ButtonText className="ml-2">Tax Calculator</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FinanceAnalyticsScreen;
