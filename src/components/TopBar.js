import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  const userLabel = user?.email || user?.phoneNumber || (user?.userId != null ? String(user.userId) : '');

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const menuItems = [
    { id: 'home', title: '🏠 Home', onPress: () => { setIsMenuOpen(false); navigation.navigate('Dashboard'); } },
    { id: 'categories', title: '📁 Manage Categories', onPress: () => { setIsMenuOpen(false); navigation.navigate('ManageCategories'); } },
    { id: 'transactions', title: '📝 Manage Transactions', onPress: () => { setIsMenuOpen(false); navigation.navigate('ManageTransactions'); } },
    { id: 'analysis', title: '📊 Financial Analysis', onPress: () => { setIsMenuOpen(false); navigation.navigate('FinancialAnalysis'); } },
    { id: 'logout', title: '🚪 Logout', onPress: handleLogout },
  ];

  return (
    <>
      <View style={styles.container}>
        {/* Left: User ID */}
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>User:</Text>
          <Text style={styles.userName}>{userLabel || '-'}</Text>
        </View>

        {/* Right: Hamburger menu (3 lines) */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <View style={styles.hamburger}>
            <View style={styles.line} />
            <View style={styles.line} />
            <View style={styles.line} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Side Menu - exactly like expense-ui */}
      {isMenuOpen && (
        <Modal
          visible={true}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsMenuOpen(false)}
        >
          {/* Overlay */}
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <View style={styles.menuPanel}>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity 
                  onPress={() => setIsMenuOpen(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {/* Menu Items */}
              <View style={styles.menuItems}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  menuButton: {
    padding: 8,
    borderRadius: 6,
  },
  hamburger: {
    gap: 4,
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: '#000000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 256,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 50,
  },
  menuContent: {
    padding: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#374151',
  },
  menuItems: {
    gap: 8,
  },
  menuItem: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000000',
  },
});

export default TopBar;
