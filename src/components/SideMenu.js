import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SideMenu = ({ isVisible, onClose }) => {
  const { logout, user } = useAuth();
  const navigation = require('@react-navigation/native').useNavigation();
  const translateX = React.useRef(new Animated.Value(-width)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleLogout = () => {
    onClose();
    logout();
  };

  const menuItems = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home',
      onPress: () => {
        onClose();
        navigation.navigate('Dashboard');
      },
    },
    {
      id: 'categories',
      title: 'Manage Categories',
      icon: 'folder',
      onPress: () => {
        onClose();
        navigation.navigate('ManageCategories');
      },
    },
    {
      id: 'transactions',
      title: 'Manage Transactions',
      icon: 'receipt',
      onPress: () => {
        onClose();
        navigation.navigate('ManageTransactions');
      },
    },
    {
      id: 'analysis',
      title: 'Financial Analysis',
      icon: 'analytics',
      onPress: () => {
        onClose();
        navigation.navigate('FinancialAnalysis');
      },
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'logout',
      onPress: handleLogout,
      color: '#ef4444',
    },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Menu Panel */}
        <Animated.View 
          style={[
            styles.menuContainer,
            { transform: [{ translateX }] }
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>User:</Text>
            <Text style={styles.userEmail}>
              {user?.email || user?.phoneNumber || 'Guest'}
            </Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <Icon 
                  name={item.icon} 
                  size={24} 
                  color={item.color || '#374151'} 
                />
                <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
    elevation: 9998,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.75,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 9999,
    zIndex: 9999,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  userLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItems: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
});

export default SideMenu;
