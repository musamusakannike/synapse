import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  Send,
  Plus,
  BookOpen,
  HelpCircle,
  Video,
  FileText,
  Sparkles,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Avatar } from '@/components/Avatar';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

const SUGGESTIONS = [
  'Explain quantum entanglement simply',
  'Help me understand photosynthesis',
  'What is machine learning?',
  'Summarize the French Revolution',
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MessageBubble({ message }: { message: Message }) {
  const { c } = useTheme();
  const isUser = message.role === 'user';

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[
        styles.bubbleRow,
        isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant,
      ]}
    >
      {!isUser && (
        <View style={[styles.assistantAvatar, { backgroundColor: c.accentMuted }]}>
          <Sparkles size={14} color={c.accent} strokeWidth={2} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: c.accent }]
            : [styles.assistantBubble, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }],
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            {
              color: isUser ? '#0C0C0E' : c.textPrimary,
              fontFamily: typography.body.regular,
            },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}

function QuickActions({
  visible,
  onClose,
  onAction,
}: {
  visible: boolean;
  onClose: () => void;
  onAction: (type: string) => void;
}) {
  const { c } = useTheme();
  if (!visible) return null;

  const actions = [
    { id: 'course', label: 'Create Course', icon: BookOpen, color: c.accent },
    { id: 'quiz', label: 'Create Quiz', icon: HelpCircle, color: c.success },
    { id: 'video', label: 'Generate Video', icon: Video, color: '#60A5FA' },
    { id: 'document', label: 'Attach Document', icon: FileText, color: c.textSecondary },
  ];

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      style={[styles.quickActionsPanel, { backgroundColor: c.bgElevated, borderColor: c.border }]}
    >
      <View style={styles.quickActionsHeader}>
        <Text style={[styles.quickActionsTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
          Create
        </Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <X size={18} color={c.textMuted} strokeWidth={2} />
        </Pressable>
      </View>
      {actions.map((action) => {
        const IconComp = action.icon;
        return (
          <Pressable
            key={action.id}
            onPress={() => { haptics.medium(); onAction(action.id); onClose(); }}
            style={({ pressed }) => [
              styles.quickActionItem,
              { backgroundColor: pressed ? c.bgHover : 'transparent' },
            ]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}22` }]}>
              <IconComp size={18} color={action.color} strokeWidth={2} />
            </View>
            <Text style={[styles.quickActionLabel, { color: c.textPrimary, fontFamily: typography.body.medium }]}>
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { c } = useTheme();
  const toast = useToast();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendScale = useSharedValue(1);
  const sendAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const addMessage = (role: Message['role'], content: string) => {
    const msg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    return msg;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    addMessage('user', question);
    setLoading(true);
    haptics.medium();

    try {
      const res = await api.post('/api/ai/question', { question });
      if (res.data?.answer) {
        addMessage('assistant', res.data.answer);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to get a response';
      if (err.response?.data?.code === 'LIMIT_REACHED') {
        toast.warning('Daily limit reached', 'Upgrade to Premium for unlimited generations');
      } else {
        toast.error('Error', msg);
      }
      addMessage('system', `⚠️ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = useCallback((type: string) => {
    switch (type) {
      case 'course':
        addMessage('user', 'I want to create a course');
        addMessage('assistant', 'Great! Head to the Courses tab and tap the + button to generate a new course with AI.');
        break;
      case 'quiz':
        addMessage('user', 'I want to create a quiz');
        addMessage('assistant', 'Sure! Go to the Quizzes tab and tap + to generate a new quiz on any topic.');
        break;
      case 'video':
        toast.info('Coming soon', 'Video generation is available from the Chat on the web dashboard.');
        break;
      case 'document':
        router.push('/documents');
        break;
    }
  }, [router, toast]);

  const isEmpty = messages.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <View>
          <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
            Sabi Learn
          </Text>
          <Text style={[styles.headerSub, { color: c.textMuted, fontFamily: typography.body.regular }]}>
            AI-powered learning assistant
          </Text>
        </View>
        <Avatar name={user?.name} size={36} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isEmpty && styles.scrollContentEmpty]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isEmpty ? (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: c.accentMuted }]}>
              <Sparkles size={28} color={c.accent} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
              Ask me anything
            </Text>
            <Text style={[styles.emptySubtitle, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              I'm your personalized AI tutor. Ask a question, or pick a suggestion below.
            </Text>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => { haptics.light(); setInput(s); }}
                  style={[styles.chip, { backgroundColor: c.bgSecondary, borderColor: c.border }]}
                >
                  <Text style={[styles.chipText, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : (
          <View style={styles.messageList}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <Animated.View entering={FadeInDown.duration(300)} style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
                <View style={[styles.assistantAvatar, { backgroundColor: c.accentMuted }]}>
                  <Sparkles size={14} color={c.accent} strokeWidth={2} />
                </View>
                <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}>
                  <ActivityIndicator size="small" color={c.accent} />
                </View>
              </Animated.View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Quick Actions Popup */}
      <View style={styles.actionsOverlay} pointerEvents="box-none">
        <QuickActions
          visible={showActions}
          onClose={() => setShowActions(false)}
          onAction={handleAction}
        />
      </View>

      {/* Input Bar */}
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View style={[styles.inputBar, { backgroundColor: c.bgPrimary, borderTopColor: c.borderSubtle }]}>
          <Pressable
            onPress={() => { haptics.light(); setShowActions((v) => !v); }}
            style={[styles.addBtn, { backgroundColor: c.bgSecondary, borderColor: c.border }]}
          >
            <Plus size={20} color={c.textSecondary} strokeWidth={2} />
          </Pressable>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
            placeholderTextColor={c.textMuted}
            multiline
            style={[
              styles.textInput,
              {
                backgroundColor: c.bgSecondary,
                borderColor: c.border,
                color: c.textPrimary,
                fontFamily: typography.body.regular,
              },
            ]}
            onSubmitEditing={handleSend}
          />

          <AnimatedPressable
            onPress={handleSend}
            onPressIn={() => { sendScale.value = withSpring(0.9); }}
            onPressOut={() => { sendScale.value = withSpring(1); }}
            disabled={!input.trim() || loading}
            style={[
              sendAnimStyle,
              styles.sendBtn,
              { backgroundColor: input.trim() ? c.accent : c.bgTertiary },
            ]}
          >
            <Send size={18} color={input.trim() ? '#0C0C0E' : c.textMuted} strokeWidth={2} />
          </AnimatedPressable>
        </View>
      </KeyboardStickyView>
    </SafeAreaView>
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
    fontSize: fontSize.lg,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: fontSize['2xs'],
    marginTop: 1,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  scrollContentEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: fontSize.xs },
  messageList: { gap: spacing.lg },
  bubbleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAssistant: { justifyContent: 'flex-start' },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  actionsOverlay: {
    position: 'absolute',
    bottom: 80,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  quickActionsPanel: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickActionsTitle: {
    fontSize: fontSize.sm,
    letterSpacing: -0.2,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { fontSize: fontSize.sm },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.sm,
    maxHeight: 120,
    minHeight: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
