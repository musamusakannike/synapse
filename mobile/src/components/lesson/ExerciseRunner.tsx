import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { IconCircleCheck, IconCircleX, IconEye, IconEyeOff } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import { TopicExercise } from '@/lib/types';
import CodeRenderer from '@/components/ui/CodeRenderer';

export default function ExerciseRunner({ exercise }: { exercise: TopicExercise }) {
  const { colors } = useTheme();
  const webviewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ stdout: string; ok: boolean } | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const isPython = (exercise.language || 'python') === 'python';

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') {
        setReady(true);
        webviewRef.current?.postMessage(JSON.stringify({ type: 'init', code: exercise.starterCode }));
      } else if (data.type === 'result') {
        setRunning(false);
        setResult({ stdout: data.stdout || '', ok: data.ok });
      }
    } catch {
      // ignore malformed messages
    }
  };

  const handleRun = () => {
    if (!ready) return;
    setRunning(true);
    setResult(null);
    webviewRef.current?.postMessage(JSON.stringify({ type: 'run' }));
  };

  const expectedOutput = (exercise.expectedOutput || '').trim();
  const solutionCode = (exercise.solution || '').trim();
  const passed = result && expectedOutput ? result.stdout.trim().includes(expectedOutput) : null;

  if (!isPython) {
    return (
      <View style={{ gap: spacing.base }}>
        <Text style={[styles.instructions, { color: colors.textSecondary }]}>{exercise.instructions}</Text>
        <CodeRenderer code={exercise.starterCode} language={exercise.language} />
        <Text style={[styles.note, { color: colors.textTertiary }]}>Running code in-app is currently only supported for Python.</Text>
        {(solutionCode || expectedOutput) && (
          <View style={{ marginTop: spacing.xs }}>
            <Pressable onPress={() => setShowSolution(!showSolution)} style={styles.toggleRow}>
              {showSolution ? <IconEyeOff size={16} color={colors.textLink} /> : <IconEye size={16} color={colors.textLink} />}
              <Text style={[styles.toggleText, { color: colors.textLink }]}>{showSolution ? 'Hide Answer' : 'Show Correct Answer'}</Text>
            </Pressable>
            {showSolution && (
              <View style={[styles.solutionBox, { backgroundColor: colors.surfaceSunken, borderColor: colors.borderSubtle }]}>
                {!!expectedOutput && (
                  <View style={{ marginBottom: spacing.xs }}>
                    <Text style={[styles.boxLabel, { color: colors.textTertiary }]}>EXPECTED OUTPUT</Text>
                    <Text style={[styles.boxText, { color: colors.textPrimary }]}>{expectedOutput}</Text>
                  </View>
                )}
                {!!solutionCode && (
                  <View>
                    <Text style={[styles.boxLabel, { color: colors.textTertiary, marginBottom: spacing.xs }]}>REFERENCE SOLUTION</Text>
                    <CodeRenderer code={solutionCode} language={exercise.language} />
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.base }}>
      <Text style={[styles.instructions, { color: colors.textSecondary }]}>{exercise.instructions}</Text>
      {!!expectedOutput && (
        <View style={[styles.targetBox, { backgroundColor: colors.surfaceSunken, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.boxLabel, { color: colors.textTertiary }]}>TARGET OUTPUT:</Text>
          <Text style={[styles.boxText, { color: colors.textPrimary }]}>{expectedOutput}</Text>
        </View>
      )}
      <View style={[styles.webviewWrap, { borderColor: colors.borderSubtle }]}>
        <WebView
          ref={webviewRef}
          source={require('../../../assets/playground/exercise.html')}
          onMessage={onMessage}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          style={{ backgroundColor: colors.surface }}
        />
      </View>
      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleRun}
          disabled={!ready || running}
          style={[styles.runBtn, { backgroundColor: colors.brandPrimary, opacity: !ready || running ? 0.5 : 1 }]}
        >
          <Text style={[styles.runBtnText, { color: colors.brandOnPrimary }]}>{running ? 'Running…' : 'Run'}</Text>
        </Pressable>
        {passed === true && (
          <View style={styles.resultRow}>
            <IconCircleCheck size={16} color={colors.success} />
            <Text style={{ color: colors.success, fontFamily: fontFamilies.sansMedium, fontSize: fontSizes.sm }}>Output matches</Text>
          </View>
        )}
        {passed === false && (
          <View style={styles.resultRow}>
            <IconCircleX size={16} color={colors.danger} />
            <Text style={{ color: colors.danger, fontFamily: fontFamilies.sansMedium, fontSize: fontSizes.sm }}>Not quite — try again</Text>
          </View>
        )}
        {(solutionCode || expectedOutput) && (
          <Pressable onPress={() => setShowSolution(!showSolution)} style={[styles.toggleRow, { marginLeft: 'auto' }]}>
            {showSolution ? <IconEyeOff size={16} color={colors.textLink} /> : <IconEye size={16} color={colors.textLink} />}
            <Text style={[styles.toggleText, { color: colors.textLink }]}>{showSolution ? 'Hide Answer' : 'Show Answer'}</Text>
          </Pressable>
        )}
      </View>
      {showSolution && (
        <View style={[styles.solutionBox, { backgroundColor: colors.surfaceSunken, borderColor: colors.borderSubtle }]}>
          {!!expectedOutput && (
            <View style={{ marginBottom: spacing.xs }}>
              <Text style={[styles.boxLabel, { color: colors.textTertiary }]}>EXPECTED OUTPUT</Text>
              <Text style={[styles.boxText, { color: colors.textPrimary }]}>{expectedOutput}</Text>
            </View>
          )}
          {!!solutionCode && (
            <View>
              <Text style={[styles.boxLabel, { color: colors.textTertiary, marginBottom: spacing.xs }]}>REFERENCE SOLUTION</Text>
              <CodeRenderer code={solutionCode} language={exercise.language} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  instructions: { fontSize: fontSizes.base, fontFamily: fontFamilies.sans, lineHeight: fontSizes.base * 1.5 },
  webviewWrap: { height: 320, borderRadius: radii.md, borderWidth: 1, overflow: 'hidden' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.base, flexWrap: 'wrap' },
  runBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radii.sm },
  runBtnText: { fontFamily: fontFamilies.sansMedium, fontSize: fontSizes.sm },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  note: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans },
  targetBox: { padding: spacing.sm, borderRadius: radii.md, borderWidth: 1 },
  boxLabel: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, letterSpacing: 0.5 },
  boxText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs },
  toggleText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium },
  solutionBox: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1, gap: spacing.xs },
});
