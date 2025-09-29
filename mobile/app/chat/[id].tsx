import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChatAPI } from "../../lib/api";
import {
  colors,
  commonStyles,
  spacing,
  borderRadius,
  shadows,
  typography,
  screenThemes,
} from "../../styles/theme";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatFull {
  _id: string;
  title: string;
  type: "topic" | "document" | "website" | "general";
  messages: Message[];
}

export default function ChatPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [chat, setChat] = useState<ChatFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = React.useRef<ScrollView>(null);
  const messageInputRef = React.useRef<TextInput>(null);

  const loadChat = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data } = await ChatAPI.get(id);
      const c = data?.chat;
      if (c) {
        setChat({
          _id: c._id,
          title: c.title,
          type: c.type,
          messages: c.messages || [],
        });
        setNewTitle(c.title);
      } else {
        Alert.alert("Error", "Chat not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load chat", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }
    loadChat();
  }, [id, router, loadChat]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (chat?.messages.length && chat.messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chat?.messages.length]);

  const saveTitle = async () => {
    if (!chat || !newTitle.trim()) return;
    try {
      setRenaming(true);
      await ChatAPI.updateTitle(chat._id, newTitle.trim());
      setChat((prev) => (prev ? { ...prev, title: newTitle.trim() } : prev));
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update title");
    } finally {
      setRenaming(false);
    }
  };

  const doSend = async () => {
    if (!chat || !message.trim()) return;

    const messageToSend = message.trim();
    setMessage("");
    messageInputRef.current?.blur();

    try {
      setSending(true);
      const { data } = await ChatAPI.sendMessage(chat._id, messageToSend);
      const userMessage = data?.userMessage || {
        role: "user",
        content: messageToSend,
      };
      const aiResponse = data?.aiResponse || { role: "assistant", content: "" };

      setChat((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, userMessage, aiResponse],
            }
          : prev
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to send message");
      // Re-add the message if sending failed
      setMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const deleteChat = async () => {
    if (!chat) return;

    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ChatAPI.delete(chat._id);
              router.back();
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Failed to delete chat");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centerBox]}>
        <ActivityIndicator color={screenThemes.chat.primary} size="large" />
        <Text style={[commonStyles.muted, { marginTop: spacing[2] }]}>
          Loading chat...
        </Text>
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={[commonStyles.container, commonStyles.centerBox]}>
        <Text style={styles.errorText}>Chat not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={commonStyles.primaryButton}
        >
          <Text style={commonStyles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.titleInput}
              placeholder="Chat title"
              placeholderTextColor={colors.text.tertiary}
              returnKeyType="done"
              onSubmitEditing={saveTitle}
            />
            <TouchableOpacity
              onPress={saveTitle}
              disabled={renaming || newTitle === chat.title}
              style={[
                styles.saveButton,
                (renaming || newTitle === chat.title) && styles.buttonDisabled,
              ]}
            >
              {renaming ? (
                <ActivityIndicator size="small" color={colors.text.secondary} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={deleteChat} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View style={styles.messagesContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScrollView}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: keyboardHeight > 0 ? 20 : spacing[4] },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {chat.messages.length === 0 ? (
              <View style={styles.noMessagesState}>
                <Text style={styles.noMessagesText}>No messages yet</Text>
                <Text style={commonStyles.muted}>
                  Ask a question below to start the conversation
                </Text>
              </View>
            ) : (
              chat.messages.map((m, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.messageBubble,
                    m.role === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      m.role === "user" && styles.userMessageText,
                    ]}
                  >
                    {m.content}
                  </Text>
                  {m.timestamp && (
                    <Text style={styles.timestamp}>
                      {new Date(m.timestamp).toLocaleString()}
                    </Text>
                  )}
                </View>
              ))
            )}
            {sending && (
              <View
                style={[
                  styles.messageBubble,
                  styles.aiBubble,
                  styles.loadingBubble,
                ]}
              >
                <ActivityIndicator
                  color={screenThemes.chat.primary}
                  size="small"
                />
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            { marginBottom: keyboardHeight > 0 ? 10 : spacing[4] },
          ]}
        >
          <TextInput
            ref={messageInputRef}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your question..."
            style={styles.messageInput}
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={doSend}
            onFocus={handleInputFocus}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            disabled={!message.trim() || sending}
            onPress={doSend}
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.buttonDisabled,
            ]}
          >
            {sending ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
    paddingTop: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing[3],
  },

  backButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[1],
  },

  backButtonText: {
    color: screenThemes.chat.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },

  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },

  titleInput: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background,
  },

  saveButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background,
  },

  saveButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  deleteButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: borderRadius.base,
    backgroundColor: colors.error[50],
  },

  deleteButtonText: {
    color: colors.error[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  messagesContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  messagesScrollView: {
    flex: 1,
  },

  messagesContent: {
    padding: spacing[4],
    gap: spacing[3],
    flexGrow: 1,
  },

  noMessagesState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[12],
  },

  noMessagesText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },

  messageBubble: {
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    maxWidth: "85%",
    ...shadows.sm,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: screenThemes.chat.primary,
    borderBottomRightRadius: borderRadius.sm,
  },

  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.background,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },

  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    color: colors.text.primary,
  },

  userMessageText: {
    color: colors.text.inverse,
  },

  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontStyle: "italic",
  },

  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    opacity: 0.7,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[2],
    padding: spacing[4],
    paddingTop: spacing[3],
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  messageInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    textAlignVertical: "top",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },

  sendButton: {
    backgroundColor: screenThemes.chat.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 44,
    borderRadius: borderRadius.base,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },

  sendButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error[600],
    marginBottom: spacing[4],
  },
});
