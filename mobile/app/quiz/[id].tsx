import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { QuizAPI } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

interface Question {
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  includesCalculation: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  status?: "generating" | "completed" | "failed";
  settings: {
    numberOfQuestions: number;
    difficulty: string;
    includeCalculations: boolean;
    timeLimit?: number;
  };
}

interface Answer {
  questionIndex: number;
  selectedOption: number;
  timeSpent: number;
}

export default function QuizAttemptPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { colors, isDark } = useTheme();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [, setIsSubmitting] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<number[][]>([]);

  const questionStartTime = useRef<number>(Date.now());
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressWidth = useSharedValue(0);
  const optionAnim0 = useSharedValue(0);
  const optionAnim1 = useSharedValue(0);
  const optionAnim2 = useSharedValue(0);
  const optionAnim3 = useSharedValue(0);

  // Helper function to shuffle array indices
  const shuffleOptions = useCallback((length: number): number[] => {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  const loadQuiz = useCallback(async () => {
    try {
      const response = await QuizAPI.getQuiz(id!);
      const quizData = response.data;
      setQuiz(quizData);

      // Initialize shuffled options for each question ONLY on first load
      if (quizData.questions && quizData.questions.length > 0) {
        const shuffled = quizData.questions.map((q: Question) =>
          shuffleOptions(q.options.length)
        );
        setShuffledOptions(shuffled);
      }

      // If quiz is still generating, start polling
      if (quizData.status === "generating") {
        setIsLoading(false);

        // Clear any existing interval
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }

        // Poll every 5 seconds
        pollingInterval.current = setInterval(async () => {
          try {
            const pollResponse = await QuizAPI.getQuiz(id!);
            const updatedQuiz = pollResponse.data;

            // Only update shuffled options for NEW questions that were just generated
            setQuiz((prevQuiz) => {
              if (prevQuiz && updatedQuiz.questions.length > prevQuiz.questions.length) {
                // New questions were added, shuffle only the new ones
                const newQuestionsCount = updatedQuiz.questions.length - prevQuiz.questions.length;
                const newShuffled = updatedQuiz.questions
                  .slice(-newQuestionsCount)
                  .map((q: Question) => shuffleOptions(q.options.length));

                setShuffledOptions((prev) => [...prev, ...newShuffled]);
              }
              return updatedQuiz;
            });

            // Stop polling when quiz is completed or failed
            if (updatedQuiz.status === "completed" || updatedQuiz.status === "failed") {
              if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
                pollingInterval.current = null;
              }

              // Show error if failed
              if (updatedQuiz.status === "failed") {
                Alert.alert(
                  "Generation Failed",
                  "Failed to generate quiz. Please try again.",
                  [{ text: "OK", onPress: () => router.back() }]
                );
              }
            }
          } catch (error) {
            console.error("Error polling quiz:", error);
          }
        }, 5000);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      Alert.alert("Error", "Failed to load quiz. Please try again.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setIsLoading(false);
    }
  }, [id, router, shuffleOptions]);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
      router.back();
      return;
    }

    loadQuiz();

    // Cleanup polling on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (quiz) {
      const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
      progressWidth.value = withTiming(progress, { duration: 300 });
    }
  }, [currentQuestionIndex, quiz, progressWidth]);

  useEffect(() => {
    // Reset option animations when question changes
    optionAnim0.value = withSpring(0);
    optionAnim1.value = withSpring(0);
    optionAnim2.value = withSpring(0);
    optionAnim3.value = withSpring(0);
    questionStartTime.current = Date.now();
    setSelectedOption(null);
    setShowExplanation(false);
  }, [currentQuestionIndex, optionAnim0, optionAnim1, optionAnim2, optionAnim3]);


  const handleSelectOption = useCallback((optionIndex: number) => {
    if (showExplanation) return;

    setSelectedOption(optionIndex);
    // Animate selected option
    const anims = [optionAnim0, optionAnim1, optionAnim2, optionAnim3];
    if (anims[optionIndex]) {
      anims[optionIndex].value = withSpring(1);
    }
  }, [showExplanation, optionAnim0, optionAnim1, optionAnim2, optionAnim3]);

  const handleConfirmAnswer = useCallback(() => {
    if (selectedOption === null || !quiz) return;

    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctOption;

    const newAnswer: Answer = {
      questionIndex: currentQuestionIndex,
      selectedOption,
      timeSpent,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setShowExplanation(true);
  }, [selectedOption, quiz, currentQuestionIndex]);

  const handleFinishQuiz = useCallback(async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    try {
      await QuizAPI.submitAttempt(quiz._id, answers);
      setQuizCompleted(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      Alert.alert("Error", "Failed to submit quiz results. Your progress has been saved locally.");
      setQuizCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, answers]);

  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishQuiz();
    }
  }, [currentQuestionIndex, quiz, handleFinishQuiz]);

  const handleRetakeQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setQuizCompleted(false);
    setSelectedOption(null);
    setShowExplanation(false);
    progressWidth.value = 0;

    // Re-shuffle options for each question
    if (quiz?.questions && quiz.questions.length > 0) {
      const shuffled = quiz.questions.map((q: Question) =>
        shuffleOptions(q.options.length)
      );
      setShuffledOptions(shuffled);
    }
  }, [progressWidth, quiz, shuffleOptions]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const getOptionStyle = (optionIndex: number) => {
    if (!showExplanation) {
      return selectedOption === optionIndex ? styles.optionSelected : styles.option;
    }

    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (!currentQuestion) return styles.option;

    if (optionIndex === currentQuestion.correctOption) {
      return [styles.option, styles.optionCorrect];
    }
    if (optionIndex === selectedOption && optionIndex !== currentQuestion.correctOption) {
      return [styles.option, styles.optionIncorrect];
    }
    return styles.option;
  };

  const getOptionTextStyle = (optionIndex: number) => {
    if (!showExplanation) {
      return selectedOption === optionIndex ? styles.optionTextSelected : styles.optionText;
    }

    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (!currentQuestion) return styles.optionText;

    if (optionIndex === currentQuestion.correctOption) {
      return [styles.optionText, styles.optionTextCorrect];
    }
    if (optionIndex === selectedOption && optionIndex !== currentQuestion.correctOption) {
      return [styles.optionText, styles.optionTextIncorrect];
    }
    return styles.optionText;
  };

  if (isLoading || (quiz?.status === "generating" && quiz.questions.length === 0)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {quiz?.status === "generating" ? "Generating quiz questions..." : "Loading quiz..."}
          </Text>
          {quiz?.status === "generating" && (
            <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
              {quiz.questions.length} / {quiz.settings.numberOfQuestions} questions generated
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz || quiz.status === "failed") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Quiz not found</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={[styles.resultsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.resultsBadge, isPassing ? styles.resultsBadgePass : styles.resultsBadgeFail]}>
              <Ionicons
                name={isPassing ? "checkmark-circle" : "close-circle"}
                size={64}
                color={isPassing ? "#34A853" : "#EA4335"}
              />
            </View>

            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              {isPassing ? "Congratulations!" : "Keep Practicing!"}
            </Text>

            <Text style={[styles.resultsSubtitle, { color: colors.textSecondary }]}>{quiz.title}</Text>

            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
              <Text style={[styles.scoreDivider, { color: colors.textSecondary }]}>/</Text>
              <Text style={[styles.scoreTotalText, { color: colors.textSecondary }]}>{quiz.questions.length}</Text>
            </View>

            <Text style={[styles.percentageText, { color: colors.text }]}>{percentage}%</Text>

            <View style={[styles.statsContainer, { backgroundColor: colors.inputBackground }]}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34A853" />
                <Text style={[styles.statValue, { color: colors.text }]}>{score}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Correct</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Ionicons name="close-circle" size={24} color="#EA4335" />
                <Text style={[styles.statValue, { color: colors.text }]}>{quiz.questions.length - score}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Incorrect</Text>
              </View>
            </View>

            <View style={styles.resultsButtons}>
              <TouchableOpacity style={[styles.retakeButton, { borderColor: colors.primary }]} onPress={handleRetakeQuiz}>
                <Ionicons name="refresh" size={20} color="#4285F4" />
                <Text style={styles.retakeButtonText}>Retake Quiz</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            Alert.alert(
              "Exit Quiz",
              "Are you sure you want to exit? Your progress will be lost.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Exit", style: "destructive", onPress: () => router.back() },
              ]
            );
          }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentQuestionIndex + 1} / {quiz.questions.length}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </Text>
          </View>

          <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.questionText}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {shuffledOptions[currentQuestionIndex]?.map((originalIndex, displayIndex) => {
            const option = currentQuestion.options[originalIndex];
            return (
              <TouchableOpacity
                key={displayIndex}
                style={getOptionStyle(originalIndex)}
                onPress={() => handleSelectOption(originalIndex)}
                disabled={showExplanation}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + displayIndex)}
                  </Text>
                </View>
                <Text style={getOptionTextStyle(originalIndex)}>{option}</Text>
                {showExplanation && originalIndex === currentQuestion.correctOption && (
                  <Ionicons name="checkmark-circle" size={24} color="#34A853" style={styles.optionIcon} />
                )}
                {showExplanation && originalIndex === selectedOption && originalIndex !== currentQuestion.correctOption && (
                  <Ionicons name="close-circle" size={24} color="#EA4335" style={styles.optionIcon} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {showExplanation && (
          <View style={[styles.explanationContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb" size={20} color="#FBBC04" />
              <Text style={[styles.explanationTitle, { color: colors.text }]}>Explanation</Text>
            </View>
            <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {!showExplanation ? (
          <TouchableOpacity
            style={[styles.confirmButton, selectedOption === null && styles.confirmButtonDisabled]}
            onPress={handleConfirmAnswer}
            disabled={selectedOption === null}
          >
            <Text style={styles.confirmButtonText}>Confirm Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontSize: 16, color: "#666", fontFamily: "Outfit_400Regular" },
  loadingSubtext: { fontSize: 14, color: "#999", fontFamily: "Outfit_400Regular", marginTop: 4 },
  backButtonLarge: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#4285F4", borderRadius: 20 },
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
  progressFill: { height: "100%", backgroundColor: "#4285F4", borderRadius: 4 },
  progressText: { marginTop: 4, fontSize: 13, color: "#666", fontFamily: "Outfit_500Medium" },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  questionContainer: { marginBottom: 24 },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    marginBottom: 16,
  },
  difficultyText: { fontSize: 12, color: "#4285F4", fontFamily: "Outfit_500Medium" },
  questionText: { fontSize: 20, color: "#1f1f1f", lineHeight: 28, fontFamily: "Outfit_500Medium" },
  optionsContainer: { gap: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  optionSelected: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#4285F4",
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
  },
  optionCorrect: { borderColor: "#34A853", backgroundColor: "#e6f4ea" },
  optionIncorrect: { borderColor: "#EA4335", backgroundColor: "#fce8e6" },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionLetterText: { fontSize: 14, fontWeight: "600", color: "#666" },
  optionText: { flex: 1, fontSize: 16, color: "#1f1f1f", fontFamily: "Outfit_400Regular" },
  optionTextSelected: { flex: 1, fontSize: 16, color: "#4285F4", fontFamily: "Outfit_500Medium" },
  optionTextCorrect: { color: "#34A853" },
  optionTextIncorrect: { color: "#EA4335" },
  optionIcon: { marginLeft: 8 },
  explanationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  explanationHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  explanationTitle: { fontSize: 16, fontWeight: "600", color: "#92400e", fontFamily: "Outfit_500Medium" },
  explanationText: { fontSize: 15, color: "#78350f", lineHeight: 22, fontFamily: "Outfit_400Regular" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  confirmButtonDisabled: { backgroundColor: "#ccc" },
  confirmButtonText: { color: "#fff", fontSize: 17, fontFamily: "Outfit_500Medium" },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#34A853",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: { color: "#fff", fontSize: 17, fontFamily: "Outfit_500Medium" },
  resultsContainer: { flexGrow: 1, padding: 20, justifyContent: "center" },
  resultsCard: { backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  resultsBadge: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  resultsBadgePass: { backgroundColor: "#e6f4ea" },
  resultsBadgeFail: { backgroundColor: "#fce8e6" },
  resultsTitle: { fontSize: 28, fontWeight: "700", color: "#1f1f1f", marginBottom: 8, fontFamily: "Outfit_500Medium" },
  resultsSubtitle: { fontSize: 16, color: "#666", marginBottom: 24, textAlign: "center", fontFamily: "Outfit_400Regular" },
  scoreContainer: { flexDirection: "row", alignItems: "baseline", marginBottom: 8 },
  scoreText: { fontSize: 64, fontWeight: "700", color: "#4285F4" },
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
    borderColor: "#4285F4",
    borderRadius: 28,
  },
  retakeButtonText: { color: "#4285F4", fontSize: 17, fontFamily: "Outfit_500Medium" },
  doneButton: { backgroundColor: "#4285F4", paddingVertical: 16, borderRadius: 28, alignItems: "center" },
  doneButtonText: { color: "#fff", fontSize: 17, fontFamily: "Outfit_500Medium" },
});
