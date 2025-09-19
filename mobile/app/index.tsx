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
  PanResponder,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import useGemini from "@/lib/useGemini";
import Markdown from "react-native-markdown-display";
import { useChats, IChat, IMessage } from "@/lib/useChats";
import {Ionicons} from "@expo/vector-icons"

const markdownStyles = {
  body: { fontSize: 16, lineHeight: 24, color: "#333" },
  strong: { fontWeight: "700" as const, color: "#111" },
  bullet_list: { marginVertical: 8 },
  list_item: { marginBottom: 6 },
};

export default function Index() {
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState<IChat | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { loading, reply, error, fetchGeminiReply, setReply } = useGemini();
  const { chats, messages, createChat, getMessages, addMessage, setMessages } =
    useChats();
  const flatListRef = useRef<FlatList>(null);

  // Animate sidebar in/out
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarVisible ? 0 : -250,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible, slideAnim]);

  // Gesture handler (swipe left/right)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -50) setSidebarVisible(false); // swipe left
        if (gesture.dx > 50) setSidebarVisible(true); // swipe right
      },
    })
  ).current;

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
    setSidebarVisible(false);
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
      <View
        style={{ flex: 1, flexDirection: "row" }}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.sidebar,
            {
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 250,
              transform: [{ translateX: slideAnim }],
              zIndex: 10,
            },
          ]}
        >
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
        </Animated.View>
        <KeyboardAvoidingView
          style={[styles.container, { flex: 1 }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            onPress={() => setSidebarVisible((v) => !v)}
            style={{
              padding: 10,
              alignSelf: "flex-start",
              borderRadius: 5,
              margin: 5,
            }}
          >
            <Text>{sidebarVisible ? "Hide Menu" : <Ionicons name="menu-outline" size={24} color="white" />}</Text>
          </TouchableOpacity>
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
