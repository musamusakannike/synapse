import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import { CourseAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export interface CourseGenerationData {
  title: string;
  description?: string;
  settings: {
    level: "beginner" | "intermediate" | "advanced";
    includeExamples: boolean;
    includePracticeQuestions: boolean;
    detailLevel: "basic" | "moderate" | "comprehensive";
  };
}

export default function GenerateCoursePage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { colors, isDark } = useTheme();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includePracticeQuestions, setIncludePracticeQuestions] = useState(false);
  const [detailLevel, setDetailLevel] = useState<"basic" | "moderate" | "comprehensive">("moderate");
  const [isGenerating, setIsGenerating] = useState(false);

  const headerOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
      router.back();
      return;
    }

    // Animate elements in
    headerOpacity.value = withSpring(1, { duration: 800 });
    titleOpacity.value = withDelay(200, withSpring(1, { duration: 800 }));
    formOpacity.value = withDelay(400, withSpring(1, { duration: 800 }));
  }, [isAuthenticated, headerOpacity, titleOpacity, formOpacity, openAuthModal, router]);

  const handleGenerateCourse = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter a course title");
      return;
    }

    setIsGenerating(true);
    buttonScale.value = withSpring(0.95);

    try {
      const courseData: CourseGenerationData = {
        title: title.trim(),
        description: description.trim() || undefined,
        settings: {
          level,
          includeExamples,
          includePracticeQuestions,
          detailLevel,
        },
      };

      const response = await CourseAPI.createCourse(courseData);
      const course = response.data;
      
      // Navigate to course progress page
      router.push(`/course-progress/${course._id}`);
    } catch (error) {
      console.error("Course generation error:", error);
      Alert.alert("Error", "Failed to generate course. Please try again.");
      buttonScale.value = withSpring(1);
      setIsGenerating(false);
    }
  }, [
    title,
    description,
    level,
    includeExamples,
    includePracticeQuestions,
    detailLevel,
    buttonScale,
    router,
  ]);

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

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const LevelOption = ({ 
    value, 
    label, 
    description 
  }: { 
    value: "beginner" | "intermediate" | "advanced"; 
    label: string; 
    description: string; 
  }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        { borderColor: colors.border, backgroundColor: colors.inputBackground },
        level === value && [styles.optionButtonSelected, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(66, 133, 244, 0.15)' : '#f0f4ff' }],
      ]}
      onPress={() => setLevel(value)}
    >
      <Text
        style={[
          styles.optionLabel,
          { color: colors.text },
          level === value && styles.optionLabelSelected,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.optionDescription,
          { color: colors.textSecondary },
          level === value && styles.optionDescriptionSelected,
        ]}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );

  const DetailLevelOption = ({ 
    value, 
    label, 
    description 
  }: { 
    value: "basic" | "moderate" | "comprehensive"; 
    label: string; 
    description: string; 
  }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        { borderColor: colors.border, backgroundColor: colors.inputBackground },
        detailLevel === value && [styles.optionButtonSelected, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(66, 133, 244, 0.15)' : '#f0f4ff' }],
      ]}
      onPress={() => setDetailLevel(value)}
    >
      <Text
        style={[
          styles.optionLabel,
          { color: colors.text },
          detailLevel === value && styles.optionLabelSelected,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.optionDescription,
          { color: colors.textSecondary },
          detailLevel === value && styles.optionDescriptionSelected,
        ]}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );

  const ToggleOption = ({
    label,
    description,
    value,
    onToggle,
  }: {
    label: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity style={[styles.toggleOption, { borderColor: colors.border, backgroundColor: colors.inputBackground }]} onPress={onToggle}>
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <View style={[styles.toggle, { backgroundColor: colors.border }, value && styles.toggleActive]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Generate Course</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Section */}
          <Animated.View style={titleStyle}>
            <Text style={styles.greeting}>Create Your Course</Text>
            <Text style={[styles.question, { color: colors.textSecondary }]}>Let&apos;s build something amazing together</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, formStyle]}>
            {/* Course Title */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Title *</Text>
              <TextInput
                style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                placeholder="e.g., Introduction to Machine Learning"
                placeholderTextColor={colors.placeholder}
                value={title}
                onChangeText={setTitle}
                editable={!isGenerating}
                maxLength={100}
              />
            </View>

            {/* Course Description */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                placeholder="Provide additional context about what this course should cover..."
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isGenerating}
                maxLength={500}
              />
            </View>

            {/* Difficulty Level */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulty Level</Text>
              <View style={styles.optionsContainer}>
                <LevelOption
                  value="beginner"
                  label="Beginner"
                  description="Basic concepts and fundamentals"
                />
                <LevelOption
                  value="intermediate"
                  label="Intermediate"
                  description="Moderate complexity with practical examples"
                />
                <LevelOption
                  value="advanced"
                  label="Advanced"
                  description="In-depth analysis and complex topics"
                />
              </View>
            </View>

            {/* Detail Level */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Content Detail Level</Text>
              <View style={styles.optionsContainer}>
                <DetailLevelOption
                  value="basic"
                  label="Basic"
                  description="Concise explanations and key points"
                />
                <DetailLevelOption
                  value="moderate"
                  label="Moderate"
                  description="Balanced depth with good coverage"
                />
                <DetailLevelOption
                  value="comprehensive"
                  label="Comprehensive"
                  description="Detailed explanations and extensive coverage"
                />
              </View>
            </View>

            {/* Additional Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Features</Text>
              <View style={styles.toggleContainer}>
                <ToggleOption
                  label="Include Examples"
                  description="Add practical examples and use cases"
                  value={includeExamples}
                  onToggle={() => setIncludeExamples(!includeExamples)}
                />
                <ToggleOption
                  label="Practice Questions"
                  description="Include questions for self-assessment"
                  value={includePracticeQuestions}
                  onToggle={() => setIncludePracticeQuestions(!includePracticeQuestions)}
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Generate Button */}
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[
                styles.generateButton,
                (!title.trim() || isGenerating) && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerateCourse}
              disabled={!title.trim() || isGenerating}
            >
              <Text style={styles.generateButtonText}>
                {isGenerating ? "🎓 Generating Course..." : "🎓 Generate Course"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    color: "#000",
    fontFamily: "Outfit_500Medium",
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 8,
    paddingBottom: 120,
  },
  greeting: {
    fontSize: 32,
    color: "#4285F4",
    fontFamily: "Outfit_500Medium",
    marginBottom: 8,
    paddingLeft: 10,
    marginTop: 20,
  },
  question: {
    fontSize: 32,
    fontWeight: "400",
    color: "#C4C7C5",
    fontFamily: "Outfit_400Regular",
    lineHeight: 42,
    paddingLeft: 10,
  },
  form: {
    marginTop: 40,
    paddingHorizontal: 10,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 12,
    fontFamily: "Outfit_500Medium",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1f1f1f",
    backgroundColor: "#fafafa",
    fontFamily: "Outfit_400Regular",
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fafafa",
  },
  optionButtonSelected: {
    borderColor: "#4285F4",
    backgroundColor: "#f0f4ff",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 4,
    fontFamily: "Outfit_500Medium",
  },
  optionLabelSelected: {
    color: "#4285F4",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: "Outfit_400Regular",
  },
  optionDescriptionSelected: {
    color: "#4285F4",
  },
  toggleContainer: {
    gap: 16,
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 4,
    fontFamily: "Outfit_500Medium",
  },
  toggleDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: "Outfit_400Regular",
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0e0e0",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#4285F4",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  generateButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonDisabled: {
    backgroundColor: "#ccc",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Outfit_400Regular",
  },
});
