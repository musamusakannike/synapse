import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { FlashcardAPI } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Flashcard {
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
}

interface FlashcardSet {
  _id: string;
  title: string;
  description?: string;
  flashcards: Flashcard[];
  studyStats?: {
    totalStudySessions: number;
    averageScore: number;
    lastStudied?: string;
  };
}

export default function FlashcardStudyPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [studyCompleted, setStudyCompleted] = useState(false);

  const sessionStartTime = useRef<number>(Date.now());
  const flipRotation = useSharedValue(0);
  const cardTranslateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  const loadFlashcardSet = useCallback(async () => {
    try {
      const response = await FlashcardAPI.getFlashcardSet(id!);
      setFlashcardSet(response.data.flashcardSet);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading flashcard set:", error);
      Alert.alert("Error", "Failed to load flashcards. Please try again.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
      router.back();
      return;
    }

    loadFlashcardSet();
  }, [id, isAuthenticated, loadFlashcardSet, openAuthModal, router]);

  useEffect(() => {
    if (flashcardSet) {
      const progress = ((currentIndex + 1) / flashcardSet.flashcards.length) * 100;
      progressWidth.value = withTiming(progress, { duration: 300 });
    }
  }, [currentIndex, flashcardSet, progressWidth]);

  const handleFlipCard = useCallback(() => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    flipRotation.value = withSpring(newFlipped ? 180 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, [isFlipped, flipRotation]);

  const goToNextCard = useCallback(() => {
    if (!flashcardSet) return;

    if (currentIndex < flashcardSet.flashcards.length - 1) {
      cardOpacity.value = withTiming(0, { duration: 150 }, () => {
        runOnJS(setCurrentIndex)(currentIndex + 1);
        runOnJS(setIsFlipped)(false);
        flipRotation.value = 0;
        cardOpacity.value = withTiming(1, { duration: 150 });
      });
    } else {
      setStudyCompleted(true);
    }
  }, [currentIndex, flashcardSet, cardOpacity, flipRotation]);

  const goToPrevCard = useCallback(() => {
    if (currentIndex > 0) {
      cardOpacity.value = withTiming(0, { duration: 150 }, () => {
        runOnJS(setCurrentIndex)(currentIndex - 1);
        runOnJS(setIsFlipped)(false);
        flipRotation.value = 0;
        cardOpacity.value = withTiming(1, { duration: 150 });
      });
    }
  }, [currentIndex, cardOpacity, flipRotation]);

  const markAsKnown = useCallback(() => {
    setKnownCards((prev) => new Set(prev).add(currentIndex));
    goToNextCard();
  }, [currentIndex, goToNextCard]);

  const markAsUnknown = useCallback(() => {
    setKnownCards((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentIndex);
      return newSet;
    });
    goToNextCard();
  }, [currentIndex, goToNextCard]);

  const handleFinishStudy = useCallback(async () => {
    if (!flashcardSet) return;

    const sessionDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
    const score = (knownCards.size / flashcardSet.flashcards.length) * 100;

    try {
      await FlashcardAPI.updateStudyStats(flashcardSet._id, {
        score,
        sessionDuration,
      });
    } catch (error) {
      console.error("Error updating study stats:", error);
    }

    router.back();
  }, [flashcardSet, knownCards, router]);

  const handleRestartStudy = useCallback(() => {
    setCurrentIndex(0);
    setKnownCards(new Set());
    setStudyCompleted(false);
    setIsFlipped(false);
    flipRotation.value = 0;
    progressWidth.value = 0;
    sessionStartTime.current = Date.now();
  }, [flipRotation, progressWidth]);

  // Swipe gesture for card navigation
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      cardTranslateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > 100) {
        // Swipe right - mark as known
        cardTranslateX.value = withSpring(SCREEN_WIDTH, {}, () => {
          cardTranslateX.value = 0;
          runOnJS(markAsKnown)();
        });
      } else if (event.translationX < -100) {
        // Swipe left - mark as unknown
        cardTranslateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
          cardTranslateX.value = 0;
          runOnJS(markAsUnknown)();
        });
      } else {
        cardTranslateX.value = withSpring(0);
      }
    });

  // Tap gesture for flipping
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleFlipCard)();
  });

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipRotation.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { translateX: cardTranslateX.value },
      ],
      opacity: cardOpacity.value,
      backfaceVisibility: "hidden" as const,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipRotation.value,
      [0, 180],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { translateX: cardTranslateX.value },
      ],
      opacity: cardOpacity.value,
      backfaceVisibility: "hidden" as const,
    };
  });

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#34A853";
      case "medium":
        return "#FBBC04";
      case "hard":
        return "#EA4335";
      default:
        return "#9C27B0";
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!flashcardSet || flashcardSet.flashcards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#999" />
          <Text style={styles.loadingText}>No flashcards found</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (studyCompleted) {
    const score = Math.round((knownCards.size / flashcardSet.flashcards.length) * 100);
    const isPassing = score >= 70;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.resultsContainer}>
          <View style={styles.resultsCard}>
            <View style={[styles.resultsBadge, isPassing ? styles.resultsBadgePass : styles.resultsBadgeFail]}>
              <Ionicons
                name={isPassing ? "checkmark-circle" : "refresh-circle"}
                size={64}
                color={isPassing ? "#34A853" : "#FBBC04"}
              />
            </View>

            <Text style={styles.resultsTitle}>
              {isPassing ? "Great Job!" : "Keep Practicing!"}
            </Text>

            <Text style={styles.resultsSubtitle}>{flashcardSet.title}</Text>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{knownCards.size}</Text>
              <Text style={styles.scoreDivider}>/</Text>
              <Text style={styles.scoreTotalText}>{flashcardSet.flashcards.length}</Text>
            </View>

            <Text style={styles.percentageText}>{score}% Mastered</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34A853" />
                <Text style={styles.statValue}>{knownCards.size}</Text>
                <Text style={styles.statLabel}>Known</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="help-circle" size={24} color="#FBBC04" />
                <Text style={styles.statValue}>{flashcardSet.flashcards.length - knownCards.size}</Text>
                <Text style={styles.statLabel}>Review</Text>
              </View>
            </View>

            <View style={styles.resultsButtons}>
              <TouchableOpacity style={styles.retakeButton} onPress={handleRestartStudy}>
                <Ionicons name="refresh" size={20} color="#9C27B0" />
                <Text style={styles.retakeButtonText}>Study Again</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.doneButton} onPress={handleFinishStudy}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentCard = flashcardSet.flashcards[currentIndex];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Alert.alert(
                "Exit Study Session",
                "Are you sure you want to exit? Your progress will be saved.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Exit", onPress: handleFinishStudy },
                ]
              );
            }}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {flashcardSet.flashcards.length}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Card Title */}
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{flashcardSet.title}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(currentCard.difficulty) + "20" },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(currentCard.difficulty) },
              ]}
            >
              {currentCard.difficulty.charAt(0).toUpperCase() + currentCard.difficulty.slice(1)}
            </Text>
          </View>
        </View>

        {/* Flashcard */}
        <View style={styles.cardContainer}>
          <GestureDetector gesture={combinedGesture}>
            <View style={styles.cardWrapper}>
              {/* Front of card */}
              <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                <Text style={styles.cardLabel}>Question</Text>
                <Text style={styles.cardText}>{currentCard.front}</Text>
                <Text style={styles.tapHint}>Tap to flip</Text>
              </Animated.View>

              {/* Back of card */}
              <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                <Text style={styles.cardLabel}>Answer</Text>
                <Text style={styles.cardText}>{currentCard.back}</Text>
                <Text style={styles.tapHint}>Tap to flip back</Text>
              </Animated.View>
            </View>
          </GestureDetector>
        </View>

        {/* Swipe hints */}
        <View style={styles.swipeHints}>
          <View style={styles.swipeHint}>
            <Ionicons name="arrow-back" size={20} color="#EA4335" />
            <Text style={styles.swipeHintText}>Still Learning</Text>
          </View>
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>Got It!</Text>
            <Ionicons name="arrow-forward" size={20} color="#34A853" />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.unknownButton]}
            onPress={markAsUnknown}
          >
            <Ionicons name="close" size={28} color="#EA4335" />
            <Text style={styles.unknownButtonText}>Still Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.knownButton]}
            onPress={markAsKnown}
          >
            <Ionicons name="checkmark" size={28} color="#34A853" />
            <Text style={styles.knownButtonText}>Got It!</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrevCard}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? "#ccc" : "#666"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.flipButton} onPress={handleFlipCard}>
            <Ionicons name="sync" size={20} color="#9C27B0" />
            <Text style={styles.flipButtonText}>Flip Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentIndex === flashcardSet.flashcards.length - 1 && styles.navButtonDisabled]}
            onPress={goToNextCard}
            disabled={currentIndex === flashcardSet.flashcards.length - 1}
          >
            <Ionicons name="chevron-forward" size={24} color={currentIndex === flashcardSet.flashcards.length - 1 ? "#ccc" : "#666"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontSize: 16, color: "#666", fontFamily: "Outfit_400Regular" },
  backButtonLarge: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#9C27B0", borderRadius: 20 },
  backButtonText: { color: "#fff", fontSize: 16, fontFamily: "Outfit_500Medium" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  progressContainer: { flex: 1, alignItems: "center", paddingHorizontal: 16 },
  progressBar: { width: "100%", height: 8, backgroundColor: "#e0e0e0", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#9C27B0", borderRadius: 4 },
  progressText: { marginTop: 4, fontSize: 13, color: "#666", fontFamily: "Outfit_500Medium" },
  headerSpacer: { width: 40 },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#1f1f1f", flex: 1, fontFamily: "Outfit_500Medium" },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: { fontSize: 12, fontWeight: "600", fontFamily: "Outfit_500Medium" },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardFront: {
    backgroundColor: "#f5f0ff",
    borderWidth: 2,
    borderColor: "#e0d4ff",
  },
  cardBack: {
    backgroundColor: "#e8f5e9",
    borderWidth: 2,
    borderColor: "#c8e6c9",
  },
  cardLabel: {
    position: "absolute",
    top: 16,
    left: 16,
    fontSize: 12,
    color: "#666",
    fontFamily: "Outfit_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 20,
    color: "#1f1f1f",
    textAlign: "center",
    lineHeight: 28,
    fontFamily: "Outfit_400Regular",
  },
  tapHint: {
    position: "absolute",
    bottom: 16,
    fontSize: 12,
    color: "#999",
    fontFamily: "Outfit_400Regular",
  },
  swipeHints: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingVertical: 8,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  swipeHintText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Outfit_400Regular",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 2,
  },
  unknownButton: {
    borderColor: "#EA4335",
    backgroundColor: "#fce8e6",
  },
  unknownButtonText: {
    color: "#EA4335",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  knownButton: {
    borderColor: "#34A853",
    backgroundColor: "#e6f4ea",
  },
  knownButtonText: {
    color: "#34A853",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#fafafa",
  },
  flipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f5f0ff",
    borderWidth: 1,
    borderColor: "#e0d4ff",
  },
  flipButtonText: {
    color: "#9C27B0",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  resultsContainer: { flex: 1, padding: 20, justifyContent: "center" },
  resultsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultsBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  resultsBadgePass: { backgroundColor: "#e6f4ea" },
  resultsBadgeFail: { backgroundColor: "#fff8e1" },
  resultsTitle: { fontSize: 28, fontWeight: "700", color: "#1f1f1f", marginBottom: 8, fontFamily: "Outfit_500Medium" },
  resultsSubtitle: { fontSize: 16, color: "#666", marginBottom: 24, textAlign: "center", fontFamily: "Outfit_400Regular" },
  scoreContainer: { flexDirection: "row", alignItems: "baseline", marginBottom: 8 },
  scoreText: { fontSize: 64, fontWeight: "700", color: "#9C27B0" },
  scoreDivider: { fontSize: 48, color: "#ccc", marginHorizontal: 4 },
  scoreTotalText: { fontSize: 32, fontWeight: "600", color: "#999" },
  percentageText: { fontSize: 24, color: "#666", marginBottom: 32, fontFamily: "Outfit_500Medium" },
  statsContainer: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  statItem: { alignItems: "center", paddingHorizontal: 24 },
  statValue: { fontSize: 24, fontWeight: "700", color: "#1f1f1f", marginTop: 4 },
  statLabel: { fontSize: 14, color: "#666", fontFamily: "Outfit_400Regular" },
  statDivider: { width: 1, height: 48, backgroundColor: "#e0e0e0" },
  resultsButtons: { width: "100%", gap: 12 },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#9C27B0",
    borderRadius: 28,
  },
  retakeButtonText: { color: "#9C27B0", fontSize: 17, fontFamily: "Outfit_500Medium" },
  doneButton: { backgroundColor: "#9C27B0", paddingVertical: 16, borderRadius: 28, alignItems: "center" },
  doneButtonText: { color: "#fff", fontSize: 17, fontFamily: "Outfit_500Medium" },
});
