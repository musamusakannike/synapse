import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatAPI } from '../../lib/api';
import { useRouter } from 'expo-router';
import { colors, commonStyles, spacing, borderRadius, shadows, typography, screenThemes } from '../../styles/theme';
import { confirmations } from '../../components/ConfirmationDialog';

interface ChatListItem {
  id: string;
  title: string;
  type: 'topic' | 'document' | 'website' | 'general';
  messageCount: number;
  lastMessage: null | { role: string; content: string; timestamp: string };
  lastActivity: string;
  createdAt: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [creating, setCreating] = useState(false);

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

  const openChat = (id: string) => {
    router.push(`/chat/${id}`);
  };

  useEffect(() => { loadChats(); }, []);

  const createChat = async () => {
    try {
      setCreating(true);
      const { data } = await ChatAPI.create();
      const id = data?.chat?.id;
      if (id) {
        await loadChats();
        openChat(id);
      }
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const removeChat = async (id: string) => {
    confirmations.deleteChat(async () => {
      try {
        await ChatAPI.delete(id);
        setChats((prev) => prev.filter((c) => c.id !== id));
      } catch (e) { 
        console.error(e); 
      }
    });
  };


  return (
    <SafeAreaView style={commonStyles.container}>
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
              style={[commonStyles.listItem, styles.chatItem]} 
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

    </ScrollView>
    </SafeAreaView>
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
  
  buttonDisabled: {
    opacity: 0.6,
  },
});
