import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

const NeedsReviewNotice = ({ count, onPress }) => {
  if (!count) return null;

  return (
    <TouchableOpacity
      style={styles.notice}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Review ${count} flagged transactions`}
    >
      <MaterialIcons name="warning-amber" size={20} color={colors.amber} />
      <View style={styles.text}>
        <Text style={styles.title}>
          {count} {count === 1 ? 'transaction needs' : 'transactions need'} review
        </Text>
        <Text style={styles.subtitle}>We weren't confident about these. Please check their categories.</Text>
      </View>
      <Text style={styles.action}>Review</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    backgroundColor: colors.surface,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.amber,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.amber,
  },
});

export default NeedsReviewNotice;
