import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useCoach } from '../context/CoachContext';
import { FONTS, RADIUS } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'workout' | 'nutrition' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'workout',
  disabled = false,
  style,
  icon,
}: ButtonProps) {
  const { palette, isRTL } = useCoach();

  const backgroundColor =
    variant === 'workout'
      ? palette.workout
      : variant === 'nutrition'
      ? palette.nutrition
      : variant === 'secondary'
      ? palette.cardElevated
      : 'transparent';

  const textColor =
    variant === 'workout'
      ? '#FFFFFF'
      : variant === 'nutrition'
      ? '#09150E'
      : palette.text;

  const borderColor =
    variant === 'secondary' ? palette.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: textColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: RADIUS.button,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});
