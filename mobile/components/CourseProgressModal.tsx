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
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { CourseAPI } from "../lib/api";

export interface CourseProgressModalRef {
  present: (courseId: string) => void;
  dismiss: () => void;
}

interface CourseProgressModalProps {
  onCourseReady: (courseId: string) => void;
}

interface CourseOutlineItem {
  section: string;
  subsections?: string[];
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  status: "generating_outline" | "generating_content" | "completed" | "failed";
  outline: CourseOutlineItem[];
  settings: {
    level: string;
    includeExamples: boolean;
    includePracticeQuestions: boolean;
    detailLevel: string;
  };
  createdAt: string;
}

const CourseProgressModal = forwardRef<
  CourseProgressModalRef,
  CourseProgressModalProps
>(({ onCourseReady }, ref) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const progressValue = useSharedValue(0);
  const outlineOpacity = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    present: (courseId: string) => {
      setCurrentCourseId(courseId);
      bottomSheetModalRef.current?.present();
      startPolling(courseId);
    },
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  const startPolling = useCallback(async (courseId: string) => {
    setIsPolling(true);
    
    const pollCourse = async () => {
      try {
        const response = await CourseAPI.getCourse(courseId);
        const courseData = response.data;
        setCourse(courseData);

        // Update progress based on status
        let progress = 0;
        switch (courseData.status) {
          case "generating_outline":
            progress = 0.3;
            break;
          case "generating_content":
            progress = 0.7;
            break;
          case "completed":
            progress = 1;
            break;
          case "failed":
            progress = 0;
            break;
        }

        progressValue.value = withTiming(progress, { duration: 500 });

        // Show outline when available
        if (courseData.outline && courseData.outline.length > 0) {
          outlineOpacity.value = withTiming(1, { duration: 800 });
        }

        // Handle completion or failure
        if (courseData.status === "completed") {
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          // Delay to show completion animation
          setTimeout(() => {
            onCourseReady(courseId);
            bottomSheetModalRef.current?.dismiss();
          }, 1500);
        } else if (courseData.status === "failed") {
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (error) {
        console.error("Error polling course:", error);
      }
    };

    // Initial poll
    await pollCourse();

    // Set up polling interval
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(pollCourse, 3000);
    }
  }, [progressValue, outlineOpacity, onCourseReady]);

  const handleDismiss = useCallback(() => {
    setIsPolling(false);
    setCourse(null);
    setCurrentCourseId(null);
    progressValue.value = 0;
    outlineOpacity.value = 0;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [progressValue, outlineOpacity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const outlineStyle = useAnimatedStyle(() => ({
    opacity: outlineOpacity.value,
    transform: [
      {
        translateY: interpolate(outlineOpacity.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const getStatusText = () => {
    if (!course) return "Initializing...";
    
    switch (course.status) {
      case "generating_outline":
        return "Creating course outline...";
      case "generating_content":
        return "Generating detailed content...";
      case "completed":
        return "Course ready! 🎉";
      case "failed":
        return "Generation failed. Please try again.";
      default:
        return "Processing...";
    }
  };

  const getProgressPercentage = () => {
    if (!course) return 0;
    
    switch (course.status) {
      case "generating_outline":
        return 30;
      case "generating_content":
        return 40;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={["80%"]}
      onDismiss={handleDismiss}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      enableDismissOnClose={course?.status !== "completed"}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Generating Your Course</Text>
          {course && (
            <Text style={styles.courseTitle}>{course.title}</Text>
          )}
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
              <Text style={styles.progressPercentage}>
                {getProgressPercentage()}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <Animated.View style={[styles.progressBar, progressBarStyle]} />
            </View>

            {isPolling && course?.status !== "completed" && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4285F4" />
                <Text style={styles.loadingText}>
                  This may take a few minutes...
                </Text>
              </View>
            )}
          </View>

          {/* Course Outline Preview */}
          {course?.outline && course.outline.length > 0 && (
            <Animated.View style={[styles.outlineSection, outlineStyle]}>
              <Text style={styles.outlineTitle}>Course Outline Preview</Text>
              <View style={styles.outlineContainer}>
                {course.outline.map((section, index) => (
                  <View key={index} style={styles.outlineItem}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionNumber}>
                        <Text style={styles.sectionNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.sectionTitle}>{section.section}</Text>
                    </View>
                    
                    {section.subsections && section.subsections.length > 0 && (
                      <View style={styles.subsectionsContainer}>
                        {section.subsections.map((subsection, subIndex) => (
                          <View key={subIndex} style={styles.subsectionItem}>
                            <View style={styles.subsectionDot} />
                            <Text style={styles.subsectionText}>
                              {subsection}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Course Settings */}
          {course && (
            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>Course Configuration</Text>
              <View style={styles.settingsGrid}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Level</Text>
                  <Text style={styles.settingValue}>
                    {course.settings.level.charAt(0).toUpperCase() + 
                     course.settings.level.slice(1)}
                  </Text>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Detail Level</Text>
                  <Text style={styles.settingValue}>
                    {course.settings.detailLevel.charAt(0).toUpperCase() + 
                     course.settings.detailLevel.slice(1)}
                  </Text>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Examples</Text>
                  <Text style={styles.settingValue}>
                    {course.settings.includeExamples ? "Yes" : "No"}
                  </Text>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Practice Questions</Text>
                  <Text style={styles.settingValue}>
                    {course.settings.includePracticeQuestions ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </BottomSheetScrollView>

        {/* Footer */}
        {course?.status === "failed" && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => bottomSheetModalRef.current?.dismiss()}
            >
              <Text style={styles.retryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CourseProgressModal.displayName = "CourseProgressModal";

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
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 16,
    color: "#4285F4",
    textAlign: "center",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  progressSection: {
    paddingVertical: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1f1f1f",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4285F4",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4285F4",
    borderRadius: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  outlineSection: {
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  outlineTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 16,
  },
  outlineContainer: {
    gap: 16,
  },
  outlineItem: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f1f1f",
  },
  subsectionsContainer: {
    paddingLeft: 44,
    gap: 8,
  },
  subsectionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  subsectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4285F4",
    marginRight: 12,
  },
  subsectionText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  settingsSection: {
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 16,
  },
  settingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  settingItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 8,
  },
  settingLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f1f1f",
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  retryButton: {
    backgroundColor: "#f44336",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CourseProgressModal;
