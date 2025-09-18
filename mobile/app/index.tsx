import { styles } from "@/styles";
import { KeyboardAvoidingView, Text, View, Platform, TextInput, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

interface IMessage {
  id: string;
  text: string;
  sender: "me" | "other";
}


const mockMessages: IMessage[] = [
  { id: "1", text: "Hey there!", sender: "other" },
  { id: "2", text: "Hello! How are you?", sender: "me" },
  { id: "3", text: "I’m doing well, thanks. How about you?", sender: "other" },
  { id: "4", text: "I’m doing well, thanks. How about you?", sender: "other" },
  { id: "5", text: "I’m great! Just working on a project.", sender: "me" },
  { id: "6", text: "That’s awesome!", sender: "other" },
];

export default function Index() {

  const [message, setMessage] = useState("");

  const renderItem = ({ item }: { item: IMessage }) => {
    const isMe = item.sender === "me";
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // keyboardVerticalOffset={0} // adjust for header height if needed
      >
        {/* Messages List */}
        <FlatList
          data={mockMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
        />

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              if (message.trim()) {
                console.log("Send:", message);
                setMessage(""); // clear input
              }
            }}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
