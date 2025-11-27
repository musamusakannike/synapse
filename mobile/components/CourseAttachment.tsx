import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useTheme } from "../contexts/ThemeContext";

interface CourseOutlineItem {
  section: string;
  subsections?: string[];
}

interface CourseAttachmentProps {
  courseId: string;
  title: string;
  outline: CourseOutlineItem[];
  onViewCourse: (courseId: string) => void;
}

const CourseAttachment: React.FC<CourseAttachmentProps> = ({
  courseId,
  title,
  outline,
  onViewCourse,
}) => {
  const { colors, isDark } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (isDownloading) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isDownloading) pulse();
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isDownloading, pulseAnim]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      setIsDownloading(true);
      
      // Create a safe filename
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${safeTitle}_course.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Get the API base URL and construct the download URL
      const { API_BASE_URL } = await import("../lib/api");
      const downloadUrl = `${API_BASE_URL}/courses/${courseId}/pdf`;
      
      // Get the auth token for the request
      const token = await import("expo-secure-store").then(SecureStore => 
        SecureStore.getItemAsync("accessToken")
      );
      
      // Download the PDF with authentication
      const downloadResult = await FileSystem.downloadAsync(
        downloadUrl,
        fileUri,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
          } : {},
        }
      );
      
      if (downloadResult.status === 200) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          // Share the file (this will allow user to save it or open in other apps)
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Save ${title} Course PDF`,
          });
          
          Alert.alert(
            "Success! 📄",
            "Course PDF has been downloaded and is ready to share or save.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Downloaded! 📄",
            `Course PDF has been saved to: ${fileName}`,
            [{ text: "OK" }]
          );
        }
      } else {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Alert.alert(
        "Download Error",
        "Failed to download PDF. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsDownloading(false);
    }
  }, [courseId, title]);

  const handleViewCourse = useCallback(() => {
    onViewCourse(courseId);
  }, [courseId, onViewCourse]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.card : '#f8f9ff', borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎓</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Complete Course • {outline.length} sections
          </Text>
        </View>
      </View>

      {/* Course Outline */}
      <View style={styles.outlineContainer}>
        <Text style={[styles.outlineTitle, { color: colors.text }]}>Course Outline:</Text>
        <ScrollView 
          style={styles.outlineScrollView}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {outline.slice(0, 5).map((section, index) => (
            <View key={index} style={styles.outlineItem}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.sectionContent}>
                <Text style={[styles.sectionTitle, { color: colors.text }]} numberOfLines={2}>
                  {section.section}
                </Text>
                {section.subsections && section.subsections.length > 0 && (
                  <Text style={[styles.subsectionCount, { color: colors.textSecondary }]}>
                    {section.subsections.length} subsection{section.subsections.length > 1 ? 's' : ''}
                  </Text>
                )}
              </View>
            </View>
          ))}
          
          {outline.length > 5 && (
            <View style={styles.moreIndicator}>
              <Text style={styles.moreText}>
                +{outline.length - 5} more sections
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.downloadButton,
            { backgroundColor: colors.background, borderColor: colors.primary },
            isDownloading && [styles.downloadButtonLoading, { backgroundColor: isDark ? colors.card : '#f0f4ff' }]
          ]}
          onPress={handleDownloadPDF}
          disabled={isDownloading}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            {isDownloading ? (
              <>
                <Animated.View 
                  style={[
                    styles.loadingDot, 
                    { opacity: pulseAnim }
                  ]} 
                />
                <Text style={[styles.downloadButtonText, styles.loadingText]}>
                  Downloading...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.downloadButtonText}>Download PDF</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={handleViewCourse}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.viewButtonText}>View Course</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9ff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e3e8ff",
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 4,
    lineHeight: 22,
    fontFamily: "Outfit_500Medium",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Outfit_400Regular",
  },
  outlineContainer: {
    marginBottom: 16,
  },
  outlineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 12,
    fontFamily: "Outfit_500Medium",
  },
  outlineScrollView: {
    maxHeight: 200,
  },
  outlineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  sectionNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f1f1f",
    lineHeight: 20,
    fontFamily: "Outfit_500Medium",
  },
  subsectionCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontFamily: "Outfit_400Regular",
  },
  moreIndicator: {
    alignItems: "center",
    paddingVertical: 8,
  },
  moreText: {
    fontSize: 12,
    color: "#4285F4",
    fontWeight: "500",
    fontFamily: "Outfit_500Medium",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonIcon: {
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#4285F4",
  },
  downloadButtonLoading: {
    backgroundColor: "#f0f4ff",
    borderColor: "#a0b4f4",
  },
  downloadButtonText: {
    color: "#4285F4",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  loadingText: {
    color: "#666",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4285F4",
    opacity: 0.6,
  },
  viewButton: {
    backgroundColor: "#4285F4",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
});

export default CourseAttachment;
