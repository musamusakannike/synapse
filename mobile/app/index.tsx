import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
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
import { useSidebar } from "../contexts/SidebarContext";
import { ChatAPI, UserAPI, DocumentAPI } from "../lib/api";
import { useRouter } from "expo-router";
import ChatSkeleton from "../components/ChatSkeleton";
import MessageOptionsModal, {
  MessageOptionsModalRef,
} from "../components/MessageOptionsModal";
import DocumentUploadModal, {
  DocumentUploadModalRef,
} from "../components/DocumentUploadModal";
import CourseAttachment from "../components/CourseAttachment";
import QuizAttachment from "../components/QuizAttachment";

const AnimatedButton = memo(
  ({
    children,
    delay,
    icon,
    onPress,
  }: {
    children: string;
    delay: number;
    icon: string;
    onPress?: () => void;
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
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>
            {icon} {children}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  attachments?: (
    | {
      type: "course";
      data: {
        courseId: string;
        title: string;
        outline: {
          section: string;
          subsections?: string[];
        }[];
        settings?: {
          level: string;
          includeExamples: boolean;
          includePracticeQuestions: boolean;
          detailLevel: string;
        };
      };
      metadata?: {
        createdAt: string;
      };
    }
    | {
      type: "quiz";
      data: {
        quizId: string;
        title: string;
        questions: any[];
        settings: {
          numberOfQuestions: number;
          difficulty: string;
          includeCalculations: boolean;
          timeLimit?: number;
        };
      };
      metadata?: {
        createdAt: string;
      };
    }
  )[];
}

// Optimized MessageItem component
const MessageItem = memo(
  ({
    message,
    index,
    expandedUserMessages,
    onMessagePress,
    onExpandToggle,
    onViewCourse,
    onStartQuiz,
  }: {
    message: Message;
    index: number;
    expandedUserMessages: Record<number, boolean>;
    onMessagePress: (
      content: string,
      index: number,
      role: "user" | "assistant"
    ) => void;
    onExpandToggle: (index: number) => void;
    onViewCourse: (courseId: string) => void;
    onStartQuiz: (quizId: string) => void;
  }) => {
    const handleSwipeOpen = useCallback(() => {
      onMessagePress(message.content, index, message.role);
    }, [message.content, index, message.role, onMessagePress]);

    const handleLongPress = useCallback(() => {
      onMessagePress(message.content, index, message.role);
    }, [message.content, index, message.role, onMessagePress]);

    const handleExpandPress = useCallback(() => {
      onExpandToggle(index);
    }, [index, onExpandToggle]);

    const isExpanded = expandedUserMessages[index];

    const messageBubbleStyle = useMemo(
      () => [
        styles.messageBubble,
        message.role === "user" ? styles.userMessage : styles.assistantMessage,
        message.attachments?.some(att => att.type === "course" || att.type === "quiz") && { maxWidth: "100%" as any },
      ],
      [message.role, message.attachments]
    );

    const messageTextStyle = useMemo(
      () => [
        styles.messageText,
        message.role === "user"
          ? styles.userMessageText
          : styles.assistantMessageText,
      ],
      [message.role]
    );

    return (
      <View
        style={[
          styles.messageWrapper,
          message.role === "user"
            ? styles.userMessageWrapper
            : styles.assistantMessageWrapper,
        ]}
      >
        <Swipeable onSwipeableOpen={handleSwipeOpen}>
          <Pressable onLongPress={handleLongPress} style={messageBubbleStyle}>
            {message.role === "user" ? (
              <View style={styles.userMessageContent}>
                <Text
                  style={messageTextStyle}
                  numberOfLines={isExpanded ? undefined : 6}
                  ellipsizeMode="tail"
                >
                  {message.content}
                </Text>
                {!!message.content && (
                  <TouchableOpacity
                    style={styles.expandIconButton}
                    onPress={handleExpandPress}
                  >
                    <Text style={styles.expandIconText}>
                      {isExpanded ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <Markdown
                  style={{
                    body: StyleSheet.flatten(messageTextStyle),
                  }}
                >
                  {message.content}
                </Markdown>
                {message.attachments && message.attachments.length > 0 && (
                  <View style={styles.attachmentContainer}>
                    {message.attachments.map((attachment, attachmentIndex) => {
                      if (attachment.type === "course") {
                        return (
                          <CourseAttachment
                            key={attachmentIndex}
                            courseId={attachment.data.courseId}
                            title={attachment.data.title}
                            outline={attachment.data.outline}
                            onViewCourse={onViewCourse}
                          />
                        );
                      }
                      if (attachment.type === "quiz") {
                        return (
                          <QuizAttachment
                            key={attachmentIndex}
                            quizId={attachment.data.quizId}
                            title={attachment.data.title}
                            questions={attachment.data.questions}
                            settings={attachment.data.settings}
                            onStartQuiz={onStartQuiz}
                          />
                        );
                      }
                      return null;
                    })}
                  </View>
                )}
              </>
            )}
          </Pressable>
        </Swipeable>
      </View>
    );
  }
);
MessageItem.displayName = "MessageItem";

export default function AIInterface() {
  const headerOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const sendButtonWidth = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const { openAuthModal, setOnChatSelect, isAuthenticated } = useAuth();
  const { openSidebar, setOnChatSelect: setSidebarChatSelect } = useSidebar();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const messageOptionsModalRef = useRef<MessageOptionsModalRef>(null);
  const documentUploadModalRef = useRef<DocumentUploadModalRef>(null);
  const lastScrollYRef = useRef(0);

  // Chat state
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(
    null
  );
  const [greeting, setGreeting] = useState<string>("Hi there");
  const [selectedMessageContent, setSelectedMessageContent] =
    useState<string>("");
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(-1);
  const [selectedMessageRole, setSelectedMessageRole] = useState<
    "user" | "assistant"
  >("user");
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editedMessageContent, setEditedMessageContent] = useState("");
  const [expandedUserMessages, setExpandedUserMessages] = useState<
    Record<number, boolean>
  >({});
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Document upload state
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard listeners for Android
  useEffect(() => {
    if (Platform.OS === "android") {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        (e) => {
          setKeyboardHeight(e.endCoordinates.height);
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setKeyboardHeight(0);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, []);

  useEffect(() => {
    headerOpacity.value = withSpring(1, { duration: 800 });
    titleOpacity.value = withDelay(200, withSpring(1, { duration: 800 }));
  }, [headerOpacity, titleOpacity]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await UserAPI.getCurrentUser();
        if (data?.name || data?.email) {
          const nameFromEmail = data.email ? data.email.split("@")[0] : "";
          const normalizedName = (data.name || nameFromEmail || "").trim();
          if (normalizedName) {
            setUserName(normalizedName);
          }
        }

        if (data?.profilePicture) {
          setUserProfilePicture(data.profilePicture);
        }
      } catch {
        // Ignore error and keep default greeting
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const baseName = userName || "there";

    let timeOfDay: "morning" | "afternoon" | "evening";
    if (hour < 12) {
      timeOfDay = "morning";
    } else if (hour < 18) {
      timeOfDay = "afternoon";
    } else {
      timeOfDay = "evening";
    }

    const options: string[] = [
      `Hi ${baseName}`,
      `Hello ${baseName}`,
      `Welcome back, ${baseName}`,
      timeOfDay === "morning" ? `Good morning, ${baseName}` : "",
      timeOfDay === "afternoon" ? `Good afternoon, ${baseName}` : "",
      timeOfDay === "evening" ? `Good evening, ${baseName}` : "",
    ].filter(Boolean) as string[];

    if (options.length > 0) {
      const index = Math.floor(Math.random() * options.length);
      setGreeting(options[index]);
    }
  }, [userName]);

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
        attachments: msg.attachments && msg.attachments.length > 0 ? msg.attachments.map((att: any) => ({
          type: att.type,
          data: att.data,
          metadata: att.metadata,
        })) : undefined,
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
    setSidebarChatSelect(handleOpenChat);
  }, [setOnChatSelect, setSidebarChatSelect, handleOpenChat]);

  // Memoize expensive computations
  const memoizedMessages = useMemo(() => messages, [messages]);
  const shouldShowHomepage = useMemo(
    () => !isChatMode || messages.length === 0,
    [isChatMode, messages.length]
  );

  // Animate send button when user types (debounced)
  const debouncedInputLength = useMemo(() => {
    return inputText.trim().length;
  }, [inputText]);

  useEffect(() => {
    if (debouncedInputLength > 0) {
      sendButtonWidth.value = withTiming(60, { duration: 200 });
    } else {
      sendButtonWidth.value = withTiming(0, { duration: 200 });
    }
  }, [debouncedInputLength, sendButtonWidth]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: headerTranslateY.value,
      },
    ],
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

  const handleScroll = useCallback(
    (event: any) => {
      const y = event.nativeEvent.contentOffset?.y || 0;
      const lastY = lastScrollYRef.current || 0;
      const deltaY = y - lastY;

      if (!isFocusMode && isChatMode && messages.length > 1) {
        if (deltaY > 5 && y > 0) {
          headerTranslateY.value = withTiming(-80, { duration: 200 });
        } else if (deltaY < -5) {
          headerTranslateY.value = withTiming(0, { duration: 200 });
        }
      } else {
        headerTranslateY.value = withTiming(0, { duration: 200 });
      }

      lastScrollYRef.current = y;
    },
    [isFocusMode, isChatMode, messages.length, headerTranslateY]
  );

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
          attachments: response.data.aiResponse.attachments && response.data.aiResponse.attachments.length > 0 ?
            response.data.aiResponse.attachments.map((att: any) => ({
              type: att.type,
              data: att.data,
              metadata: att.metadata,
            })) : undefined,
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

  const handleEditMessage = useCallback(() => {
    if (selectedMessageIndex < 0 || !currentChatId) return;

    // Set edit mode and populate edit input with current message content
    setIsEditingMessage(true);
    setEditedMessageContent(messages[selectedMessageIndex].content);
  }, [selectedMessageIndex, currentChatId, messages]);

  const handleSubmitEdit = useCallback(async () => {
    if (
      !editedMessageContent.trim() ||
      !currentChatId ||
      selectedMessageIndex < 0
    )
      return;

    try {
      setIsLoading(true);

      // Call API to edit message
      const response = await ChatAPI.editMessage(
        currentChatId,
        selectedMessageIndex,
        editedMessageContent.trim()
      );

      // Update messages with the response
      setMessages(
        response.data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          attachments: msg.attachments && msg.attachments.length > 0 ? msg.attachments.map((att: any) => ({
            type: att.type,
            data: att.data,
            metadata: att.metadata,
          })) : undefined,
        }))
      );

      // Reset edit mode
      setIsEditingMessage(false);
      setEditedMessageContent("");
      setSelectedMessageIndex(-1);
    } catch (error) {
      console.error("Edit message error:", error);
      Alert.alert("Error", "Failed to edit message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [editedMessageContent, currentChatId, selectedMessageIndex]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingMessage(false);
    setEditedMessageContent("");
    setSelectedMessageIndex(-1);
  }, []);

  const handleRegenerateResponse = useCallback(async () => {
    if (selectedMessageIndex < 0 || !currentChatId) return;

    try {
      setIsLoading(true);

      // Call API to regenerate response
      const response = await ChatAPI.regenerateResponse(
        currentChatId,
        selectedMessageIndex
      );

      // Update messages with the response
      setMessages(
        response.data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          attachments: msg.attachments && msg.attachments.length > 0 ? msg.attachments.map((att: any) => ({
            type: att.type,
            data: att.data,
            metadata: att.metadata,
          })) : undefined,
        }))
      );

      setSelectedMessageIndex(-1);
    } catch (error) {
      console.error("Regenerate response error:", error);
      Alert.alert("Error", "Failed to regenerate response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMessageIndex, currentChatId]);

  const handleEnterFocusMode = useCallback(() => {
    if (selectedMessageIndex < 0) return;
    setIsFocusMode(true);
  }, [selectedMessageIndex]);

  const handleExitFocusMode = useCallback(() => {
    setIsFocusMode(false);
  }, []);

  // Document upload handlers (optimized polling)
  const handleDocumentUpload = useCallback(
    async (documentId: string) => {
      // Start polling for document status with exponential backoff
      let pollInterval = 2000; // Start with 2 seconds
      const maxInterval = 10000; // Max 10 seconds

      const pollDocument = async () => {
        try {
          const response = await DocumentAPI.getDocument(documentId);
          const document = response.data;

          if (document.processingStatus === "completed") {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            // Find the associated chat
            const chatsResponse = await ChatAPI.getUserChats(1, 50);
            const documentChat = chatsResponse.data.chats.find(
              (chat: any) =>
                chat.type === "document" && chat.sourceId?._id === documentId
            );

            if (documentChat) {
              Alert.alert(
                "Document Ready!",
                "Your document has been processed. Opening chat...",
                [{ text: "OK", onPress: () => handleOpenChat(documentChat.id) }]
              );
            }
          } else if (document.processingStatus === "failed") {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            Alert.alert(
              "Processing Failed",
              "Failed to process document. Please try again."
            );
          } else {
            // Increase poll interval for next check (exponential backoff)
            pollInterval = Math.min(pollInterval * 1.2, maxInterval);
            pollingIntervalRef.current = setTimeout(pollDocument, pollInterval);
          }
        } catch (error) {
          console.error("Polling error:", error);
          // Retry with increased interval
          pollInterval = Math.min(pollInterval * 1.5, maxInterval);
          pollingIntervalRef.current = setTimeout(pollDocument, pollInterval);
        }
      };

      pollingIntervalRef.current = setTimeout(pollDocument, pollInterval);
    },
    [handleOpenChat]
  );

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle upload document button press
  const handleUploadDocumentPress = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    documentUploadModalRef.current?.present();
  }, [isAuthenticated, openAuthModal]);

  // Handle generate course button press
  const handleGenerateCoursePress = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    router.push("/generate-course");
  }, [isAuthenticated, openAuthModal, router]);

  // Handle take quiz button press
  const handleTakeQuizPress = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    router.push("/generate-quiz");
  }, [isAuthenticated, openAuthModal, router]);

  // Handle view course
  const handleViewCourse = useCallback((courseId: string) => {
    router.push(`/course/${courseId}`);
  }, [router]);

  // Handle start quiz
  const handleStartQuiz = useCallback((quizId: string) => {
    router.push(`/quiz/${quizId}`);
  }, [router]);

  // Optimized message interaction handlers
  const handleMessagePress = useCallback(
    (content: string, index: number, role: "user" | "assistant") => {
      setSelectedMessageContent(content);
      setSelectedMessageIndex(index);
      setSelectedMessageRole(role);
      messageOptionsModalRef.current?.present();
    },
    []
  );

  const handleExpandToggle = useCallback((index: number) => {
    setExpandedUserMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        {!isFocusMode && (
          <Animated.View style={[styles.header, headerStyle]}>
            <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Synapse</Text>

            <TouchableOpacity onPress={openAuthModal}>
              <View style={styles.profileCircle}>
                {userProfilePicture ? (
                  <Image
                    source={{ uri: userProfilePicture }}
                    style={styles.profileImageHeader}
                  />
                ) : (
                  <View style={styles.profileInner}>
                    <Text style={styles.profileText}>
                      {(userName || "?").trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={
            isFocusMode ? styles.focusContent : styles.content
          }
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        >
          {isFocusMode ? (
            // Focus mode: show only the selected message in full-screen
            <View style={styles.focusContainer}>
              <TouchableOpacity
                style={styles.focusCloseButton}
                onPress={handleExitFocusMode}
              >
                <Text style={styles.focusCloseButtonText}>✕</Text>
              </TouchableOpacity>

              <View style={styles.focusHeader}>
                <Text style={styles.focusTitle}>Focus Mode</Text>
              </View>

              {selectedMessageIndex >= 0 && messages[selectedMessageIndex] && (
                <View
                  style={[
                    styles.focusMessageWrapper,
                    messages[selectedMessageIndex].role === "user"
                      ? styles.userMessageWrapper
                      : styles.assistantMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      styles.focusMessageBubble,
                      messages[selectedMessageIndex].role === "user"
                        ? styles.userMessage
                        : styles.assistantMessage,
                    ]}
                  >
                    {messages[selectedMessageIndex].role === "user" ? (
                      <Text
                        style={[
                          styles.messageText,
                          styles.userMessageText,
                          styles.focusMessageText,
                        ]}
                      >
                        {messages[selectedMessageIndex].content}
                      </Text>
                    ) : (
                      <Markdown
                        style={{
                          body: StyleSheet.flatten([
                            styles.messageText,
                            styles.assistantMessageText,
                            styles.focusMessageText,
                          ]),
                        }}
                      >
                        {messages[selectedMessageIndex].content}
                      </Markdown>
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : shouldShowHomepage ? (
            <>
              {/* Greeting Section */}
              <Animated.View style={titleStyle}>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.question}>Where should we start?</Text>
              </Animated.View>

              {/* Action Buttons */}
              <View style={styles.buttonsWrapper}>
                <AnimatedButton
                  delay={400}
                  icon="✍️"
                  onPress={handleUploadDocumentPress}
                >
                  Upload Document
                </AnimatedButton>
                <AnimatedButton
                  delay={500}
                  icon="🎓"
                  onPress={handleGenerateCoursePress}
                >
                  Generate a complete course
                </AnimatedButton>
                <AnimatedButton
                  delay={600}
                  icon="📝"
                  onPress={handleTakeQuizPress}
                >
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
                {memoizedMessages.map((message, index) => (
                  <MessageItem
                    key={`${index}-${message.content.slice(0, 20)}`}
                    message={message}
                    index={index}
                    expandedUserMessages={expandedUserMessages}
                    onMessagePress={handleMessagePress}
                    onExpandToggle={handleExpandToggle}
                    onViewCourse={handleViewCourse}
                    onStartQuiz={handleStartQuiz}
                  />
                ))}

                {/* Edit Mode UI */}
                {isEditingMessage && (
                  <View style={styles.editModeContainer}>
                    <View style={styles.editHeader}>
                      <Text style={styles.editHeaderText}>Edit Message</Text>
                    </View>
                    <TextInput
                      style={styles.editInput}
                      value={editedMessageContent}
                      onChangeText={setEditedMessageContent}
                      multiline
                      autoFocus
                      placeholder="Edit your message..."
                      placeholderTextColor="#666"
                    />
                    <View style={styles.editButtons}>
                      <TouchableOpacity
                        style={[styles.editButton, styles.cancelButton]}
                        onPress={handleCancelEdit}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, styles.saveButton]}
                        onPress={handleSubmitEdit}
                        disabled={isLoading || !editedMessageContent.trim()}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Loading Skeleton */}
                {isLoading && <ChatSkeleton />}
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Input Bar */}
        {!isFocusMode && (
          <View
            style={[
              styles.bottomBar,
              Platform.OS === "android" &&
              keyboardHeight > 0 && { marginBottom: keyboardHeight },
            ]}
          >
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
                    <Text style={styles.thinkingText}>Fast</Text>
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
        )}

        {/* Message Options Modal */}
        <MessageOptionsModal
          ref={messageOptionsModalRef}
          messageContent={selectedMessageContent}
          messageRole={selectedMessageRole}
          messageIndex={selectedMessageIndex}
          onEdit={handleEditMessage}
          onRegenerate={handleRegenerateResponse}
          onFocusView={handleEnterFocusMode}
        />

        {/* Document Upload Modal */}
        <DocumentUploadModal
          ref={documentUploadModalRef}
          onUploadSuccess={handleDocumentUpload}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
  profileImageHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 8,
  },
  greeting: {
    fontSize: 32,
    color: "#4285F4",
    fontFamily: "Outfit_500Medium",
    marginBottom: 8,
    paddingLeft: 10
  },
  question: {
    fontSize: 32,
    fontWeight: "400",
    color: "#C4C7C5",
    fontFamily: "Outfit_400Regular",
    lineHeight: 42,
    paddingLeft: 10
  },
  buttonsWrapper: {
    marginTop: 50,
    gap: 16,
    paddingLeft: 10,
    paddingRight: 25
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
    maxWidth: "90%",
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
  userMessageContent: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  editModeContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#4285F4",
  },
  editHeader: {
    marginBottom: 12,
  },
  editHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4285F4",
    fontFamily: "Outfit_600SemiBold",
  },
  editInput: {
    backgroundColor: "#f0f4f9",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "#1f1f1f",
    minHeight: 100,
    maxHeight: 200,
    textAlignVertical: "top",
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#4285F4",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Outfit_600SemiBold",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Outfit_600SemiBold",
  },
  focusContent: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: "#f8fafc",
  },
  focusContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    position: "relative",
  },
  focusCloseButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  focusCloseButtonText: {
    fontSize: 20,
    color: "#64748b",
    fontWeight: "600",
    lineHeight: 20,
  },
  focusHeader: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  focusTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: -0.5,
  },
  focusMessageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  focusMessageBubble: {
    maxWidth: "100%",
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 20,
    minHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  expandIconButton: {
    marginLeft: 6,
    marginTop: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  expandIconText: {
    color: "#fff",
    fontSize: 12,
  },
  focusMessageText: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  attachmentContainer: {
    marginTop: 12,
  },
});
