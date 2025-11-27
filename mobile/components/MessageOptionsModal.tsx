import React, { useMemo, forwardRef, useImperativeHandle } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Share,
} from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
    messageContent: string;
    messageRole: "user" | "assistant";
    messageIndex: number;
    onOptionSelected?: () => void;
    onEdit?: () => void;
    onRegenerate?: () => void;
    onFocusView?: () => void;
};

export type MessageOptionsModalRef = {
    present: () => void;
    dismiss: () => void;
};

const MessageOptionsModal = forwardRef<MessageOptionsModalRef, Props>(
    ({ messageContent, messageRole, messageIndex, onOptionSelected, onEdit, onRegenerate, onFocusView }, ref) => {
        const { colors } = useTheme();
        const bottomSheetRef = React.useRef<BottomSheet>(null);

        // Snap points for the bottom sheet
        const snapPoints = useMemo(() => ["30%"], []);

        // Expose methods to parent component
        useImperativeHandle(ref, () => ({
            present: () => bottomSheetRef.current?.expand(),
            dismiss: () => bottomSheetRef.current?.close(),
        }));

        const handleCopyToClipboard = async () => {
            try {
                await Clipboard.setStringAsync(messageContent);
                bottomSheetRef.current?.close();
                onOptionSelected?.();
            } catch (error) {
                console.error("Error copying to clipboard:", error);
            }
        };

        const handleShare = async () => {
            try {
                await Share.share({
                    message: messageContent,
                });
                bottomSheetRef.current?.close();
                onOptionSelected?.();
            } catch (error) {
                console.error("Error sharing:", error);
            }
        };

        const handleEdit = () => {
            bottomSheetRef.current?.close();
            onEdit?.();
        };

        const handleRegenerate = () => {
            bottomSheetRef.current?.close();
            onRegenerate?.();
        };

        const handleFocusView = () => {
            bottomSheetRef.current?.close();
            onFocusView?.();
        };

        const renderBackdrop = React.useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.6}
                />
            ),
            []
        );

        return (
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backdropComponent={renderBackdrop}
                backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: colors.background }]}
                handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
            >
                <BottomSheetView style={styles.container}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Message Options</Text>
                        <TouchableOpacity
                            onPress={() => bottomSheetRef.current?.close()}
                            style={styles.closeButton}
                        >
                            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {messageRole === "user" && onEdit && (
                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: colors.inputBackground }]}
                                onPress={handleEdit}
                            >
                                <Text style={styles.optionIcon}>✏️</Text>
                                <Text style={[styles.optionText, { color: colors.text }]}>Edit Message</Text>
                            </TouchableOpacity>
                        )}

                        {onFocusView && (
                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: colors.inputBackground }]}
                                onPress={handleFocusView}
                            >
                                <Text style={styles.optionIcon}>🔍</Text>
                                <Text style={[styles.optionText, { color: colors.text }]}>View in Focus Mode</Text>
                            </TouchableOpacity>
                        )}

                        {messageRole === "assistant" && onRegenerate && (
                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: colors.inputBackground }]}
                                onPress={handleRegenerate}
                            >
                                <Text style={styles.optionIcon}>🔄</Text>
                                <Text style={[styles.optionText, { color: colors.text }]}>Regenerate Response</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.optionButton, { backgroundColor: colors.inputBackground }]}
                            onPress={handleCopyToClipboard}
                        >
                            <Text style={styles.optionIcon}>📋</Text>
                            <Text style={[styles.optionText, { color: colors.text }]}>Copy to Clipboard</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, { backgroundColor: colors.inputBackground }]}
                            onPress={handleShare}
                        >
                            <Text style={styles.optionIcon}>📤</Text>
                            <Text style={[styles.optionText, { color: colors.text }]}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handleIndicator: {
        backgroundColor: "#ccc",
        width: 40,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1f1f1f",
        fontFamily: "Outfit_500Medium",
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 24,
        color: "#666",
    },
    optionsContainer: {
        padding: 20,
        gap: 12,
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: "#f0f4f9",
        borderRadius: 12,
    },
    optionIcon: {
        fontSize: 24,
    },
    optionText: {
        fontSize: 16,
        color: "#1f1f1f",
        fontFamily: "Outfit_500Medium",
    },
});

MessageOptionsModal.displayName = "MessageOptionsModal";

export default MessageOptionsModal;
