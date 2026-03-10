import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TopBar from '../components/TopBar';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ManageTransactionsScreen from '../screens/transactions/ManageTransactionsScreen';
import FinancialAnalysisScreen from '../screens/analysis/FinancialAnalysisScreen';
import ManageCategoriesScreen from '../screens/categories/ManageCategoriesScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <TopBar />,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
      />
      <Stack.Screen 
        name="ManageCategories" 
        component={ManageCategoriesScreen}
      />
      <Stack.Screen 
        name="ManageTransactions" 
        component={ManageTransactionsScreen}
      />
      <Stack.Screen 
        name="FinancialAnalysis" 
        component={FinancialAnalysisScreen}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
