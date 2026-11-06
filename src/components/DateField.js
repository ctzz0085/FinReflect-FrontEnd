import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

// Values are YYYY-MM-DD strings, which compare correctly as plain text.
const toDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toValue = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const clamp = (value, min, max) => {
  if (value < min) return min;
  return value > max ? max : value;
};

const WebDateField = ({ value, min, max, onChange, label }) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  // min and max only limit the calendar popup, and a date can still be typed in. A typed
  // date is half-finished until the user leaves the field, so it's corrected then.
  const handleChange = (event) => {
    const next = event.target.value;
    setDraft(next);
    if (next && next >= min && next <= max) onChange(next);
  };

  const handleBlur = () => {
    const next = draft ? clamp(draft, min, max) : value;
    setDraft(next);
    onChange(next);
  };

  return React.createElement('input', {
    type: 'date',
    value: draft,
    min,
    max,
    'aria-label': label,
    onChange: handleChange,
    onBlur: handleBlur,
    style: webInputStyle,
  });
};

const NativeDateField = ({ value, min, max, onChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.field}
        onPress={() => setShowPicker((open) => !open)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.fieldText}>
          {toDate(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          minimumDate={toDate(min)}
          maximumDate={toDate(max)}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (event.type !== 'dismissed' && date) onChange(clamp(toValue(date), min, max));
          }}
        />
      )}
    </View>
  );
};

const DateField = Platform.OS === 'web' ? WebDateField : NativeDateField;

const webInputStyle = {
  boxSizing: 'border-box',
  width: '100%',
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  padding: '8px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: colors.text,
  backgroundColor: colors.background,
  colorScheme: 'dark',
  outline: 'none',
};

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  fieldText: {
    fontSize: 14,
    color: colors.text,
  },
});

export default DateField;
