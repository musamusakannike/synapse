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
  ActivityIndicator,
  Modal,
  FlatList,
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
import { QuizAPI, DocumentAPI, CourseAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import * as DocumentPicker from "expo-document-picker";

interface DocumentItem {
  _id: string;
  originalName: string;
  createdAt: string;
  processingStatus: string;
}

interface CourseItem {
  _id: string;
  title: string;
  createdAt: string;
  status: string;
}

type SourceItem = DocumentItem | CourseItem;

type SourceType = "topic" | "document" | "course";

export default function GenerateQuizPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("topic");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedSourceName, setSelectedSourceName] = useState<string>("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [includeCalculations, setIncludeCalculations] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Source selection modal
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

    headerOpacity.value = withSpring(1, { duration: 800 });
    titleOpacity.value = withDelay(200, withSpring(1, { duration: 800 }));
    formOpacity.value = withDelay(400, withSpring(1, { duration: 800 }));
  }, [isAuthenticated, headerOpacity, titleOpacity, formOpacity, openAuthModal, router]);

  const loadSources = useCallback(async () => {
    setIsLoadingSources(true);
    try {
      const [docsResponse, coursesResponse] = await Promise.all([
        DocumentAPI.listDocuments(),
        CourseAPI.listCourses(),
      ]);
      setDocuments(docsResponse.data.filter((d: DocumentItem) => d.processingStatus === "completed"));
      setCourses(coursesResponse.data.filter((c: CourseItem) => c.status === "completed"));
    } catch (error) {
      console.error("Error loading sources:", error);
    } finally {
      setIsLoadingSources(false);
    }
  }, []);

  const handleOpenSourceModal = useCallback(() => {
    loadSources();
    setShowSourceModal(true);
  }, [loadSources]);

  const handleSelectSource = useCallback((id: string, name: string, type: SourceType) => {
    setSelectedSourceId(id);
    setSelectedSourceName(name);
    setSourceType(type);
    setShowSourceModal(false);
  }, []);

  const handleUploadDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);

      // const response = await DocumentAPI.uploadDocument(formData);
      // const doc = response.data.document;

      Alert.alert(
        "Document Uploaded",
        "Your document is being processed. It will be available for quiz generation once processing is complete.",
        [{ text: "OK" }]
      );

      // Refresh the sources list
      loadSources();
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", "Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [loadSources]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter a quiz title");
      return;
    }

    if (sourceType !== "topic" && !selectedSourceId) {
      Alert.alert("Required Field", "Please select a document or course");
      return;
    }

    setIsGenerating(true);
    buttonScale.value = withSpring(0.95);

    try {
      const quizData = {
        title: title.trim(),
        description: description.trim() || undefined,
        sourceType,
        sourceId: selectedSourceId || undefined,
        settings: {
          numberOfQuestions,
          difficulty,
          includeCalculations,
        },
      };

      const response = await QuizAPI.createQuiz(quizData);
      console.log(response)
      const quiz = response.data;

      router.push(`/quiz/${quiz._id}`);
    } catch (error) {
      console.error("Quiz generation error:", error);
      Alert.alert("Error", "Failed to generate quiz. Please try again.");
      buttonScale.value = withSpring(1);
      setIsGenerating(false);
    }
  }, [title, description, sourceType, selectedSourceId, numberOfQuestions, difficulty, includeCalculations, buttonScale, router]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: interpolate(titleOpacity.value, [0, 1], [30, 0]) }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const QuestionCountOption = ({ value }: { value: number }) => (
    <TouchableOpacity
      style={[styles.countButton, numberOfQuestions === value && styles.countButtonSelected]}
      onPress={() => setNumberOfQuestions(value)}
    >
      <Text style={[styles.countButtonText, numberOfQuestions === value && styles.countButtonTextSelected]}>
        {value}
      </Text>
    </TouchableOpacity>
  );

  const DifficultyOption = ({ value, label }: { value: typeof difficulty; label: string }) => (
    <TouchableOpacity
      style={[styles.optionButton, difficulty === value && styles.optionButtonSelected]}
      onPress={() => setDifficulty(value)}
    >
      <Text style={[styles.optionLabel, difficulty === value && styles.optionLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate Quiz</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={titleStyle}>
            <Text style={styles.greeting}>Create Your Quiz</Text>
            <Text style={styles.question}>Test your knowledge</Text>
          </Animated.View>

          <Animated.View style={[styles.form, formStyle]}>
            {/* Quiz Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quiz Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Machine Learning Fundamentals"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                editable={!isGenerating}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Additional context for quiz generation..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isGenerating}
                maxLength={500}
              />
            </View>

            {/* Source Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quiz Source</Text>
              <View style={styles.sourceTypeContainer}>
                <TouchableOpacity
                  style={[styles.sourceTypeButton, sourceType === "topic" && styles.sourceTypeButtonSelected]}
                  onPress={() => { setSourceType("topic"); setSelectedSourceId(null); setSelectedSourceName(""); }}
                >
                  <Ionicons name="bulb-outline" size={20} color={sourceType === "topic" ? "#4285F4" : "#666"} />
                  <Text style={[styles.sourceTypeText, sourceType === "topic" && styles.sourceTypeTextSelected]}>Topic</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sourceTypeButton, sourceType === "document" && styles.sourceTypeButtonSelected]}
                  onPress={() => { setSourceType("document"); handleOpenSourceModal(); }}
                >
                  <Ionicons name="document-outline" size={20} color={sourceType === "document" ? "#4285F4" : "#666"} />
                  <Text style={[styles.sourceTypeText, sourceType === "document" && styles.sourceTypeTextSelected]}>Document</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sourceTypeButton, sourceType === "course" && styles.sourceTypeButtonSelected]}
                  onPress={() => { setSourceType("course"); handleOpenSourceModal(); }}
                >
                  <Ionicons name="school-outline" size={20} color={sourceType === "course" ? "#4285F4" : "#666"} />
                  <Text style={[styles.sourceTypeText, sourceType === "course" && styles.sourceTypeTextSelected]}>Course</Text>
                </TouchableOpacity>
              </View>

              {selectedSourceName && sourceType !== "topic" && (
                <View style={styles.selectedSource}>
                  <Ionicons name={sourceType === "document" ? "document" : "school"} size={18} color="#4285F4" />
                  <Text style={styles.selectedSourceText} numberOfLines={1}>{selectedSourceName}</Text>
                  <TouchableOpacity onPress={() => { setSelectedSourceId(null); setSelectedSourceName(""); }}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              )}

              {sourceType !== "topic" && !selectedSourceId && (
                <TouchableOpacity style={styles.selectSourceButton} onPress={handleOpenSourceModal}>
                  <Ionicons name="add-circle-outline" size={20} color="#4285F4" />
                  <Text style={styles.selectSourceText}>Select {sourceType === "document" ? "Document" : "Course"}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Number of Questions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Number of Questions</Text>
              <View style={styles.countContainer}>
                {[5, 10, 15, 20, 25, 30].map((count) => (
                  <QuestionCountOption key={count} value={count} />
                ))}
              </View>
              {numberOfQuestions > 10 && (
                <Text style={styles.infoText}>
                  Quiz will be generated in batches. You&apos;ll see progress as questions are created.
                </Text>
              )}
            </View>

            {/* Difficulty */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Difficulty</Text>
              <View style={styles.optionsContainer}>
                <DifficultyOption value="easy" label="Easy" />
                <DifficultyOption value="medium" label="Medium" />
                <DifficultyOption value="hard" label="Hard" />
                <DifficultyOption value="mixed" label="Mixed" />
              </View>
            </View>

            {/* Include Calculations Toggle */}
            <TouchableOpacity style={styles.toggleOption} onPress={() => setIncludeCalculations(!includeCalculations)}>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Include Calculations</Text>
                <Text style={styles.toggleDescription}>Add math-based questions if applicable</Text>
              </View>
              <View style={[styles.toggle, includeCalculations && styles.toggleActive]}>
                <View style={[styles.toggleThumb, includeCalculations && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Generate Button */}
        <View style={styles.footer}>
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[styles.generateButton, (!title.trim() || isGenerating) && styles.generateButtonDisabled]}
              onPress={handleGenerateQuiz}
              disabled={!title.trim() || isGenerating}
            >
              {isGenerating ? (
                <View style={styles.generatingContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.generateButtonText}> Generating Quiz...</Text>
                </View>
              ) : (
                <Text style={styles.generateButtonText}>📝 Generate Quiz</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Source Selection Modal */}
        <Modal visible={showSourceModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Select {sourceType === "document" ? "Document" : "Course"}
                </Text>
                <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {isLoadingSources ? (
                <ActivityIndicator size="large" color="#4285F4" style={{ marginTop: 40 }} />
              ) : (
                <>
                  {sourceType === "document" && (
                    <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument} disabled={isUploading}>
                      {isUploading ? (
                        <ActivityIndicator size="small" color="#4285F4" />
                      ) : (
                        <>
                          <Ionicons name="cloud-upload-outline" size={20} color="#4285F4" />
                          <Text style={styles.uploadButtonText}>Upload New Document</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  <FlatList<SourceItem>
                    data={sourceType === "document" ? documents : courses}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.sourceItem}
                        onPress={() => handleSelectSource(
                          item._id,
                          sourceType === "document" ? (item as DocumentItem).originalName : (item as CourseItem).title,
                          sourceType
                        )}
                      >
                        <Ionicons
                          name={sourceType === "document" ? "document-text-outline" : "school-outline"}
                          size={24}
                          color="#4285F4"
                        />
                        <View style={styles.sourceItemContent}>
                          <Text style={styles.sourceItemTitle} numberOfLines={1}>
                            {sourceType === "document" ? (item as DocumentItem).originalName : (item as CourseItem).title}
                          </Text>
                          <Text style={styles.sourceItemDate}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>
                        No {sourceType === "document" ? "documents" : "courses"} available
                      </Text>
                    }
                    style={styles.sourceList}
                  />
                </>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  headerTitle: { fontSize: 22, color: "#000", fontFamily: "Outfit_500Medium", letterSpacing: 0.5 },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 8, paddingBottom: 120 },
  greeting: { fontSize: 32, color: "#4285F4", fontFamily: "Outfit_500Medium", marginBottom: 8, paddingLeft: 10, marginTop: 20 },
  question: { fontSize: 32, fontWeight: "400", color: "#C4C7C5", fontFamily: "Outfit_400Regular", lineHeight: 42, paddingLeft: 10 },
  form: { marginTop: 40, paddingHorizontal: 10 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1f1f1f", marginBottom: 12, fontFamily: "Outfit_500Medium" },
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
  textArea: { height: 80, paddingTop: 14 },
  sourceTypeContainer: { flexDirection: "row", gap: 10 },
  sourceTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  sourceTypeButtonSelected: { borderColor: "#4285F4", backgroundColor: "#f0f4ff" },
  sourceTypeText: { fontSize: 14, color: "#666", fontFamily: "Outfit_500Medium" },
  sourceTypeTextSelected: { color: "#4285F4" },
  selectedSource: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
  },
  selectedSourceText: { flex: 1, fontSize: 14, color: "#1f1f1f", fontFamily: "Outfit_400Regular" },
  selectSourceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#4285F4",
    borderRadius: 12,
    borderStyle: "dashed",
  },
  selectSourceText: { fontSize: 14, color: "#4285F4", fontFamily: "Outfit_500Medium" },
  countContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  countButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  countButtonSelected: { borderColor: "#4285F4", backgroundColor: "#4285F4" },
  countButtonText: { fontSize: 16, color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
  countButtonTextSelected: { color: "#fff" },
  infoText: { marginTop: 8, fontSize: 13, color: "#666", fontStyle: "italic", fontFamily: "Outfit_400Regular" },
  optionsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  optionButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  optionButtonSelected: { borderColor: "#4285F4", backgroundColor: "#f0f4ff" },
  optionLabel: { fontSize: 14, fontWeight: "600", color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
  optionLabelSelected: { color: "#4285F4" },
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
    marginBottom: 16,
  },
  toggleContent: { flex: 1, marginRight: 16 },
  toggleLabel: { fontSize: 16, fontWeight: "600", color: "#1f1f1f", marginBottom: 4, fontFamily: "Outfit_500Medium" },
  toggleDescription: { fontSize: 14, color: "#666", lineHeight: 20, fontFamily: "Outfit_400Regular" },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: "#e0e0e0", padding: 2, justifyContent: "center" },
  toggleActive: { backgroundColor: "#4285F4" },
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
  toggleThumbActive: { transform: [{ translateX: 22 }] },
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
  generateButton: { backgroundColor: "#4285F4", paddingVertical: 18, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  generateButtonDisabled: { backgroundColor: "#ccc" },
  generateButtonText: { color: "#fff", fontSize: 17, fontFamily: "Outfit_400Regular" },
  generatingContent: { flexDirection: "row", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", paddingBottom: 40 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: { fontSize: 20, fontWeight: "600", color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#4285F4",
    borderRadius: 12,
    borderStyle: "dashed",
  },
  uploadButtonText: { fontSize: 14, color: "#4285F4", fontFamily: "Outfit_500Medium" },
  sourceList: { paddingHorizontal: 20, marginTop: 8 },
  sourceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sourceItemContent: { flex: 1 },
  sourceItemTitle: { fontSize: 16, color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
  sourceItemDate: { fontSize: 13, color: "#999", marginTop: 2, fontFamily: "Outfit_400Regular" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16, fontFamily: "Outfit_400Regular" },
});
