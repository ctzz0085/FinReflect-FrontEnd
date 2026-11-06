import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TopBar from '../components/TopBar';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ManageTransactionsScreen from '../screens/transactions/ManageTransactionsScreen';
import FinancialAnalysisScreen from '../screens/analysis/FinancialAnalysisScreen';
import BankStatementScreen from '../screens/analysis/BankStatementScreen';
import BankStatementReportScreen from '../screens/analysis/BankStatementReportScreen';
import ManageCategoriesScreen from '../screens/categories/ManageCategoriesScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="BankStatement"
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
      <Stack.Screen 
        name="BankStatement" 
        component={BankStatementScreen}
        options={{ header: () => <TopBar dark /> }}
      />
      <Stack.Screen 
        name="BankStatementReport" 
        component={BankStatementReportScreen}
        options={{ header: () => <TopBar dark /> }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
