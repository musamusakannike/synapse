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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import useGemini from "@/lib/useGemini";
import Markdown from "react-native-markdown-display";
import { useChats, IChat, IMessage } from "@/lib/useChats";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { loading, reply, error, fetchGeminiReply, setReply } = useGemini();
  const {
    chats,
    messages,
    createChat,
    getMessages,
    addMessage,
    setMessages,
    deleteChat,
    clearChatHistory,
  } = useChats();
  const { signOut } = useAuth();
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
    if (reply && activeChat && activeChat._id) {
      addMessage(String(activeChat._id), reply, "other");
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
          newMessage.chatId = newChat._id!;
          setMessages([newMessage]);
        } else {
          return;
        }
      } else {
        newMessage.chatId = currentChat._id!;
      }

      addMessage(String(currentChat._id!), message, "me");
      await fetchGeminiReply(message);
      setMessage("");
    }
  };

  const handleSelectChat = async (chat: IChat) => {
    setSidebarVisible(false);
    setActiveChat(chat);
    await getMessages(chat._id!);
  };

  const handleCopy = async (text: string, id: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
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
        <TouchableOpacity
          onPress={() => handleCopy(item.text, item._id!)}
          style={{ position: "absolute", top: 5, right: 5, padding: 8 }}
        >
          <Ionicons
            name={
              copiedMessageId === item._id ? "checkmark-circle" : "copy-outline"
            }
            size={16}
            color={copiedMessageId === item._id ? "green" : "grey"}
          />
        </TouchableOpacity>
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
              <View key={chat._id} style={styles.chatItemContainer}>
                <TouchableOpacity
                  style={styles.chatItem}
                  onPress={() => handleSelectChat(chat)}
                >
                  <Text style={styles.chatItemText}>{chat.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Delete Chat",
                      "Are you sure you want to delete this chat?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          onPress: () => deleteChat(chat._id!),
                          style: "destructive",
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sidebarButtons}>
            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                Alert.alert(
                  "Clear History",
                  "Are you sure you want to delete all chats?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      onPress: clearChatHistory,
                      style: "destructive",
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash-bin-outline" size={20} color="white" />
              <Text style={styles.sidebarButtonText}>Clear History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={signOut}>
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.sidebarButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
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
            keyExtractor={(item, index) => item._id || index.toString()}
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
