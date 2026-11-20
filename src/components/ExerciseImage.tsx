import React, { useEffect, useState } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { useCoach } from '../context/CoachContext';
import { EXERCISE_IMAGES } from '../data/exerciseImages';

interface ExerciseImageProps {
  exerciseId: string;
  size?: number;
  aspectRatio?: number;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}

export function ExerciseImage({
  exerciseId,
  size,
  aspectRatio = 16 / 10,
  rounded = 12,
  style,
}: ExerciseImageProps) {
  const { palette } = useCoach();
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [exerciseId]);

  const source = EXERCISE_IMAGES[exerciseId];
  const showImage = Boolean(source) && !loadFailed;

  const boxStyle: ViewStyle =
    typeof size === 'number'
      ? { width: size, height: size, borderRadius: rounded }
      : { width: '100%', aspectRatio, borderRadius: rounded };

  const iconSize = typeof size === 'number' ? Math.max(20, Math.round(size * 0.36)) : 40;

  return (
    <View
      style={[
        styles.container,
        boxStyle,
        {
          backgroundColor: palette.workoutSoft,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={source}
          resizeMode="cover"
          onError={() => setLoadFailed(true)}
          style={styles.image}
        />
      ) : (
        <Dumbbell size={iconSize} color={palette.workout} strokeWidth={2} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
