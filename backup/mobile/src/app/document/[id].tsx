import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import {
  ChevronLeft,
  Sparkles,
  FileText,
  Lightbulb,
  BookOpen,
  HelpCircle,
  List,
  ExternalLink,
  AlertCircle,
  Loader2,
  File,
  FileImage,
} from 'lucide-react-native';
import RNBottomSheet from '@gorhom/bottom-sheet';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BottomSheet } from '@/components/BottomSheet';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface DocumentMeta {
  _id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  createdAt: string;
  extractedText: string;
  ocrStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  ocrError?: string | null;
}

interface KeyConcept {
  concept: string;
  description: string;
}

interface GlossaryItem {
  term: string;
  definition: string;
}

interface CourseModule {
  module: string;
  lessons: string[];
}

interface Insights {
  summary: string;
  keyConcepts: KeyConcept[];
  glossary: GlossaryItem[];
  quizTopics: string[];
  courseOutline: CourseModule[];
}

type TabId = 'summary' | 'concepts' | 'glossary' | 'quiz' | 'course';

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'concepts', label: 'Key Concepts', icon: Lightbulb },
  { id: 'glossary', label: 'Glossary', icon: BookOpen },
  { id: 'quiz', label: 'Quiz Topics', icon: HelpCircle },
  { id: 'course', label: 'Course Outline', icon: List },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocIcon({ mimeType, size = 24 }: { mimeType: string; size?: number }) {
  const { c } = useTheme();
  const isImage = mimeType.startsWith('image/');
  const IconComp = isImage ? FileImage : File;
  const color = isImage ? '#60A5FA' : c.accent;
  return <IconComp size={size} color={color} strokeWidth={1.5} />;
}

