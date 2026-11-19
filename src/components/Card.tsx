import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useCoach } from '../context/CoachContext';
import { RADIUS } from '../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false }: CardProps) {
  const { palette } = useCoach();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? palette.cardElevated : palette.card,
          borderColor: palette.border,
          shadowColor: palette.mode === 'dark' ? '#000000' : '#1E2438',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
});
