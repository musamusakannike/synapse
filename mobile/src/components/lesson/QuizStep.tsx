import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import { TopicQuiz } from '@/lib/types';
import * as haptics from '@/lib/haptics';

export default function QuizStep({ quiz, onAnswered }: { quiz: TopicQuiz; onAnswered: (correct: boolean) => void }) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    haptics.light();
    onAnswered(!!quiz.options[selected]?.isCorrect);
  };

  return (
    <View style={{ gap: spacing.base }}>
      <Text style={[styles.question, { color: colors.textPrimary }]}>{quiz.question}</Text>
      <View style={{ gap: spacing.sm }}>
        {quiz.options.map((opt, i) => {
          const isSelected = selected === i;
          const showState = checked && (isSelected || opt.isCorrect);
          const borderColor = showState && opt.isCorrect
            ? colors.success
            : showState && isSelected && !opt.isCorrect
              ? colors.danger
              : isSelected
                ? colors.brandPrimary
                : colors.borderSubtle;

          return (
            <Pressable
              key={i}
              onPress={() => !checked && setSelected(i)}
              disabled={checked}
              style={[styles.option, { borderColor, backgroundColor: colors.surface }]}
            >
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>{opt.text}</Text>
              {showState && opt.isCorrect && <IconCircleCheck size={18} color={colors.success} />}
              {showState && isSelected && !opt.isCorrect && <IconCircleX size={18} color={colors.danger} />}
            </Pressable>
          );
        })}
      </View>

      {!checked ? (
        <Pressable
          onPress={handleCheck}
          disabled={selected === null}
          style={[styles.checkBtn, { backgroundColor: colors.brandPrimary, opacity: selected === null ? 0.5 : 1 }]}
        >
          <Text style={[styles.checkBtnText, { color: colors.brandOnPrimary }]}>Check</Text>
        </Pressable>
      ) : (
        !!quiz.explanation && (
          <View style={[styles.explanation, { backgroundColor: colors.surfaceSunken }]}>
            <Text style={{ color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, lineHeight: fontSizes.sm * 1.5 }}>
              {quiz.explanation}
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  question: { fontSize: fontSizes.lg, fontFamily: fontFamilies.displaySemiBold },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  optionText: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, flex: 1 },
  checkBtn: { paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' },
  checkBtnText: { fontFamily: fontFamilies.sansMedium, fontSize: fontSizes.base },
  explanation: { padding: spacing.base, borderRadius: radii.md },
});
