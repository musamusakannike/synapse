import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";
import { ChatAPI } from "../lib/api";
import ChatSkeleton from "../components/ChatSkeleton";

const AnimatedButton = ({
  children,
  delay,
  icon,
}: {
  children: string;
  delay: number;
  icon: string;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1));
    translateY.value = withDelay(delay, withSpring(0));
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyle]}>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          {icon} {children}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export default function AIInterface() {
  const headerOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const sendButtonWidth = useSharedValue(0);
  const { openAuthModal, openSidebar, setOnChatSelect } = useAuth();

  // Chat state
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);

  useEffect(() => {
    headerOpacity.value = withSpring(1, { duration: 800 });
    titleOpacity.value = withDelay(200, withSpring(1, { duration: 800 }));
  }, [headerOpacity, titleOpacity]);

  const handleOpenChat = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      setIsChatMode(true);

      // Fetch chat with messages
      const response = await ChatAPI.getChatWithMessages(chatId);
      const chat = response.data.chat;

      // Set current chat ID
      setCurrentChatId(chat._id);

      // Load messages
      const loadedMessages: Message[] = chat.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error("Open chat error:", error);
      Alert.alert("Error", "Failed to load chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register chat select handler
  useEffect(() => {
    setOnChatSelect(handleOpenChat);
  }, [setOnChatSelect, handleOpenChat]);

  // Animate send button when user types
  useEffect(() => {
    if (inputText.trim().length > 0) {
      sendButtonWidth.value = withTiming(60, { duration: 200 });
    } else {
      sendButtonWidth.value = withTiming(0, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      {
        translateY: interpolate(titleOpacity.value, [0, 1], [30, 0]),
      },
    ],
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    width: sendButtonWidth.value,
    opacity: sendButtonWidth.value > 0 ? 1 : 0,
    marginLeft: sendButtonWidth.value > 0 ? 8 : 0,
  }));

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");

    try {
      // Enter chat mode and hide homepage content
      setIsChatMode(true);

      // Add user message to UI
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      setIsLoading(true);

      // Create new chat if needed
      let chatId = currentChatId;
      if (!chatId) {
        const response = await ChatAPI.createNewChat();
        chatId = response.data.chat.id;
        setCurrentChatId(chatId);
      }

      // Send message and get response
      if (!chatId) throw new Error("Chat ID is required");
      const response = await ChatAPI.sendMessage(chatId, userMessage);

      // Add AI response to UI
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.aiResponse.content,
          timestamp: new Date(response.data.aiResponse.timestamp),
        },
      ]);
    } catch (error) {
      console.error("Send message error:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
      // Remove the user message if sending failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, currentChatId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Synapse</Text>

        <TouchableOpacity onPress={openAuthModal}>
          <View style={styles.profileCircle}>
            <View style={styles.profileInner}>
              <Text style={styles.profileText}>💻</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!isChatMode || messages.length === 0 ? (
          <>
            {/* Greeting Section */}
            <Animated.View style={titleStyle}>
              <Text style={styles.greeting}>Hi Musa</Text>
              <Text style={styles.question}>Where should we start?</Text>
            </Animated.View>

            {/* Action Buttons */}
            <View style={styles.buttonsWrapper}>
              <AnimatedButton delay={400} icon="✍️">
                Upload Document
              </AnimatedButton>
              <AnimatedButton delay={500} icon="">
                Generate a complete course
              </AnimatedButton>
              <AnimatedButton delay={600} icon="">
                Take a Quiz
              </AnimatedButton>
              <AnimatedButton delay={800} icon="">
                Watch Tutorials
              </AnimatedButton>
            </View>
          </>
        ) : (
          <>
            {/* Chat Messages */}
            <View style={styles.chatContainer}>
              {messages.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageWrapper,
                    message.role === "user"
                      ? styles.userMessageWrapper
                      : styles.assistantMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === "user"
                        ? styles.userMessage
                        : styles.assistantMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.role === "user"
                          ? styles.userMessageText
                          : styles.assistantMessageText,
                      ]}
                    >
                      {message.content}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Loading Skeleton */}
              {isLoading && <ChatSkeleton />}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Input Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.inputContainer}>
          <View>
            <TextInput
              placeholder="Ask Synapse"
              placeholderTextColor={"#666"}
              style={styles.input}
              numberOfLines={7}
              multiline={true}
              value={inputText}
              onChangeText={setInputText}
              editable={!isLoading}
            />
          </View>
          <View style={styles.inputButtons}>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            <View style={styles.rightButtons}>
              <TouchableOpacity style={styles.thinkingButton}>
                <Text style={styles.thinkingText}>Thinking</Text>
              </TouchableOpacity>

              <Animated.View
                style={[styles.sendButtonContainer, sendButtonStyle]}
              >
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                >
                  <Text style={styles.sendButtonText}>➤</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 10,
  },
  menuLine: {
    width: 24,
    height: 2,
    backgroundColor: "#000",
    marginVertical: 3,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    color: "#000",
    fontFamily: "Outfit_500Medium",
    letterSpacing: 0.5,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4285F4",
    padding: 2,
  },
  profileInner: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  greeting: {
    fontSize: 32,
    color: "#4285F4",
    fontFamily: "Outfit_500Medium",
    marginBottom: 8,
  },
  question: {
    fontSize: 32,
    fontWeight: "400",
    color: "#C4C7C5",
    fontFamily: "Outfit_400Regular",
    lineHeight: 42,
  },
  buttonsWrapper: {
    marginTop: 50,
    gap: 16,
  },
  buttonContainer: {
    marginBottom: 0,
  },
  button: {
    backgroundColor: "#f0f4f9",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  buttonText: {
    color: "#1f1f1f",
    fontSize: 17,
    fontFamily: "Outfit_400Regular",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "column",
    backgroundColor: "#f0f4f9",
    width: "100%",
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    color: "#1f1f1f",
    fontSize: 18,
    fontFamily: "Outfit_400Regular",
    padding: 12,
    borderRadius: 28,
    minHeight: 60,
  },
  addButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#444",
    fontSize: 24,
    fontWeight: "300",
  },
  inputPlaceholder: {
    flex: 1,
    color: "#666",
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
  },
  inputButtons: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  thinkingButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  thinkingText: {
    color: "#444",
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },
  micButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  micIcon: {
    fontSize: 20,
  },
  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: "#e8f0fe",
    borderRadius: 20,
  },
  voiceBar: {
    width: 3,
    height: 12,
    backgroundColor: "#4285F4",
    borderRadius: 2,
  },
  voiceBarTall: {
    height: 18,
  },
  chatContainer: {
    flex: 1,
    paddingTop: 20,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: "flex-end",
  },
  assistantMessageWrapper: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: "#4285F4",
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: "#f0f4f9",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  assistantMessageText: {
    color: "#1f1f1f",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sendButtonContainer: {
    overflow: "hidden",
  },
  sendButton: {
    width: 60,
    height: 36,
    backgroundColor: "#4285F4",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});
