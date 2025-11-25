import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import Markdown from "react-native-markdown-display";
import { CourseAPI } from "../../lib/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface CourseOutlineItem {
  section: string;
  subsections?: string[];
}

interface CourseContent {
  section: string;
  subsection: string | null;
  explanation: string;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  status: string;
  outline: CourseOutlineItem[];
  content: CourseContent[];
  settings: {
    level: string;
    includeExamples: boolean;
    includePracticeQuestions: boolean;
    detailLevel: string;
  };
  createdAt: string;
}

export default function CourseViewPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [selectedSubsection, setSelectedSubsection] = useState<number | null>(
    null
  );
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  const headerOpacity = useSharedValue(1);
  const tocOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CourseAPI.getCourse(id);
      setCourse(response.data);

      // Animate content in
      contentOpacity.value = withTiming(1, { duration: 800 });
    } catch (error) {
      console.error("Error loading course:", error);
      Alert.alert("Error", "Failed to load course. Please try again.");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, contentOpacity, router]);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id, loadCourse]);

  const toggleTableOfContents = useCallback(() => {
    setShowTableOfContents(!showTableOfContents);
    tocOpacity.value = withSpring(showTableOfContents ? 0 : 1);
  }, [showTableOfContents, tocOpacity]);

  const navigateToSection = useCallback(
    (sectionIndex: number, subsectionIndex?: number) => {
      setSelectedSection(sectionIndex);
      setSelectedSubsection(subsectionIndex ?? null);
      setShowTableOfContents(false);
      tocOpacity.value = withSpring(0);

      // Scroll to top of content
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    },
    [tocOpacity]
  );

  const navigateNext = useCallback(() => {
    if (!course) return;

    const currentSection = course.outline[selectedSection];

    if (selectedSubsection === null) {
      // Currently viewing main section
      if (currentSection.subsections && currentSection.subsections.length > 0) {
        // Go to first subsection
        setSelectedSubsection(0);
      } else {
        // Go to next section
        if (selectedSection < course.outline.length - 1) {
          setSelectedSection(selectedSection + 1);
          setSelectedSubsection(null);
        }
      }
    } else {
      // Currently viewing subsection
      if (selectedSubsection < (currentSection.subsections?.length || 0) - 1) {
        // Go to next subsection
        setSelectedSubsection(selectedSubsection + 1);
      } else {
        // Go to next section
        if (selectedSection < course.outline.length - 1) {
          setSelectedSection(selectedSection + 1);
          setSelectedSubsection(null);
        }
      }
    }

    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [course, selectedSection, selectedSubsection]);

  const navigatePrevious = useCallback(() => {
    if (!course) return;

    if (selectedSubsection === null) {
      // Currently viewing main section
      if (selectedSection > 0) {
        const prevSection = course.outline[selectedSection - 1];
        setSelectedSection(selectedSection - 1);

        // Go to last subsection of previous section if it has any
        if (prevSection.subsections && prevSection.subsections.length > 0) {
          setSelectedSubsection(prevSection.subsections.length - 1);
        } else {
          setSelectedSubsection(null);
        }
      }
    } else {
      // Currently viewing subsection
      if (selectedSubsection > 0) {
        // Go to previous subsection
        setSelectedSubsection(selectedSubsection - 1);
      } else {
        // Go to main section
        setSelectedSubsection(null);
      }
    }

    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [course, selectedSection, selectedSubsection]);

  const shareCourse = useCallback(async () => {
    if (!course) return;

    try {
      await Share.share({
        message: `Check out this course: ${course.title}\n\nGenerated with Synapse AI`,
        title: course.title,
      });
    } catch (error) {
      console.error("Error sharing course:", error);
    }
  }, [course]);

  const getCurrentContent = useCallback(() => {
    if (!course) return null;

    const currentSection = course.outline[selectedSection];
    if (!currentSection) return null;

    if (selectedSubsection === null) {
      // Return main section content
      return course.content.find(
        (c) => c.section === currentSection.section && !c.subsection
      );
    } else {
      // Return subsection content
      const subsectionName = currentSection.subsections?.[selectedSubsection];
      return course.content.find(
        (c) =>
          c.section === currentSection.section &&
          c.subsection === subsectionName
      );
    }
  }, [course, selectedSection, selectedSubsection]);

  const getCurrentTitle = useCallback(() => {
    if (!course) return "";

    const currentSection = course.outline[selectedSection];
    if (!currentSection) return "";

    if (selectedSubsection === null) {
      return `${selectedSection + 1}. ${currentSection.section}`;
    } else {
      const subsectionName = currentSection.subsections?.[selectedSubsection];
      return `${selectedSection + 1}.${
        selectedSubsection + 1
      } ${subsectionName}`;
    }
  }, [course, selectedSection, selectedSubsection]);

  const canNavigateNext = useCallback(() => {
    if (!course) return false;

    const currentSection = course.outline[selectedSection];

    if (selectedSubsection === null) {
      // Check if there are subsections or next section
      return (
        (currentSection.subsections && currentSection.subsections.length > 0) ||
        selectedSection < course.outline.length - 1
      );
    } else {
      // Check if there are more subsections or next section
      return (
        selectedSubsection < (currentSection.subsections?.length || 0) - 1 ||
        selectedSection < course.outline.length - 1
      );
    }
  }, [course, selectedSection, selectedSubsection]);

  const canNavigatePrevious = useCallback(() => {
    return selectedSection > 0 || selectedSubsection !== null;
  }, [selectedSection, selectedSubsection]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const tocStyle = useAnimatedStyle(() => ({
    opacity: tocOpacity.value,
    transform: [
      {
        translateY: interpolate(tocOpacity.value, [0, 1], [-20, 0]),
      },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading course...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentContent = getCurrentContent();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#1f1f1f" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {course.title}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleTableOfContents}
          >
            <MaterialIcons name="menu" size={20} color="#1f1f1f" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={shareCourse}>
            <Ionicons name="share-outline" size={20} color="#1f1f1f" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Table of Contents Overlay */}
      {showTableOfContents && (
        <Animated.View style={[styles.tocOverlay, tocStyle]}>
          <View style={styles.tocContainer}>
            <Text style={styles.tocTitle}>Table of Contents</Text>
            <ScrollView
              style={styles.tocScrollView}
              showsVerticalScrollIndicator={false}
            >
              {course.outline.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.tocSection}>
                  <TouchableOpacity
                    style={[
                      styles.tocItem,
                      selectedSection === sectionIndex &&
                        selectedSubsection === null &&
                        styles.tocItemActive,
                    ]}
                    onPress={() => navigateToSection(sectionIndex)}
                  >
                    <Text
                      style={[
                        styles.tocItemText,
                        selectedSection === sectionIndex &&
                          selectedSubsection === null &&
                          styles.tocItemTextActive,
                      ]}
                    >
                      {sectionIndex + 1}. {section.section}
                    </Text>
                  </TouchableOpacity>

                  {section.subsections &&
                    section.subsections.map((subsection, subsectionIndex) => (
                      <TouchableOpacity
                        key={subsectionIndex}
                        style={[
                          styles.tocSubItem,
                          selectedSection === sectionIndex &&
                            selectedSubsection === subsectionIndex &&
                            styles.tocItemActive,
                        ]}
                        onPress={() =>
                          navigateToSection(sectionIndex, subsectionIndex)
                        }
                      >
                        <Text
                          style={[
                            styles.tocSubItemText,
                            selectedSection === sectionIndex &&
                              selectedSubsection === subsectionIndex &&
                              styles.tocItemTextActive,
                          ]}
                        >
                          {sectionIndex + 1}.{subsectionIndex + 1} {subsection}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.tocCloseButton}
              onPress={toggleTableOfContents}
            >
              <Text style={styles.tocCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Content */}
      <Animated.View style={[styles.contentContainer, contentStyle]}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>{getCurrentTitle()}</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentContent ? (
            <Markdown style={markdownStyles}>
              {currentContent.explanation}
            </Markdown>
          ) : (
            <Text style={styles.noContentText}>
              Content not available for this section.
            </Text>
          )}
        </ScrollView>
      </Animated.View>

      {/* Navigation Footer */}
      <View style={styles.navigationFooter}>
        <TouchableOpacity
          style={[
            styles.navButton,
            !canNavigatePrevious() && styles.navButtonDisabled,
          ]}
          onPress={navigatePrevious}
          disabled={!canNavigatePrevious()}
        >
          <View style={styles.navButtonContent}>
            <Ionicons
              name="chevron-back"
              size={16}
              color={!canNavigatePrevious() ? "#999" : "#fff"}
            />
            <Text
              style={[
                styles.navButtonText,
                !canNavigatePrevious() && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            {selectedSection + 1} of {course.outline.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            !canNavigateNext() && styles.navButtonDisabled,
          ]}
          onPress={navigateNext}
          disabled={!canNavigateNext()}
        >
          <View style={styles.navButtonContent}>
            <Text
              style={[
                styles.navButtonText,
                !canNavigateNext() && styles.navButtonTextDisabled,
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={!canNavigateNext() ? "#999" : "#fff"}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerButtonText: {
    fontSize: 20,
    color: "#1f1f1f",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
  },
  headerRight: {
    flexDirection: "row",
  },
  tocOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  tocContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: screenHeight * 0.8,
    width: screenWidth * 0.9,
  },
  tocTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 16,
    textAlign: "center",
  },
  tocScrollView: {
    maxHeight: screenHeight * 0.6,
  },
  tocSection: {
    marginBottom: 8,
  },
  tocItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tocItemActive: {
    backgroundColor: "#f0f4ff",
  },
  tocItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f1f1f",
  },
  tocItemTextActive: {
    color: "#4285F4",
  },
  tocSubItem: {
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  tocSubItemText: {
    fontSize: 14,
    color: "#666",
  },
  tocCloseButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  tocCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  contentHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f1f1f",
    lineHeight: 28,
  },
  contentScrollView: {
    flex: 1,
  },
  contentScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  noContentText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  navigationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4285F4",
  },
  navButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#999",
  },
  progressIndicator: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1f1f1f",
  },
  heading1: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 16,
    marginTop: 24,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 12,
    marginTop: 20,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 8,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1f1f1f",
    marginBottom: 16,
  },
  list_item: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1f1f1f",
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: "monospace",
  },
  code_block: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "#4285F4",
    paddingLeft: 16,
    marginVertical: 8,
    backgroundColor: "#f8f9ff",
    paddingVertical: 8,
  },
};
