import React, { useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

interface Flashcard {
    front: string;
    back: string;
    difficulty: "easy" | "medium" | "hard";
    tags?: string[];
}

interface FlashcardSettings {
    numberOfCards: number;
    difficulty: string;
    includeDefinitions: boolean;
    includeExamples: boolean;
}

interface FlashcardAttachmentProps {
    flashcardSetId: string;
    title: string;
    flashcards: Flashcard[];
    settings?: FlashcardSettings;
    onStudyFlashcards: (flashcardSetId: string) => void;
}

const FlashcardAttachment: React.FC<FlashcardAttachmentProps> = ({
    flashcardSetId,
    title,
    flashcards,
    settings,
    onStudyFlashcards,
}) => {
    const handleStudyFlashcards = useCallback(() => {
        onStudyFlashcards(flashcardSetId);
    }, [flashcardSetId, onStudyFlashcards]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy":
                return "#34A853";
            case "medium":
                return "#FBBC04";
            case "hard":
                return "#EA4335";
            default:
                return "#4285F4";
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        if (difficulty === "mixed") return "Mixed Difficulty";
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    };

    // Get first 3 flashcards for preview
    const previewCards = flashcards.slice(0, 3);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🃏</Text>
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>
                    <Text style={styles.subtitle}>
                        Flashcards • {flashcards.length} card{flashcards.length !== 1 ? "s" : ""}
                    </Text>
                </View>
            </View>

            {/* Flashcard Preview */}
            <View style={styles.previewContainer}>
                {previewCards.map((card, index) => (
                    <View key={index} style={styles.previewCard}>
                        <View style={styles.previewCardFront}>
                            <Text style={styles.previewCardText} numberOfLines={2}>
                                {card.front}
                            </Text>
                        </View>
                        <View 
                            style={[
                                styles.difficultyDot,
                                { backgroundColor: getDifficultyColor(card.difficulty) }
                            ]} 
                        />
                    </View>
                ))}
                {flashcards.length > 3 && (
                    <View style={styles.moreCards}>
                        <Text style={styles.moreCardsText}>
                            +{flashcards.length - 3} more
                        </Text>
                    </View>
                )}
            </View>

            {/* Details */}
            {settings && (
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Difficulty</Text>
                            <View
                                style={[
                                    styles.difficultyBadge,
                                    { backgroundColor: getDifficultyColor(settings.difficulty) + "20" },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.difficultyText,
                                        { color: getDifficultyColor(settings.difficulty) },
                                    ]}
                                >
                                    {getDifficultyLabel(settings.difficulty)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Cards</Text>
                            <Text style={styles.detailValue}>{flashcards.length}</Text>
                        </View>
                    </View>

                    <View style={styles.featuresRow}>
                        {settings.includeDefinitions && (
                            <View style={styles.featureBadge}>
                                <Text style={styles.featureText}>📖 Definitions</Text>
                            </View>
                        )}
                        {settings.includeExamples && (
                            <View style={styles.featureBadge}>
                                <Text style={styles.featureText}>💡 Examples</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.studyButton]}
                    onPress={handleStudyFlashcards}
                    activeOpacity={0.7}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.studyButtonText}>📚 Study Now</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f0f4ff",
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#d0e0ff",
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
    previewContainer: {
        marginBottom: 16,
        gap: 8,
    },
    previewCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#d0e0ff",
    },
    previewCardFront: {
        flex: 1,
    },
    previewCardText: {
        fontSize: 14,
        color: "#333",
        fontFamily: "Outfit_400Regular",
    },
    difficultyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    moreCards: {
        alignItems: "center",
        paddingVertical: 8,
    },
    moreCardsText: {
        fontSize: 13,
        color: "#4285F4",
        fontFamily: "Outfit_500Medium",
    },
    detailsContainer: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 6,
        fontFamily: "Outfit_400Regular",
    },
    detailValue: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f1f1f",
        fontFamily: "Outfit_500Medium",
    },
    difficultyBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    difficultyText: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Outfit_500Medium",
    },
    featuresRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    featureBadge: {
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d0e0ff",
    },
    featureText: {
        fontSize: 13,
        color: "#666",
        fontFamily: "Outfit_400Regular",
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
    studyButton: {
        backgroundColor: "#4285F4",
    },
    studyButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Outfit_500Medium",
    },
});

export default FlashcardAttachment;
