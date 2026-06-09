import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, BookOpen, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface Lesson {
  title: string;
  description: string;
  isCompleted?: boolean;
  generatedLessonId?: string;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  level: string;
  style: string;
  outline: { modules: Module[] };
  createdAt: string;
}

interface LessonContent {
  _id: string;
  courseId: string;
  moduleTitle: string;
  lessonTitle: string;
  content: string;
  summary?: string;
}

// Function to safely encode Unicode strings for base64
const base64Encode = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return '';
  }
};

export default function LessonDetailScreen() {
  const { id, courseId: paramCourseId, moduleTitle: paramModuleTitle, lessonTitle: paramLessonTitle } = useLocalSearchParams<{
    id: string;
    courseId?: string;
    moduleTitle?: string;
    lessonTitle?: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const { c, isDark } = useTheme();

  // Generation States
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genStatusText, setGenStatusText] = useState('Initiating generation...');

  const isGenerateMode = id === 'generate';

  // 1. Fetch Lesson Content (if id !== 'generate')
  const {
    data: lessonData,
    isLoading: isLessonLoading,
    error: lessonLoadError,
    refetch: refetchLesson,
  } = useQuery<LessonContent>({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const res = await api.get(`/api/ai/course?lessonId=${id}`);
      return res.data?.lesson;
    },
    enabled: !!id && !isGenerateMode,
  });

  const activeCourseId = isGenerateMode ? paramCourseId : lessonData?.courseId;

  // 2. Fetch Course Outline to determine Previous/Next links
  const { data: course } = useQuery<Course>({
    queryKey: ['course', activeCourseId],
    queryFn: async () => {
      const res = await api.get(`/api/ai/course?id=${activeCourseId}`);
      return res.data?.course;
    },
    enabled: !!activeCourseId,
  });

  // Calculate flat lessons list
  const flatLessons = useMemo(() => {
    if (!course?.outline?.modules) return [];
    return course.outline.modules.flatMap((m) =>
      m.lessons.map((l) => ({
        ...l,
        moduleTitle: m.title,
      }))
    );
  }, [course]);

  // Current index in outline
  const currentIndex = useMemo(() => {
    if (flatLessons.length === 0) return -1;
    return flatLessons.findIndex((l) => {
      if (isGenerateMode) {
        return l.title === paramLessonTitle && l.moduleTitle === paramModuleTitle;
      }
      return l.generatedLessonId === id;
    });
  }, [flatLessons, id, isGenerateMode, paramLessonTitle, paramModuleTitle]);

  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  // 3. Trigger incremental generation automatically if in generate mode
  useEffect(() => {
    if (isGenerateMode && paramCourseId && paramModuleTitle && paramLessonTitle) {
      handleGenerateLesson();
    }
  }, [isGenerateMode, paramCourseId, paramModuleTitle, paramLessonTitle]);

  const handleGenerateLesson = async () => {
    setGenerating(true);
    setGenError(null);
    setGenStatusText('Synthesizing lesson material...');

    // Change status text after a few seconds for better UX
    const statusIntervals = [
      setTimeout(() => setGenStatusText('Applying customized learning style...'), 3000),
      setTimeout(() => setGenStatusText('Formulating LaTeX mathematical equations...'), 6000),
      setTimeout(() => setGenStatusText('Polishing definitions and summary...'), 9000),
    ];

    try {
      const res = await api.put('/api/ai/course', {
        courseId: paramCourseId,
        moduleTitle: paramModuleTitle,
        lessonTitle: paramLessonTitle,
      });

      if (res.data?.success && res.data?.lessonId) {
        haptics.success();
        // Invalidate course queries so the outline matches the new state
        await queryClient.invalidateQueries({ queryKey: ['course', paramCourseId] });
        // Replace current screen in route history with the newly generated lesson screen
        router.replace(`/course/lesson/${res.data.lessonId}`);
      } else {
        throw new Error('Incomplete response data from the generator');
      }
    } catch (err: any) {
      haptics.error();
      const msg = err.response?.data?.error || err.message || 'Generation failed. Please try again.';
      setGenError(msg);
    } finally {
      statusIntervals.forEach(clearTimeout);
      setGenerating(false);
    }
  };

  // 4. Render html string with KaTeX and Marked loaded via CDN
  const htmlContent = useMemo(() => {
    const content = lessonData?.content || '';
    const summary = lessonData?.summary || '';

    const base64Content = base64Encode(content);
    const base64Summary = base64Encode(summary);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@9.1.2/lib/marked.umd.js"></script>
  <style>
    :root {
      --bg: ${c.bgPrimary};
      --bg-card: ${c.bgSecondary};
      --bg-elevated: ${c.bgElevated};
      --text: ${c.textPrimary};
      --text-sec: ${c.textSecondary};
      --text-muted: ${c.textMuted};
      --accent: ${c.accent};
      --accent-subtle: ${c.accentSubtle};
      --accent-muted: ${c.accentMuted};
      --border: ${c.border};
      --border-subtle: ${c.borderSubtle};
      --danger: ${c.danger};
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 20px;
      line-height: 1.625;
      font-size: 15px;
      -webkit-text-size-adjust: 100%;
    }

    .summary-card {
      background-color: var(--accent-subtle);
      border: 1px solid var(--accent-muted);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .summary-card p {
      margin: 0;
      color: var(--text-sec);
      font-size: 13.5px;
      line-height: 1.5;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: 'Outfit', -apple-system, sans-serif;
      color: var(--text);
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      line-height: 1.3;
      letter-spacing: -0.2px;
    }

    h1 { font-size: 20px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    h2 { font-size: 17px; }
    h3 { font-size: 15px; }

    p {
      margin-top: 0;
      margin-bottom: 16px;
      color: var(--text-sec);
    }

    strong {
      color: var(--text);
      font-weight: 600;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 6px;
      color: var(--text-sec);
    }

    a {
      color: var(--accent);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    code {
      font-family: monospace;
      background-color: var(--bg-elevated);
      color: var(--accent);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }

    pre {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      overflow-x: auto;
      margin-bottom: 20px;
    }

    pre code {
      background-color: transparent;
      color: var(--text);
      padding: 0;
      border-radius: 0;
      font-size: 12px;
      display: block;
    }

    blockquote {
      margin: 0 0 16px 0;
      padding-left: 16px;
      border-left: 4px solid var(--accent);
      color: var(--text-sec);
      font-style: italic;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th, td {
      border: 1px solid var(--border);
      padding: 10px;
      text-align: left;
      font-size: 14px;
    }

    th {
      background-color: var(--bg-card);
      font-weight: 600;
    }

    .katex-display-wrapper {
      margin: 24px 0;
      padding: 8px 0;
      overflow-x: auto;
      width: 100%;
    }

    .katex-error {
      background-color: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.2);
      color: var(--danger);
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
      overflow-x: auto;
      margin: 12px 0;
    }
  </style>
</head>
<body>
  <div id="summary-container"></div>
  <div id="content-container"></div>

  <script>
    function decodeBase64(str) {
      try {
        return decodeURIComponent(escape(atob(str)));
      } catch (e) {
        return '';
      }
    }

    function formatMarkdown(md) {
      if (!md) return "";

      const blockMathBlocks = [];
      const inlineMathBlocks = [];

      // 1. Extract block math: \\[ ... \]
      let processed = md.replace(/\\\\\\\[([\\s\\S]*?)\\\\\\\\]/g, function(_, math) {
        const placeholder = 'MATHBLOCKPLACEHOLDER' + blockMathBlocks.length;
        blockMathBlocks.push(math.trim());
        return placeholder;
      });

      // 2. Extract block math: $$ ... $$
      processed = processed.replace(/\\$\\$([\\s\\S]*?)\\$\\$/g, function(_, math) {
        const placeholder = 'MATHBLOCKPLACEHOLDER' + blockMathBlocks.length;
        blockMathBlocks.push(math.trim());
        return placeholder;
      });

      // 3. Extract inline math: \\( ... \\)
      processed = processed.replace(/\\\\\\(([\\s\\S]*?)\\\\\\\)/g, function(_, math) {
        const placeholder = 'MATHINLINEPLACEHOLDER' + inlineMathBlocks.length;
        inlineMathBlocks.push(math.trim());
        return placeholder;
      });

      // 4. Extract inline math: $ ... $
      processed = processed.replace(/(?<!\\$)\\$(?!\\s)([^$]+?)(?<!\\s)\\$(?!\\$)/g, function(_, math) {
        const placeholder = 'MATHINLINEPLACEHOLDER' + inlineMathBlocks.length;
        inlineMathBlocks.push(math.trim());
        return placeholder;
      });

      // 5. Compile remaining markdown using marked
      let html = "";
      try {
        html = window.marked.parse(processed);
      } catch (e) {
        html = processed;
      }

      // 6. Restore block math with KaTeX
      blockMathBlocks.forEach(function(math, index) {
        const placeholder = 'MATHBLOCKPLACEHOLDER' + index;
        try {
          const rendered = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          html = html.replaceAll(
            placeholder,
            '<div class="katex-display-wrapper">' + rendered + '</div>'
          );
        } catch (e) {
          html = html.replaceAll(
            placeholder,
            '<pre class="katex-error">$$' + math + '$$</pre>'
          );
        }
      });

      // 7. Restore inline math with KaTeX
      inlineMathBlocks.forEach(function(math, index) {
        const placeholder = 'MATHINLINEPLACEHOLDER' + index;
        try {
          const rendered = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          html = html.replaceAll(placeholder, rendered);
        } catch (e) {
          html = html.replaceAll(
            placeholder,
            '<code class="katex-error">$' + math + '$</code>'
          );
        }
      });

      return html;
    }

    const rawContent = decodeBase64("${base64Content}");
    const rawSummary = decodeBase64("${base64Summary}");

    if (rawSummary) {
      document.getElementById('summary-container').innerHTML = 
        '<div class="summary-card"><p>' + rawSummary + '</p></div>';
    }

    document.getElementById('content-container').innerHTML = formatMarkdown(rawContent);
  </script>
</body>
</html>
    `;
  }, [lessonData, c]);

  // 5. Navigation buttons event handler
  const handleNavigate = (target: typeof prevLesson) => {
    if (!target) return;
    haptics.light();

    if (target.generatedLessonId) {
      router.push(`/course/lesson/${target.generatedLessonId}`);
    } else if (activeCourseId) {
      router.push({
        pathname: '/course/lesson/generate',
        params: {
          courseId: activeCourseId,
          moduleTitle: target.moduleTitle,
          lessonTitle: target.title,
        },
      } as any);
    }
  };

  const currentTitle = isGenerateMode ? paramLessonTitle : lessonData?.lessonTitle;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Pressable
          onPress={() => {
            haptics.light();
            router.back();
          }}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text
            style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}
            numberOfLines={1}
          >
            {currentTitle || 'Lesson Details'}
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: c.textMuted, fontFamily: typography.body.regular }]}
            numberOfLines={1}
          >
            {isGenerateMode ? paramModuleTitle : lessonData?.moduleTitle || 'Module'}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Main Content Area */}
      <View style={styles.contentWrap}>
        {generating ? (
          // Generating AI Screen
          <View style={styles.loadingState}>
            <AnimatedLoadingSpinner color={c.accent} />
            <Text style={[styles.loadingText, { color: c.textPrimary, fontFamily: typography.display.medium }]}>
              {genStatusText}
            </Text>
            <Text style={[styles.subloadingText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              This usually takes less than a minute.
            </Text>
          </View>
        ) : genError ? (
          // Generation Failure Screen
          <View style={styles.loadingState}>
            <AlertCircle size={40} color={c.danger} strokeWidth={1.5} />
            <Text style={[styles.errorText, { color: c.textPrimary, fontFamily: typography.display.medium }]}>
              Generation Failed
            </Text>
            <Text style={[styles.errorSubtext, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              {genError}
            </Text>
            <Pressable
              onPress={() => {
                haptics.light();
                handleGenerateLesson();
              }}
              style={[styles.retryBtn, { backgroundColor: c.accent }]}
            >
              <Text style={[styles.retryBtnText, { color: c.bgPrimary, fontFamily: typography.body.bold }]}>
                Retry Generation
              </Text>
            </Pressable>
          </View>
        ) : isLessonLoading ? (
          // Loading Lesson Screen
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={c.accent} />
            <Text style={[styles.loadingText, { color: c.textMuted, fontFamily: typography.body.regular, marginTop: spacing.md }]}>
              Loading lesson content...
            </Text>
          </View>
        ) : lessonLoadError ? (
          // Loading Error Screen
          <View style={styles.loadingState}>
            <AlertCircle size={40} color={c.danger} strokeWidth={1.5} />
            <Text style={[styles.errorText, { color: c.textPrimary, fontFamily: typography.display.medium }]}>
              Failed to load lesson
            </Text>
            <Pressable
              onPress={() => {
                haptics.light();
                refetchLesson();
              }}
              style={[styles.retryBtn, { backgroundColor: c.accent }]}
            >
              <Text style={[styles.retryBtnText, { color: c.bgPrimary, fontFamily: typography.body.bold }]}>
                Retry Loading
              </Text>
            </Pressable>
          </View>
        ) : (
          // Normal WebView Content Screen
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={[styles.webview, { backgroundColor: c.bgPrimary }]}
            textZoom={100}
            showsVerticalScrollIndicator={true}
            domStorageEnabled={true}
            javaScriptEnabled={true}
          />
        )}
      </View>

      {/* Footer Navigation Bar */}
      {!generating && !isLessonLoading && !genError && !lessonLoadError && (
        <View style={[styles.footer, { borderTopColor: c.borderSubtle, backgroundColor: c.bgSecondary }]}>
          <Pressable
            disabled={!prevLesson}
            onPress={() => handleNavigate(prevLesson)}
            style={[
              styles.navButton,
              { borderColor: c.border },
              !prevLesson && styles.disabledNavButton,
            ]}
          >
            <ChevronLeft size={16} color={prevLesson ? c.textPrimary : c.textMuted} strokeWidth={2} />
            <Text
              style={[
                styles.navButtonText,
                { color: prevLesson ? c.textPrimary : c.textMuted, fontFamily: typography.body.medium },
              ]}
              numberOfLines={1}
            >
              Previous
            </Text>
          </Pressable>

          <Pressable
            disabled={!nextLesson}
            onPress={() => handleNavigate(nextLesson)}
            style={[
              styles.navButton,
              { borderColor: c.border },
              !nextLesson && styles.disabledNavButton,
            ]}
          >
            <Text
              style={[
                styles.navButtonText,
                { color: nextLesson ? c.textPrimary : c.textMuted, fontFamily: typography.body.medium },
              ]}
              numberOfLines={1}
            >
              Next
            </Text>
            <ChevronRight size={16} color={nextLesson ? c.textPrimary : c.textMuted} strokeWidth={2} />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

// Simple Custom Loading Spinner animation using native features
function AnimatedLoadingSpinner({ color }: { color: string }) {
  return (
    <View style={styles.spinnerWrap}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.md,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: fontSize['2xs'],
    textAlign: 'center',
    marginTop: 2,
  },
  contentWrap: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  spinnerWrap: {
    marginBottom: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subloadingText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  retryBtnText: {
    fontSize: fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    maxWidth: (Dimensions.get('window').width - spacing.lg * 3) / 2,
  },
  disabledNavButton: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: fontSize.sm,
  },
});
