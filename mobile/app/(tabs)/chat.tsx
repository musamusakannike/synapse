import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { ChatAPI } from '../../lib/api';
import { useLocalSearchParams } from 'expo-router';
import { colors, commonStyles, spacing, borderRadius, shadows, typography, screenThemes } from '../../styles/theme';

interface ChatListItem {
  id: string;
  title: string;
  type: 'topic' | 'document' | 'website' | 'general';
  messageCount: number;
  lastMessage: null | { role: string; content: string; timestamp: string };
  lastActivity: string;
  createdAt: string;
}

interface Message { role: 'user' | 'assistant'; content: string; timestamp?: string }
interface ChatFull { _id: string; title: string; type: ChatListItem['type']; messages: Message[] }

export default function ChatScreen() {
  const params = useLocalSearchParams<{ open?: string }>();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatFull | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const loadChats = async () => {
    try {
      setLoadingList(true);
      const { data } = await ChatAPI.list();
      setChats(data?.chats || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const openChat = async (id: string) => {
    try {
      setSelectedId(id);
      const { data } = await ChatAPI.get(id);
      const c = data?.chat;
      if (c) {
        setChat({ _id: c._id, title: c.title, type: c.type, messages: c.messages || [] });
        setNewTitle(c.title);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadChats(); }, []);

  useEffect(() => {
    const id = params.open;
    if (id && typeof id === 'string') {
      openChat(id);
    }
  }, [params.open]);

  const createChat = async () => {
    try {
      setCreating(true);
      const { data } = await ChatAPI.create();
      const id = data?.chat?.id;
      if (id) {
        await loadChats();
        await openChat(id);
      }
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const removeChat = async (id: string) => {
    try {
      await ChatAPI.delete(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) { setSelectedId(null); setChat(null); }
    } catch (e) { console.error(e); }
  };

  const doSend = async () => {
    if (!selectedId || !message.trim()) return;
    try {
      setSending(true);
      const { data } = await ChatAPI.sendMessage(selectedId, message.trim());
      const userMessage = data?.userMessage || { role: 'user', content: message.trim() };
      const aiResponse = data?.aiResponse || { role: 'assistant', content: '' };
      setChat((prev) => prev ? { ...prev, messages: [...prev.messages, userMessage, aiResponse] } : prev);
      setMessage('');
      loadChats();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const saveTitle = async () => {
    if (!selectedId || !newTitle.trim()) return;
    try {
      setRenaming(true);
      await ChatAPI.updateTitle(selectedId, newTitle.trim());
      setChat((prev) => prev ? { ...prev, title: newTitle.trim() } : prev);
      setChats((prev) => prev.map((c) => (c.id === selectedId ? { ...c, title: newTitle.trim() } : c)));
    } catch (e) { console.error(e); }
    finally { setRenaming(false); }
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={commonStyles.content}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={commonStyles.title}>Chat</Text>
          <Text style={commonStyles.subtitle}>Ask questions and get AI answers</Text>
        </View>
        <TouchableOpacity 
          onPress={createChat} 
          disabled={creating} 
          style={[commonStyles.primaryButton, styles.newChatButton, creating && styles.buttonDisabled]}
        >
          {creating ? (
            <ActivityIndicator color={colors.text.inverse} size="small" />
          ) : (
            <Text style={commonStyles.primaryButtonText}>New Chat</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={commonStyles.card}>
        <Text style={commonStyles.cardTitle}>Your Chats</Text>
        {loadingList ? (
          <View style={commonStyles.centerBox}>
            <ActivityIndicator color={screenThemes.chat.primary} size="large" />
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No chats yet</Text>
            <Text style={commonStyles.muted}>Start a new conversation above</Text>
          </View>
        ) : (
          chats.map((c) => (
            <TouchableOpacity 
              key={c.id} 
              style={[
                commonStyles.listItem, 
                styles.chatItem,
                selectedId === c.id && styles.chatItemSelected
              ]} 
              onPress={() => openChat(c.id)}
            >
              <View style={styles.chatContent}>
                <Text style={commonStyles.itemTitle} numberOfLines={1}>{c.title}</Text>
                {c.lastMessage && (
                  <Text style={commonStyles.itemMeta} numberOfLines={2}>
                    {c.lastMessage.content}
                  </Text>
                )}
                <Text style={styles.chatMeta}>
                  {c.messageCount} messages • {new Date(c.lastActivity).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  removeChat(c.id);
                }} 
                style={[commonStyles.secondaryButton, styles.deleteButton]}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={[commonStyles.card, styles.chatContainer]}>
        {!chat ? (
          <View style={styles.selectChatState}>
            <Text style={styles.selectChatText}>Select a chat to begin</Text>
            <Text style={commonStyles.muted}>Choose from your existing chats or create a new one</Text>
          </View>
        ) : (
          <>
            <View style={styles.chatHeader}>
              <TextInput 
                value={newTitle} 
                onChangeText={setNewTitle} 
                style={[commonStyles.input, styles.titleInput]} 
                placeholder="Chat title"
                placeholderTextColor={colors.text.tertiary}
              />
              <TouchableOpacity 
                onPress={saveTitle} 
                disabled={renaming} 
                style={[commonStyles.secondaryButton, renaming && styles.buttonDisabled]}
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
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {chat.messages.length === 0 ? (
                  <View style={styles.noMessagesState}>
                    <Text style={commonStyles.muted}>No messages yet. Ask a question below.</Text>
                  </View>
                ) : (
                  chat.messages.map((m, idx) => (
                    <View key={idx} style={[
                      styles.messageBubble, 
                      m.role === 'user' ? styles.userBubble : styles.aiBubble
                    ]}>
                      <Text style={styles.messageText}>{m.content}</Text>
                      {m.timestamp && (
                        <Text style={styles.timestamp}>
                          {new Date(m.timestamp).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput 
                value={message} 
                onChangeText={setMessage} 
                placeholder="Type your question..." 
                style={[commonStyles.input, styles.messageInput]}
                placeholderTextColor={colors.text.tertiary}
                multiline
                maxLength={1000}
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
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  
  headerContent: {
    flex: 1,
    marginRight: spacing[4],
  },
  
  newChatButton: {
    backgroundColor: screenThemes.chat.primary,
    paddingHorizontal: spacing[4],
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  
  chatItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  
  chatItemSelected: {
    backgroundColor: screenThemes.chat.background,
    borderColor: screenThemes.chat.primary,
  },
  
  chatContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  
  chatMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  
  deleteButton: {
    borderColor: colors.error[200],
    backgroundColor: colors.error[50],
    marginLeft: 0,
  },
  
  deleteButtonText: {
    color: colors.error[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  chatContainer: {
    minHeight: 400,
  },
  
  selectChatState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
  },
  
  selectChatText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  
  titleInput: {
    flex: 1,
  },
  
  messagesContainer: {
    maxHeight: 300,
    marginBottom: spacing[4],
  },
  
  messagesContent: {
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  
  noMessagesState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  
  messageBubble: {
    borderRadius: borderRadius.md,
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
    backgroundColor: colors.neutral[100],
    borderBottomLeftRadius: borderRadius.sm,
  },
  
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    color: colors.text.primary,
  },
  
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  
  messageInput: {
    flex: 1,
    maxHeight: 100,
  },
  
  sendButton: {
    backgroundColor: screenThemes.chat.primary,
    paddingHorizontal: spacing[4],
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
});