export default function DocumentInsightsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { c } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<RNBottomSheet>(null);
  
  const docId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch document and insights
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['document-insights', docId],
    queryFn: async () => {
      const res = await api.get(`/api/documents/insights?id=${docId}`);
      return res.data as { document: DocumentMeta; insights: Insights | null };
    },
    refetchInterval: (query) => {
      const doc = query.state.data?.document;
      return doc?.ocrStatus === 'processing' ? 3000 : false;
    },
  });

  // Generate insights mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/documents/insights', {
        documentId: docId,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['document-insights', docId], (old: any) => ({
        ...old,
        insights: data.insights,
      }));
      toast.success('Insights generated successfully');
      haptics.success();
    },
    onError: () => {
      toast.error('Failed to generate insights');
      haptics.error();
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleOpenFile = useCallback(() => {
    if (data?.document?.publicUrl) {
      // You can use Linking.openURL or in-app browser
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [data?.document?.publicUrl]);

  const document = data?.document;
  const insights = data?.insights;
  const isProcessing = document?.ocrStatus === 'processing';
  const isFailed = document?.ocrStatus === 'failed';
  const canGenerateInsights = !isProcessing && !isFailed && document?.ocrStatus === 'completed';

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
          <Pressable
            onPress={() => { haptics.light(); router.back(); }}
            style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
          >
            <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
            Document
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Animated.View entering={ZoomIn.duration(300)}>
            <Loader2 size={32} color={c.accent} strokeWidth={1.5} style={{ transform: [{ rotate: '360deg' }] }} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
            Loading document...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (!document) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
          <Pressable
            onPress={() => { haptics.light(); router.back(); }}
            style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
          >
            <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
            Document
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.errorContainer}>
          <Animated.View entering={FadeIn.duration(300)} style={[styles.errorIcon, { backgroundColor: `${c.danger}22` }]}>
            <AlertCircle size={28} color={c.danger} strokeWidth={1.5} />
          </Animated.View>
          <Text style={[styles.errorTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
            Document not found
          </Text>
          <Button onPress={() => router.back()} variant="secondary" style={{ marginTop: spacing.lg }}>
            Back to Documents
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]} numberOfLines={1}>
          {document.fileName}
        </Text>
        <Pressable
          onPress={() => handleOpenFile()}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ExternalLink size={16} color={c.textPrimary} strokeWidth={1.5} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.accent} />
        }
      >
        {/* Document Header Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={[styles.docIconLarge, { backgroundColor: `${c.accent}22` }]}>
                <DocIcon mimeType={document.mimeType} size={28} />
              </View>
              <View style={styles.docInfo}>
                <Text style={[styles.docName, { color: c.textPrimary, fontFamily: typography.body.semiBold }]} numberOfLines={2}>
                  {document.fileName}
                </Text>
                <Text style={[styles.docMeta, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                  {formatFileSize(document.sizeBytes)} • {new Date(document.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Processing State */}
        {isProcessing && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card style={styles.stateCard}>
              <View style={styles.processingAnimation}>
                <View style={[styles.processingIcon, { backgroundColor: `${c.accent}22` }]}>
                  <Loader2 size={32} color={c.accent} strokeWidth={1.5} />
                </View>
              </View>
              <Text style={[styles.stateTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
                Reading your document...
              </Text>
              <Text style={[styles.stateDescription, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                We are currently analyzing the content of this file. This will refresh automatically.
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Failed State */}
        {isFailed && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card style={styles.stateCard}>
              <View style={[styles.stateIcon, { backgroundColor: `${c.danger}22` }]}>
                <AlertCircle size={32} color={c.danger} strokeWidth={1.5} />
              </View>
              <Text style={[styles.stateTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
                Unable to read document
              </Text>
              <Text style={[styles.stateDescription, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                {document.ocrError || 'An error occurred during text extraction.'}
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Generate Insights CTA */}
        {!insights && canGenerateInsights && !generateMutation.isPending && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={[styles.ctaCard, { borderStyle: 'dashed', borderWidth: 2, borderColor: c.border, backgroundColor: c.bgSecondary }]}>
              <View style={[styles.ctaIcon, { backgroundColor: `${c.accent}22` }]}>
                <Sparkles size={32} color={c.accent} strokeWidth={1.5} />
              </View>
              <Text style={[styles.ctaTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
                Generate Document Insights
              </Text>
              <Text style={[styles.ctaDescription, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                AI will analyze your document and extract a summary, key concepts, glossary, quiz topics, and a suggested course outline.
              </Text>
              <Button
                onPress={() => { haptics.medium(); generateMutation.mutate(); }}
                fullWidth
                style={{ marginTop: spacing.lg }}
              >
                Generate Insights
              </Button>
              <Text style={[styles.ctaNote, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                Uses 1 AI generation credit
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Generating State */}
        {generateMutation.isPending && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card style={styles.stateCard}>
              <View style={styles.processingAnimation}>
                <View style={[styles.processingIcon, { backgroundColor: `${c.accent}22` }]}>
                  <Loader2 size={32} color={c.accent} strokeWidth={1.5} />
                </View>
              </View>
              <Text style={[styles.stateTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
                Analyzing your document...
              </Text>
              <Text style={[styles.stateDescription, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                This may take 10-20 seconds
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Insights Content */}
        {insights && (
          <>
            {/* Tab Bar */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabBar}
              >
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => { haptics.light(); setActiveTab(tab.id); }}
                      style={[
                        styles.tab,
                        {
                          backgroundColor: isActive ? c.accent : c.bgSecondary,
                          borderColor: isActive ? c.accent : c.borderSubtle,
                        },
                      ]}
                    >
                      <Icon size={16} color={isActive ? '#0C0C0E' : c.textMuted} strokeWidth={1.5} />
                      <Text
                        style={[
                          styles.tabLabel,
                          {
                            color: isActive ? '#0C0C0E' : c.textMuted,
                            fontFamily: isActive ? typography.body.semiBold : typography.body.regular,
                          },
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* Tab Content */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginTop: spacing.md }}>
              {activeTab === 'summary' && <SummaryTab summary={insights.summary} />}
              {activeTab === 'concepts' && <ConceptsTab concepts={insights.keyConcepts} />}
              {activeTab === 'glossary' && <GlossaryTab glossary={insights.glossary} />}
              {activeTab === 'quiz' && <QuizTopicsTab topics={insights.quizTopics} />}
              {activeTab === 'course' && <CourseOutlineTab outline={insights.courseOutline} />}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Tab Components
function SummaryTab({ summary }: { summary: string }) {
  const { c } = useTheme();
  return (
    <Card>
      <View style={styles.tabHeader}>
        <View style={[styles.tabIcon, { backgroundColor: `${c.accent}22` }]}>
          <FileText size={18} color={c.accent} strokeWidth={1.5} />
        </View>
        <Text style={[styles.tabTitle, { color: c.textPrimary, fontFamily: typography.body.semiBold }]}>
          Document Summary
        </Text>
      </View>
      <Text style={[styles.summaryText, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
        {summary}
      </Text>
    </Card>
  );
}

function ConceptsTab({ concepts }: { concepts: KeyConcept[] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      {concepts.map((item, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(i * 50).duration(300)}>
          <Card>
            <View style={styles.conceptHeader}>
              <View style={[styles.conceptNumber, { backgroundColor: `${c.accent}22` }]}>
                <Text style={[styles.conceptNumberText, { color: c.accent, fontFamily: typography.body.bold }]}>
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.conceptName, { color: c.textPrimary, fontFamily: typography.body.semiBold }]}>
                  {item.concept}
                </Text>
                <Text style={[styles.conceptDescription, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                  {item.description}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  );
}

function GlossaryTab({ glossary }: { glossary: GlossaryItem[] }) {
  const { c } = useTheme();
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {glossary.map((item, i) => (
        <View
          key={i}
          style={[
            styles.glossaryItem,
            {
              borderBottomColor: c.borderSubtle,
              borderBottomWidth: i < glossary.length - 1 ? 1 : 0,
            },
          ]}
        >
          <Text style={[styles.glossaryTerm, { color: c.accent, fontFamily: typography.body.semiBold }]}>
            {item.term}
          </Text>
          <Text style={[styles.glossaryDefinition, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
            {item.definition}
          </Text>
        </View>
      ))}
    </Card>
  );
}

function QuizTopicsTab({ topics }: { topics: string[] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      <Text style={[styles.tabDescription, { color: c.textMuted, fontFamily: typography.body.regular }]}>
        These topics can be used to create targeted quizzes from this document.
      </Text>
      {topics.map((topic, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(i * 50).duration(300)}>
          <Card>
            <View style={styles.topicRow}>
              <View style={[styles.topicIcon, { backgroundColor: '#A78BFA22' }]}>
                <Text style={[styles.topicIconText, { color: '#A78BFA', fontFamily: typography.body.bold }]}>
                  ?
                </Text>
              </View>
              <Text style={[styles.topicText, { color: c.textPrimary, fontFamily: typography.body.regular }]}>
                {topic}
              </Text>
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  );
}

function CourseOutlineTab({ outline }: { outline: CourseModule[] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      <Text style={[styles.tabDescription, { color: c.textMuted, fontFamily: typography.body.regular }]}>
        A suggested course structure based on this document's content.
      </Text>
      {outline.map((mod, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(i * 70).duration(300)}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <View style={[styles.moduleHeader, { backgroundColor: c.bgTertiary, borderBottomColor: c.borderSubtle }]}>
              <View style={[styles.moduleNumber, { backgroundColor: c.accent }]}>
                <Text style={[styles.moduleNumberText, { fontFamily: typography.body.bold }]}>
                  M{i + 1}
                </Text>
              </View>
              <Text style={[styles.moduleName, { color: c.textPrimary, fontFamily: typography.body.semiBold }]}>
                {mod.module}
              </Text>
            </View>
            <View style={{ padding: spacing.md, gap: spacing.sm }}>
              {mod.lessons.map((lesson, j) => (
                <View key={j} style={styles.lessonRow}>
                  <View style={[styles.lessonDot, { borderColor: c.border }]}>
                    <View style={[styles.lessonDotInner, { backgroundColor: `${c.accent}66` }]} />
                  </View>
                  <Text style={[styles.lessonText, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                    {lesson}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  docCard: {
    marginBottom: spacing.md,
  },
  docHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  docIconLarge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  docName: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  docMeta: {
    fontSize: fontSize.xs,
  },
  stateCard: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  processingAnimation: {
    marginBottom: spacing.sm,
  },
  processingIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  ctaTitle: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ctaDescription: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaNote: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: fontSize.xs,
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: fontSize.md,
  },
  tabDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  conceptHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  conceptNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  conceptNumberText: {
    fontSize: fontSize.xs,
  },
  conceptName: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  conceptDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  glossaryItem: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  glossaryTerm: {
    fontSize: fontSize.sm,
    marginBottom: 4,
  },
  glossaryDefinition: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  topicIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  topicIconText: {
    fontSize: fontSize.sm,
  },
  topicText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleNumberText: {
    fontSize: fontSize.xs,
    color: '#0C0C0E',
  },
  moduleName: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lessonDot: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonDotInner: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  lessonText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
});
