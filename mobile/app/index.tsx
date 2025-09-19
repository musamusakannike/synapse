import { styles } from "@/styles";
import {
  KeyboardAvoidingView,
  Text,
  View,
  Platform,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import useGemini from "@/lib/useGemini";
import Markdown from "react-native-markdown-display";
import { useChats, IChat, IMessage } from "@/lib/useChats";

const markdownStyles = {
  body: { fontSize: 16, lineHeight: 24, color: "#333" },
  strong: { fontWeight: "700" as const, color: "#111" },
  bullet_list: { marginVertical: 8 },
  list_item: { marginBottom: 6 },
};

export default function Index() {
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState<IChat | null>(null);
  const { loading, reply, error, fetchGeminiReply, setReply } = useGemini();
  const { chats, messages, createChat, getMessages, addMessage, setMessages } = useChats();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (reply && activeChat) {
      const geminiMessage: IMessage = {
        chatId: activeChat.$id!,
        text: reply,
        sender: "other",
      };
      addMessage(geminiMessage);
      setReply(null);
    }
  }, [reply, setReply, activeChat, addMessage]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (message.trim()) {
      let currentChat = activeChat;
      const newMessage: IMessage = {
        chatId: "",
        text: message,
        sender: "me",
      };

      if (!currentChat) {
        const newChat = await createChat(message.substring(0, 30));
        if (newChat) {
          setActiveChat(newChat);
          currentChat = newChat;
          newMessage.chatId = newChat.$id!;
          setMessages([newMessage]);
        } else {
          return;
        }
      } else {
        newMessage.chatId = currentChat.$id!;
      }

      addMessage(newMessage);
      await fetchGeminiReply(message);
      setMessage("");
    }
  };

  const handleSelectChat = async (chat: IChat) => {
    setActiveChat(chat);
    await getMessages(chat.$id!);
  };

  const renderItem = ({ item }: { item: IMessage }) => {
    const isMe = item.sender === "me";
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Markdown style={markdownStyles}>{item.text}</Markdown>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={styles.sidebar}>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => setActiveChat(null)}
          >
            <Text style={styles.newChatButtonText}>+ New Chat</Text>
          </TouchableOpacity>
          <ScrollView>
            {chats.map((chat) => (
              <TouchableOpacity
                key={chat.$id}
                style={styles.chatItem}
                onPress={() => handleSelectChat(chat)}
              >
                <Text style={styles.chatItemText}>{chat.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.$id || index.toString()}
            contentContainerStyle={styles.chatContainer}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Synapse is thinking...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              style={styles.input}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
