import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { ChatAPI } from '../lib/api';
import { colors, commonStyles, spacing, borderRadius, shadows, typography, screenThemes } from '../styles/theme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatFull {
  _id: string;
  title: string;
  type: 'topic' | 'document' | 'website' | 'general';
  messages: Message[];
}

interface ChatDetailsProps {
  chat: ChatFull;
  onTitleUpdate: (newTitle: string) => void;
  onMessagesUpdate: (messages: Message[]) => void;
}

export default function ChatDetails({ chat, onTitleUpdate, onMessagesUpdate }: ChatDetailsProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const messageInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setNewTitle(chat.title);
  }, [chat.title]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (chat.messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chat.messages.length]);

  const saveTitle = async () => {
    if (!newTitle.trim()) return;
    try {
      setRenaming(true);
      await ChatAPI.updateTitle(chat._id, newTitle.trim());
      onTitleUpdate(newTitle.trim());
    } catch (e) {
      console.error(e);
    } finally {
      setRenaming(false);
    }
  };

  const doSend = async () => {
    if (!message.trim()) return;
    
    const messageToSend = message.trim();
    setMessage('');
    messageInputRef.current?.blur();
    
    try {
      setSending(true);
      const { data } = await ChatAPI.sendMessage(chat._id, messageToSend);
      const userMessage = data?.userMessage || { role: 'user', content: messageToSend };
      const aiResponse = data?.aiResponse || { role: 'assistant', content: '' };
      
      const newMessages = [...chat.messages, userMessage, aiResponse];
      onMessagesUpdate(newMessages);
    } catch (e) {
      console.error(e);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TextInput
          value={newTitle}
          onChangeText={setNewTitle}
          style={[commonStyles.input, styles.titleInput]}
          placeholder="Chat title"
          placeholderTextColor={colors.text.tertiary}
          returnKeyType="done"
          onSubmitEditing={saveTitle}
        />
        <TouchableOpacity
          onPress={saveTitle}
          disabled={renaming || newTitle === chat.title}
          style={[
            commonStyles.secondaryButton,
            styles.saveButton,
            (renaming || newTitle === chat.title) && styles.buttonDisabled
          ]}
        >
          {renaming ? (
            <ActivityIndicator size="small" color={colors.text.secondary} />
          ) : (
            <Text style={commonStyles.secondaryButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.messagesContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScrollView}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: keyboardHeight > 0 ? 20 : spacing[4] }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {chat.messages.length === 0 ? (
            <View style={styles.noMessagesState}>
              <Text style={styles.noMessagesText}>No messages yet</Text>
              <Text style={commonStyles.muted}>Ask a question below to start the conversation</Text>
            </View>
          ) : (
            chat.messages.map((m, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  m.role === 'user' ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  m.role === 'user' && styles.userMessageText
                ]}>
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
            <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
              <ActivityIndicator color={screenThemes.chat.primary} size="small" />
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={[styles.inputContainer, { marginBottom: keyboardHeight > 0 ? 10 : spacing[4] }]}>
        <TextInput
          ref={messageInputRef}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your question..."
          style={[commonStyles.input, styles.messageInput]}
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
            commonStyles.primaryButton,
            styles.sendButton,
            (!message.trim() || sending) && styles.buttonDisabled
          ]}
        >
          {sending ? (
            <ActivityIndicator color={colors.text.inverse} size="small" />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },

  titleInput: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  saveButton: {
    paddingHorizontal: spacing[3],
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
    alignItems: 'center',
    justifyContent: 'center',
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
    maxWidth: '85%',
    ...shadows.sm,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: screenThemes.chat.primary,
    borderBottomRightRadius: borderRadius.sm,
  },

  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontStyle: 'italic',
  },

  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    opacity: 0.7,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    textAlignVertical: 'top',
  },

  sendButton: {
    backgroundColor: screenThemes.chat.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 44,
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
