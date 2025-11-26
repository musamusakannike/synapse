import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ImageAttachmentProps {
  documentId: string;
  originalName: string;
  summary: string;
  extractedText: string;
  mimeType: string;
  isImage: boolean;
}

const ImageAttachment: React.FC<ImageAttachmentProps> = ({
  documentId,
  originalName,
  summary,
  extractedText,
  mimeType,
  isImage,
}) => {
  const formatFileName = (fileName: string) => {
    if (fileName.length > 30) {
      return fileName.substring(0, 27) + "...";
    }
    return fileName;
  };

  const getFileIcon = () => {
    if (mimeType.startsWith("image/")) {
      return "🖼️";
    }
    return "📄";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{getFileIcon()}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {formatFileName(originalName)}
          </Text>
        </View>
        <View style={[styles.typeBadge, isImage && styles.imageBadge]}>
          <Text style={styles.typeText}>
            {isImage ? "Image" : "Document"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.summaryLabel}>Analysis Summary:</Text>
        <Text style={styles.summaryText} numberOfLines={4}>
          {summary}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye-outline" size={16} color="#4285F4" />
          <Text style={styles.actionButtonText}>View Analysis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4285F4",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
    color: "#1f1f1f",
    flex: 1,
  },
  typeBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageBadge: {
    backgroundColor: "#fce4ec",
  },
  typeText: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
    color: "#1976d2",
  },
  content: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
    color: "#666",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#333",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
    color: "#4285F4",
    marginLeft: 6,
  },
});

export default ImageAttachment;
