import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height: screenHeight } = Dimensions.get("window");

export interface CourseGenerationModalRef {
  present: () => void;
  dismiss: () => void;
}

interface CourseGenerationModalProps {
  onCourseGenerate: (courseData: CourseGenerationData) => void;
}

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

const CourseGenerationModal = forwardRef<
  CourseGenerationModalRef,
  CourseGenerationModalProps
>(({ onCourseGenerate }, ref) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includePracticeQuestions, setIncludePracticeQuestions] = useState(false);
  const [detailLevel, setDetailLevel] = useState<"basic" | "moderate" | "comprehensive">("moderate");
  const [isGenerating, setIsGenerating] = useState(false);

  const buttonScale = useSharedValue(1);
  const formOpacity = useSharedValue(1);

  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setLevel("intermediate");
    setIncludeExamples(true);
    setIncludePracticeQuestions(false);
    setDetailLevel("moderate");
    setIsGenerating(false);
    formOpacity.value = 1;
  }, [formOpacity]);

  const handleDismiss = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const handleGenerateCourse = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter a course title");
      return;
    }

    setIsGenerating(true);
    buttonScale.value = withSpring(0.95);
    formOpacity.value = withTiming(0.7);

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

      await onCourseGenerate(courseData);
      bottomSheetModalRef.current?.dismiss();
      resetForm();
    } catch (error) {
      console.error("Course generation error:", error);
      Alert.alert("Error", "Failed to generate course. Please try again.");
    } finally {
      setIsGenerating(false);
      buttonScale.value = withSpring(1);
      formOpacity.value = withTiming(1);
    }
  }, [
    title,
    description,
    level,
    includeExamples,
    includePracticeQuestions,
    detailLevel,
    onCourseGenerate,
    buttonScale,
    formOpacity,
    resetForm,
  ]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
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
        level === value && styles.optionButtonSelected,
      ]}
      onPress={() => setLevel(value)}
    >
      <Text
        style={[
          styles.optionLabel,
          level === value && styles.optionLabelSelected,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.optionDescription,
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
        detailLevel === value && styles.optionButtonSelected,
      ]}
      onPress={() => setDetailLevel(value)}
    >
      <Text
        style={[
          styles.optionLabel,
          detailLevel === value && styles.optionLabelSelected,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.optionDescription,
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
    <TouchableOpacity style={styles.toggleOption} onPress={onToggle}>
      <View style={styles.toggleContent}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={["90%"]}
      onDismiss={handleDismiss}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Generate Complete Course</Text>
          <Text style={styles.subtitle}>
            Create a comprehensive course with AI-generated content
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.form, formAnimatedStyle]}>
            {/* Course Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Introduction to Machine Learning"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                editable={!isGenerating}
                maxLength={100}
              />
            </View>

            {/* Course Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Provide additional context about what this course should cover..."
                placeholderTextColor="#999"
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
              <Text style={styles.sectionTitle}>Difficulty Level</Text>
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
              <Text style={styles.sectionTitle}>Content Detail Level</Text>
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
              <Text style={styles.sectionTitle}>Additional Features</Text>
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
        <View style={styles.footer}>
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
                {isGenerating ? "Generating Course..." : "🎓 Generate Course"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CourseGenerationModal.displayName = "CourseGenerationModal";

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: "#ddd",
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  form: {
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 12,
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
  },
  optionLabelSelected: {
    color: "#4285F4",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
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
  },
  toggleDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
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
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  generateButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonDisabled: {
    backgroundColor: "#ccc",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CourseGenerationModal;
