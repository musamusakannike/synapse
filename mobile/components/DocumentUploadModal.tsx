import React, { forwardRef, useCallback, useMemo, useState, useImperativeHandle } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import * as DocumentPicker from "expo-document-picker";
import { DocumentAPI } from "../lib/api";

export interface DocumentUploadModalRef {
    present: () => void;
    dismiss: () => void;
}

interface DocumentUploadModalProps {
    onUploadSuccess?: (documentId: string) => void;
    onUploadError?: (error: string) => void;
}

const DocumentUploadModal = forwardRef<DocumentUploadModalRef, DocumentUploadModalProps>(
    ({ onUploadSuccess, onUploadError }, ref) => {
        const bottomSheetRef = React.useRef<BottomSheet>(null);
        const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
        const [isUploading, setIsUploading] = useState(false);
        const snapPoints = useMemo(() => ["50%"], []);

        useImperativeHandle(ref, () => ({
            present: () => bottomSheetRef.current?.expand(),
            dismiss: () => bottomSheetRef.current?.close(),
        }));

        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                />
            ),
            []
        );

        const handlePickDocument = async () => {
            try {
                console.log("Opening document picker...");

                // Simplified picker configuration to avoid crashes
                const result = await DocumentPicker.getDocumentAsync({
                    type: "*/*", // Accept all files, we'll validate after
                    multiple: false,
                });

                console.log("Document picker result:", JSON.stringify(result, null, 2));

                if (result.canceled) {
                    console.log("Document picker was canceled");
                    return;
                }

                const file = result.assets[0];
                console.log("Selected file:", JSON.stringify(file, null, 2));

                // Validate file type
                const validTypes = [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "text/plain"
                ];

                const validExtensions = [".pdf", ".docx", ".txt"];
                const fileName = file.name.toLowerCase();
                const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
                const hasValidMimeType = file.mimeType && validTypes.includes(file.mimeType);

                if (!hasValidExtension && !hasValidMimeType) {
                    Alert.alert(
                        "Invalid File Type",
                        "Please select a PDF, DOCX, or TXT file"
                    );
                    return;
                }

                // Validate file size (10MB max)
                const maxSize = 10 * 1024 * 1024; // 10MB in bytes
                if (file.size && file.size > maxSize) {
                    Alert.alert("File Too Large", "Please select a file under 10MB");
                    return;
                }

                console.log("File validated, setting selected file");
                setSelectedFile(file);
            } catch (error: any) {
                console.error("Document picker error:", error);
                console.error("Error stack:", error.stack);
                Alert.alert("Error", `Failed to select document: ${error.message || error}`);
            }
        };

        const handleUpload = async () => {
            if (!selectedFile) return;

            try {
                console.log("Starting upload for file:", selectedFile.name);
                setIsUploading(true);

                // Create FormData
                const formData = new FormData();

                // Use the file object directly - React Native handles this differently
                const fileToUpload: any = {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.mimeType || "application/octet-stream",
                };

                console.log("File to upload:", fileToUpload);
                formData.append("file", fileToUpload);

                console.log("Uploading to server...");
                // Upload document
                const response = await DocumentAPI.uploadDocument(formData);
                console.log("Upload response:", response.data);

                const documentId = response.data.document._id;

                // Reset state
                setSelectedFile(null);
                setIsUploading(false);

                // Dismiss modal
                bottomSheetRef.current?.close();

                // Notify parent
                if (onUploadSuccess) {
                    onUploadSuccess(documentId);
                }

                Alert.alert(
                    "Upload Successful",
                    "Your document is being processed. You'll be notified when it's ready."
                );
            } catch (error: any) {
                console.error("Upload error:", error);
                console.error("Error details:", error.response?.data);
                setIsUploading(false);

                const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload document. Please try again.";
                Alert.alert("Upload Failed", errorMessage);

                if (onUploadError) {
                    onUploadError(errorMessage);
                }
            }
        };


        const formatFileSize = (bytes: number | undefined) => {
            if (!bytes) return "Unknown size";
            const mb = bytes / (1024 * 1024);
            if (mb < 1) {
                return `${(bytes / 1024).toFixed(1)} KB`;
            }
            return `${mb.toFixed(1)} MB`;
        };

        return (
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <Text style={styles.title}>Upload Document</Text>
                    <Text style={styles.subtitle}>
                        Select a PDF, DOCX, or TXT file to upload
                    </Text>

                    {/* File Selection */}
                    <TouchableOpacity
                        style={styles.pickButton}
                        onPress={handlePickDocument}
                        disabled={isUploading}
                    >
                        <Text style={styles.pickButtonText}>
                            {selectedFile ? "Change File" : "📄 Select File"}
                        </Text>
                    </TouchableOpacity>

                    {/* Selected File Display */}
                    {selectedFile && (
                        <View style={styles.fileInfo}>
                            <Text style={styles.fileName} numberOfLines={1}>
                                {selectedFile.name}
                            </Text>
                            <Text style={styles.fileSize}>
                                {formatFileSize(selectedFile.size)}
                            </Text>
                        </View>
                    )}

                    {/* Upload Button */}
                    <TouchableOpacity
                        style={[
                            styles.uploadButton,
                            (!selectedFile || isUploading) && styles.uploadButtonDisabled,
                        ]}
                        onPress={handleUpload}
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.uploadButtonText}>Upload</Text>
                        )}
                    </TouchableOpacity>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            setSelectedFile(null);
                            bottomSheetRef.current?.close();
                        }}
                        disabled={isUploading}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheet>
        );
    }
);

DocumentUploadModal.displayName = "DocumentUploadModal";

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleIndicator: {
        backgroundColor: "#ddd",
        width: 40,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    title: {
        fontSize: 24,
        fontFamily: "Outfit_500Medium",
        color: "#1f1f1f",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Outfit_400Regular",
        color: "#666",
        marginBottom: 24,
    },
    pickButton: {
        backgroundColor: "#f0f4f9",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 16,
    },
    pickButtonText: {
        fontSize: 16,
        fontFamily: "Outfit_500Medium",
        color: "#1f1f1f",
    },
    fileInfo: {
        backgroundColor: "#f0f4f9",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    fileName: {
        fontSize: 16,
        fontFamily: "Outfit_500Medium",
        color: "#1f1f1f",
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 14,
        fontFamily: "Outfit_400Regular",
        color: "#666",
    },
    uploadButton: {
        backgroundColor: "#4285F4",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
    },
    uploadButtonDisabled: {
        backgroundColor: "#ccc",
    },
    uploadButtonText: {
        fontSize: 16,
        fontFamily: "Outfit_500Medium",
        color: "#fff",
    },
    cancelButton: {
        paddingVertical: 16,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: "Outfit_400Regular",
        color: "#666",
    },
});

export default DocumentUploadModal;
