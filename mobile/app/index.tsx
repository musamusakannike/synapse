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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import useGemini from "@/lib/useGemini";
import Markdown from "react-native-markdown-display";

interface IMessage {
  id: string;
  text: string;
  sender: "me" | "other";
}
const markdownStyles = {
  body: { fontSize: 16, lineHeight: 24, color: "#333" },
  strong: { fontWeight: "700" as const, color: "#111" }, // Fix: use "700" and assert with `as const`
  bullet_list: { marginVertical: 8 },
  list_item: { marginBottom: 6 },
};

export default function Index() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { loading, reply, error, fetchGeminiReply, setReply } = useGemini();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (reply) {
      const geminiMessage: IMessage = {
        id: Date.now().toString() + "g",
        text: reply,
        sender: "other",
      };
      setMessages((prev) => [...prev, geminiMessage]);
      setReply(null);
    }
  }, [reply]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (message.trim()) {
      const newMessage: IMessage = {
        id: Date.now().toString(),
        text: message,
        sender: "me",
      };
      setMessages((prev) => [...prev, newMessage]);
      await fetchGeminiReply(message);
      setMessage("");
    }
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
        <Markdown style={markdownStyles} >{item.text}</Markdown>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
    </SafeAreaView>
  );
}
