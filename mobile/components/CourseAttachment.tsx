import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { CourseAPI } from "../lib/api";

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
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    try {
      setIsDownloading(true);
      
      // For mobile, we'll need to handle PDF download differently
      // This is a placeholder - you might want to use a library like react-native-fs
      // or open the PDF in a web browser
      const response = await CourseAPI.downloadCoursePDF(courseId);
      
      // For now, we'll show an alert that the feature is coming soon
      Alert.alert(
        "PDF Download",
        "PDF download feature is coming soon! For now, you can view the course content in the app.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Alert.alert("Error", "Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [courseId]);

  const handleViewCourse = useCallback(() => {
    onViewCourse(courseId);
  }, [courseId, onViewCourse]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎓</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            Complete Course • {outline.length} sections
          </Text>
        </View>
      </View>

      {/* Course Outline */}
      <View style={styles.outlineContainer}>
        <Text style={styles.outlineTitle}>Course Outline:</Text>
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
                <Text style={styles.sectionTitle} numberOfLines={2}>
                  {section.section}
                </Text>
                {section.subsections && section.subsections.length > 0 && (
                  <Text style={styles.subsectionCount}>
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
          style={[styles.actionButton, styles.downloadButton]}
          onPress={handleDownloadPDF}
          disabled={isDownloading}
        >
          <Text style={styles.downloadButtonText}>
            {isDownloading ? "📄 Downloading..." : "📄 Download PDF"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={handleViewCourse}
        >
          <Text style={styles.viewButtonText}>👁️ View Course</Text>
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
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  outlineContainer: {
    marginBottom: 16,
  },
  outlineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 12,
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
  },
  subsectionCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  moreIndicator: {
    alignItems: "center",
    paddingVertical: 8,
  },
  moreText: {
    fontSize: 12,
    color: "#4285F4",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4285F4",
  },
  downloadButtonText: {
    color: "#4285F4",
    fontSize: 14,
    fontWeight: "600",
  },
  viewButton: {
    backgroundColor: "#4285F4",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CourseAttachment;
