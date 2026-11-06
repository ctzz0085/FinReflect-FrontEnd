import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Hidden for now. The screens and routes are kept in MainNavigator, so these can
// come back as top bar actions or a menu later:
// { id: 'dashboard', title: 'Dashboard', route: 'Dashboard' },
// { id: 'categories', title: 'Manage Categories', route: 'ManageCategories' },
// { id: 'transactions', title: 'Manage Transactions', route: 'ManageTransactions' },
// { id: 'analysis', title: 'Financial Analysis', route: 'FinancialAnalysis' },

const TopBar = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  const userLabel = user?.email || user?.phoneNumber || (user?.userId != null ? String(user.userId) : '');

  return (
    <View style={styles.container}>
      {/* Left: signed-in user */}
      <View style={styles.userContainer}>
        <Text style={styles.userLabel}>User:</Text>
        <Text style={styles.userName} numberOfLines={1}>{userLabel || '-'}</Text>
      </View>

      {/* Right: actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.popTo('BankStatement', { openUpload: Date.now() })}
          accessibilityRole="button"
          accessibilityLabel="Home"
        >
          <MaterialIcons name="home" size={22} color={colors.primaryLight} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <MaterialIcons name="logout" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  userName: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default TopBar;
