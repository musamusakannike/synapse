import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { CourseAPI, ChatAPI } from "../../lib/api";

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

export default function CourseProgressPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const headerOpacity = useSharedValue(0);
  const progressValue = useSharedValue(0);
  const outlineOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withSpring(1, { duration: 800 });
    
    if (id) {
      startPolling(id);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [id, headerOpacity]);

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
          setTimeout(async () => {
            try {
              // Find the chat that was created for this course
              const chatsResponse = await ChatAPI.getUserChats(1, 50);
              const courseChat = chatsResponse.data.chats.find(
                (chat: any) => chat.type === "course" && chat.sourceId?._id === courseId
              );

              if (courseChat) {
                // Navigate back to home and the chat will be opened
                router.replace("/");
                // Note: You might need to implement a way to open the specific chat
              } else {
                router.replace("/");
              }
            } catch (error) {
              console.error("Error finding course chat:", error);
              router.replace("/");
            }
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
  }, [progressValue, outlineOpacity, router]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

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
        return 70;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Generation</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.greeting}>Generating Your Course</Text>
          {course && (
            <Text style={styles.courseTitle}>{course.title}</Text>
          )}
        </View>

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

        {/* Footer */}
        {course?.status === "failed" && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  backButtonText: {
    fontSize: 24,
    color: "#000",
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
    paddingBottom: 40,
  },
  titleSection: {
    paddingHorizontal: 10,
    paddingTop: 20,
    alignItems: "center",
    marginBottom: 40,
  },
  greeting: {
    fontSize: 32,
    color: "#4285F4",
    fontFamily: "Outfit_500Medium",
    marginBottom: 8,
    textAlign: "center",
  },
  courseTitle: {
    fontSize: 18,
    color: "#666",
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  progressSection: {
    paddingHorizontal: 10,
    marginBottom: 32,
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
    fontFamily: "Outfit_500Medium",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4285F4",
    fontFamily: "Outfit_500Medium",
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
    fontFamily: "Outfit_400Regular",
  },
  outlineSection: {
    paddingHorizontal: 10,
    marginBottom: 32,
  },
  outlineTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 16,
    fontFamily: "Outfit_500Medium",
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
    fontFamily: "Outfit_500Medium",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f1f1f",
    fontFamily: "Outfit_500Medium",
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
    fontFamily: "Outfit_400Regular",
  },
  settingsSection: {
    paddingHorizontal: 10,
    marginBottom: 32,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 16,
    fontFamily: "Outfit_500Medium",
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
    fontFamily: "Outfit_400Regular",
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f1f1f",
    fontFamily: "Outfit_500Medium",
  },
  footer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  retryButton: {
    backgroundColor: "#f44336",
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Outfit_400Regular",
  },
});
