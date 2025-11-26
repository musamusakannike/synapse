import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import * as Clipboard from "expo-clipboard";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";
export default function FocusModePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const content = params.content as string || "";
  const role = params.role as "user" | "assistant" || "assistant";
  
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const showControlsRef = useRef(true);
  const [, forceUpdate] = useState(0);
  
  const controlsOpacity = useSharedValue(1);
  const timerRef = useRef<number | null>(null);
  const badgeScale = useSharedValue(1);

  // Memoize word count and read time to avoid recalculating on every render
  const { wordCount, readTime } = useMemo(() => {
    const words = content.split(/\s+/).filter(Boolean);
    return {
      wordCount: words.length,
      readTime: Math.ceil(words.length / 200),
    };
  }, [content]);

  useEffect(() => {
    // Auto-hide controls after 5 seconds - only run once on mount
    timerRef.current = setTimeout(() => {
      if (showControlsRef.current) {
        controlsOpacity.value = withTiming(0, { duration: 150 });
        showControlsRef.current = false;
        forceUpdate(n => n + 1);
      }
    }, 5000);

    // Animate badge to indicate it's clickable
    badgeScale.value = withSequence(
      withSpring(1.1, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleControls = useCallback(() => {
    if (showControlsRef.current) {
      controlsOpacity.value = withTiming(0, { duration: 100 });
      showControlsRef.current = false;
    } else {
      showControlsRef.current = true;
      controlsOpacity.value = withTiming(1, { duration: 100 });
    }
    forceUpdate(n => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleIncreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 2, 32));
  }, []);

  const handleDecreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleCopyContent = useCallback(async () => {
    await Clipboard.setStringAsync(content);
  }, [content]);

  const handleShareContent = useCallback(async () => {
    try {
      await Share.share({
        message: content,
        title: "Shared from Synapse",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  }, [content]);

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
    pointerEvents: controlsOpacity.value > 0.5 ? "auto" : "none",
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const theme = useMemo(() => isDarkMode
    ? {
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f1f5f9",
        textSecondary: "#94a3b8",
        accent: "#4285F4",
        border: "#334155",
      }
    : {
        background: "#f8fafc",
        surface: "#ffffff",
        text: "#1e293b",
        textSecondary: "#64748b",
        accent: "#4285F4",
        border: "#e2e8f0",
      }, [isDarkMode]);

  const markdownStyles = useMemo(() => ({
    body: {
      color: theme.text,
      fontSize: fontSize,
      lineHeight: fontSize * 1.7,
      fontFamily: "Outfit_400Regular",
    },
    heading1: {
      color: theme.text,
      fontSize: fontSize + 10,
      fontWeight: "700" as const,
      marginBottom: 16,
      marginTop: 24,
      fontFamily: "Outfit_600SemiBold",
    },
    heading2: {
      color: theme.text,
      fontSize: fontSize + 6,
      fontWeight: "600" as const,
      marginBottom: 12,
      marginTop: 20,
      fontFamily: "Outfit_600SemiBold",
    },
    heading3: {
      color: theme.text,
      fontSize: fontSize + 4,
      fontWeight: "600" as const,
      marginBottom: 10,
      marginTop: 16,
      fontFamily: "Outfit_500Medium",
    },
    paragraph: {
      marginBottom: 16,
      color: theme.text,
    },
    code_inline: {
      backgroundColor: theme.surface,
      color: theme.accent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: fontSize - 2,
      fontFamily: "monospace",
    },
    code_block: {
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 12,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    fence: {
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 12,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    blockquote: {
      backgroundColor: theme.surface,
      borderLeftWidth: 4,
      borderLeftColor: theme.accent,
      paddingLeft: 16,
      paddingVertical: 8,
      marginVertical: 12,
      borderRadius: 4,
    },
    list_item: {
      marginBottom: 8,
    },
    bullet_list: {
      marginBottom: 16,
    },
    ordered_list: {
      marginBottom: 16,
    },
    link: {
      color: theme.accent,
      textDecorationLine: "underline" as const,
    },
    strong: {
      fontWeight: "700" as const,
      color: theme.text,
    },
    em: {
      fontStyle: "italic" as const,
      color: theme.text,
    },
  }), [theme, fontSize]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      {/* Tap area to toggle controls */}
      <View style={styles.tapArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Focus Mode Header */}
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.focusHeader}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleControls}
            >
              <Animated.View 
                style={[
                  styles.focusBadge, 
                  { backgroundColor: theme.accent },
                  badgeAnimatedStyle
                ]}
              >
                <Ionicons name="eye" size={14} color="#fff" />
                <Text style={styles.focusBadgeText}>Focus Mode</Text>
              </Animated.View>
            </TouchableOpacity>
            <Text style={[styles.roleLabel, { color: theme.textSecondary }]}>
              {role === "user" ? "Your Message" : "AI Response"}
            </Text>
          </Animated.View>

          {/* Content */}
          <Animated.View
            entering={SlideInUp.duration(200).delay(50)}
            style={[
              styles.contentCard,
              {
                backgroundColor: "transparent",
                borderColor: theme.border,
              },
            ]}
          >
            {role === "user" ? (
              <Text
                style={[
                  styles.userText,
                  {
                    color: theme.text,
                    fontSize: fontSize,
                    lineHeight: fontSize * 1.7,
                  },
                ]}
              >
                {content}
              </Text>
            ) : (
              <Markdown style={markdownStyles}>{content}</Markdown>
            )}
          </Animated.View>

          {/* Reading Stats */}
          <Animated.View
            entering={FadeIn.duration(200).delay(100)}
            style={styles.statsContainer}
          >
            <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
              <Ionicons name="text" size={16} color={theme.textSecondary} />
              <Text style={[styles.statText, { color: theme.textSecondary }]}>
                {wordCount} words
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
              <Ionicons name="time" size={16} color={theme.textSecondary} />
              <Text style={[styles.statText, { color: theme.textSecondary }]}>
                ~{readTime} min read
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>

      {/* Top Controls */}
      <Animated.View style={[styles.topControls, controlsStyle]}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.surface }]}
          onPress={handleClose}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.topRightControls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.surface }]}
            onPress={handleToggleTheme}
          >
            <Ionicons
              name={isDarkMode ? "sunny" : "moon"}
              size={20}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        style={[
          styles.bottomControls,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
          controlsStyle,
        ]}
      >
        {/* Font Size Controls */}
        <View style={styles.fontControls}>
          <TouchableOpacity
            style={[styles.fontButton, { borderColor: theme.border }]}
            onPress={handleDecreaseFontSize}
          >
            <Ionicons name="remove" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.fontSizeText, { color: theme.text }]}>
            {fontSize}px
          </Text>
          <TouchableOpacity
            style={[styles.fontButton, { borderColor: theme.border }]}
            onPress={handleIncreaseFontSize}
          >
            <Ionicons name="add" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.background }]}
            onPress={handleCopyContent}
          >
            <Ionicons name="copy-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={handleShareContent}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tapArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 120,
  },
  focusHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  focusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  focusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Outfit_600SemiBold",
  },
  roleLabel: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  contentCard: {
    borderRadius: 20,
    padding: 24,
  },
  userText: {
    fontFamily: "Outfit_400Regular",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  topControls: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topRightControls: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  fontControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fontButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fontSizeText: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
    minWidth: 45,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
