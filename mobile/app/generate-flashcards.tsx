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
import { FlashcardAPI, DocumentAPI, CourseAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

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

export default function GenerateFlashcardsPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("topic");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedSourceName, setSelectedSourceName] = useState<string>("");
  const [numberOfCards, setNumberOfCards] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [includeDefinitions, setIncludeDefinitions] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Source selection modal
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

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

  const handleGenerateFlashcards = useCallback(async () => {
    if (sourceType !== "topic" && !selectedSourceId) {
      Alert.alert("Required Field", "Please select a document");
      return;
    }

    if (sourceType === "topic" && !title.trim() && !description.trim()) {
      Alert.alert("Required Field", "Please enter a title or description for the topic");
      return;
    }

    setIsGenerating(true);
    buttonScale.value = withSpring(0.95);

    try {
      const flashcardData = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        sourceType,
        sourceId: selectedSourceId || undefined,
        settings: {
          numberOfCards,
          difficulty,
          includeDefinitions,
          includeExamples,
        },
      };

      const response = await FlashcardAPI.generateFlashcards(flashcardData);
      const flashcardSet = response.data.flashcardSet;

      router.push(`/flashcards/${flashcardSet.id}`);
    } catch (error) {
      console.error("Flashcard generation error:", error);
      Alert.alert("Error", "Failed to generate flashcards. Please try again.");
      buttonScale.value = withSpring(1);
      setIsGenerating(false);
    }
  }, [title, description, sourceType, selectedSourceId, numberOfCards, difficulty, includeDefinitions, includeExamples, buttonScale, router]);

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

  const CardCountOption = ({ value }: { value: number }) => (
    <TouchableOpacity
      style={[styles.countButton, numberOfCards === value && styles.countButtonSelected]}
      onPress={() => setNumberOfCards(value)}
    >
      <Text style={[styles.countButtonText, numberOfCards === value && styles.countButtonTextSelected]}>
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
          <Text style={styles.headerTitle}>Create Flashcards</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={titleStyle}>
            <Text style={styles.greeting}>Create Flashcards</Text>
            <Text style={styles.question}>Master any topic with spaced repetition</Text>
          </Animated.View>

          <Animated.View style={[styles.form, formStyle]}>
            {/* Flashcard Set Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Biology Key Terms"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                editable={!isGenerating}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Topic / Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="What topic should the flashcards cover?"
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
              <Text style={styles.sectionTitle}>Source</Text>
              <View style={styles.sourceTypeContainer}>
                <TouchableOpacity
                  style={[styles.sourceTypeButton, sourceType === "topic" && styles.sourceTypeButtonSelected]}
                  onPress={() => { setSourceType("topic"); setSelectedSourceId(null); setSelectedSourceName(""); }}
                >
                  <Ionicons name="bulb-outline" size={20} color={sourceType === "topic" ? "#9C27B0" : "#666"} />
                  <Text style={[styles.sourceTypeText, sourceType === "topic" && styles.sourceTypeTextSelected]}>Topic</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sourceTypeButton, sourceType === "document" && styles.sourceTypeButtonSelected]}
                  onPress={() => { setSourceType("document"); handleOpenSourceModal(); }}
                >
                  <Ionicons name="document-outline" size={20} color={sourceType === "document" ? "#9C27B0" : "#666"} />
                  <Text style={[styles.sourceTypeText, sourceType === "document" && styles.sourceTypeTextSelected]}>Document</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sourceTypeButton, sourceType === "course" && styles.sourceTypeButtonSelected]}
                  onPress={() => { setSourceType("course"); handleOpenSourceModal(); }}
                >
                  <Ionicons name="school-outline" size={20} color={sourceType === "course" ? "#9C27B0" : "#666"} />
                  <Text style={[styles.sourceTypeText, sourceType === "course" && styles.sourceTypeTextSelected]}>Course</Text>
                </TouchableOpacity>
              </View>

              {selectedSourceName && sourceType !== "topic" && (
                <View style={styles.selectedSource}>
                  <Ionicons name={sourceType === "document" ? "document" : "school"} size={18} color="#9C27B0" />
                  <Text style={styles.selectedSourceText} numberOfLines={1}>{selectedSourceName}</Text>
                  <TouchableOpacity onPress={() => { setSelectedSourceId(null); setSelectedSourceName(""); }}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              )}

              {sourceType !== "topic" && !selectedSourceId && (
                <TouchableOpacity style={styles.selectSourceButton} onPress={handleOpenSourceModal}>
                  <Ionicons name="add-circle-outline" size={20} color="#9C27B0" />
                  <Text style={styles.selectSourceText}>Select {sourceType === "document" ? "Document" : "Course"}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Number of Cards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Number of Cards</Text>
              <View style={styles.countContainer}>
                {[5, 10, 15, 20, 25, 30].map((count) => (
                  <CardCountOption key={count} value={count} />
                ))}
              </View>
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

            {/* Include Definitions Toggle */}
            <TouchableOpacity style={styles.toggleOption} onPress={() => setIncludeDefinitions(!includeDefinitions)}>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Include Definitions</Text>
                <Text style={styles.toggleDescription}>Add clear definitions for terms</Text>
              </View>
              <View style={[styles.toggle, includeDefinitions && styles.toggleActive]}>
                <View style={[styles.toggleThumb, includeDefinitions && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            {/* Include Examples Toggle */}
            <TouchableOpacity style={styles.toggleOption} onPress={() => setIncludeExamples(!includeExamples)}>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Include Examples</Text>
                <Text style={styles.toggleDescription}>Add practical examples to cards</Text>
              </View>
              <View style={[styles.toggle, includeExamples && styles.toggleActive]}>
                <View style={[styles.toggleThumb, includeExamples && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Generate Button */}
        <View style={styles.footer}>
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={handleGenerateFlashcards}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <View style={styles.generatingContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.generateButtonText}> Generating Flashcards...</Text>
                </View>
              ) : (
                <Text style={styles.generateButtonText}>🃏 Generate Flashcards</Text>
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
                <ActivityIndicator size="large" color="#9C27B0" style={{ marginTop: 40 }} />
              ) : (
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
                        color="#9C27B0"
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  greeting: { fontSize: 28, fontWeight: "700", color: "#1f1f1f", marginBottom: 8, fontFamily: "Outfit_500Medium" },
  question: { fontSize: 16, color: "#666", marginBottom: 24, fontFamily: "Outfit_400Regular" },
  form: { gap: 20 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
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
  textArea: { minHeight: 100, textAlignVertical: "top" },
  sourceTypeContainer: { flexDirection: "row", gap: 12 },
  sourceTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  sourceTypeButtonSelected: { borderColor: "#9C27B0", backgroundColor: "#f5f0ff" },
  sourceTypeText: { fontSize: 14, color: "#666", fontFamily: "Outfit_500Medium" },
  sourceTypeTextSelected: { color: "#9C27B0" },
  selectedSource: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f5f0ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0d4ff",
  },
  selectedSourceText: { flex: 1, fontSize: 14, color: "#1f1f1f", fontFamily: "Outfit_400Regular" },
  selectSourceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#9C27B0",
    borderRadius: 12,
    borderStyle: "dashed",
  },
  selectSourceText: { fontSize: 14, color: "#9C27B0", fontFamily: "Outfit_500Medium" },
  countContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  countButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  countButtonSelected: { borderColor: "#9C27B0", backgroundColor: "#f5f0ff" },
  countButtonText: { fontSize: 16, fontWeight: "600", color: "#666", fontFamily: "Outfit_500Medium" },
  countButtonTextSelected: { color: "#9C27B0" },
  optionsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  optionButtonSelected: { borderColor: "#9C27B0", backgroundColor: "#f5f0ff" },
  optionLabel: { fontSize: 14, color: "#666", fontFamily: "Outfit_500Medium" },
  optionLabelSelected: { color: "#9C27B0" },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  toggleContent: { flex: 1 },
  toggleLabel: { fontSize: 16, fontWeight: "600", color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
  toggleDescription: { fontSize: 13, color: "#666", marginTop: 2, fontFamily: "Outfit_400Regular" },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: "#9C27B0" },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: { alignSelf: "flex-end" },
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
  generateButton: {
    backgroundColor: "#9C27B0",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  generateButtonDisabled: { backgroundColor: "#ccc" },
  generateButtonText: { color: "#fff", fontSize: 17, fontFamily: "Outfit_500Medium" },
  generatingContent: { flexDirection: "row", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "600", color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
  sourceList: { flexGrow: 0 },
  sourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  sourceItemContent: { flex: 1 },
  sourceItemTitle: { fontSize: 16, color: "#1f1f1f", fontFamily: "Outfit_500Medium" },
  sourceItemDate: { fontSize: 13, color: "#999", marginTop: 2, fontFamily: "Outfit_400Regular" },
  emptyText: { textAlign: "center", color: "#999", fontSize: 16, marginTop: 40, fontFamily: "Outfit_400Regular" },
});
