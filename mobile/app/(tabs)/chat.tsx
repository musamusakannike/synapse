import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { ChatAPI } from '../../lib/api';
import { useLocalSearchParams } from 'expo-router';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.title}>Chat</Text>
          <Text style={styles.subtitle}>Ask questions and get AI answers</Text>
        </View>
        <TouchableOpacity onPress={createChat} disabled={creating} style={styles.primaryBtn}>
          {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>New Chat</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your chats</Text>
        {loadingList ? (
          <View style={styles.centerBox}><ActivityIndicator color="#2563EB" /></View>
        ) : chats.length === 0 ? (
          <Text style={styles.muted}>No chats yet.</Text>
        ) : (
          chats.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.listItem, selectedId === c.id && { backgroundColor: '#EFF6FF' }]} onPress={() => openChat(c.id)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{c.title}</Text>
                {c.lastMessage && <Text style={styles.itemMeta} numberOfLines={1}>{c.lastMessage.content}</Text>}
              </View>
              <TouchableOpacity onPress={() => removeChat(c.id)} style={styles.secondaryBtn}><Text>Delete</Text></TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.card}>
        {!chat ? (
          <View style={styles.centerBox}><Text style={styles.muted}>Select a chat to begin</Text></View>
        ) : (
          <>
            <View style={styles.row}>
              <TextInput value={newTitle} onChangeText={setNewTitle} style={[styles.input, { flex: 1 }]} />
              <TouchableOpacity onPress={saveTitle} disabled={renaming} style={styles.secondaryBtn}>
                {renaming ? <ActivityIndicator /> : <Text>Save</Text>}
              </TouchableOpacity>
            </View>
            <View style={{ maxHeight: 400 }}>
              <ScrollView contentContainerStyle={{ gap: 8 }}>
                {chat.messages.length === 0 ? (
                  <Text style={styles.muted}>No messages yet. Ask a question below.</Text>
                ) : (
                  chat.messages.map((m, idx) => (
                    <View key={idx} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                      <Text style={{ color: '#111827' }}>{m.content}</Text>
                      {m.timestamp ? <Text style={styles.timestamp}>{new Date(m.timestamp).toLocaleString()}</Text> : null}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              <TextInput value={message} onChangeText={setMessage} placeholder="Type your question..." style={[styles.input, { flex: 1 }]} />
              <TouchableOpacity disabled={!message.trim() || sending} onPress={doSend} style={styles.primaryBtn}>
                {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Send</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6B7280', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 8 },
  centerBox: { height: 80, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#6B7280' },
  listItem: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 10 },
  itemTitle: { fontWeight: '600', color: '#111827' },
  itemMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  bubble: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, maxWidth: '90%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#F9FAFB' },
  timestamp: { color: '#9CA3AF', fontSize: 10, marginTop: 4 },
});
