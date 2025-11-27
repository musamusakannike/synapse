import React, { useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface QuizSettings {
    numberOfQuestions: number;
    difficulty: string;
    includeCalculations: boolean;
    timeLimit?: number;
}

interface QuizAttachmentProps {
    quizId: string;
    title: string;
    questions: any[];
    settings: QuizSettings;
    onStartQuiz: (quizId: string) => void;
}

const QuizAttachment: React.FC<QuizAttachmentProps> = ({
    quizId,
    title,
    questions,
    settings,
    onStartQuiz,
}) => {
    const { colors, isDark } = useTheme();
    
    const handleStartQuiz = useCallback(() => {
        onStartQuiz(quizId);
    }, [quizId, onStartQuiz]);

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

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.card : '#f0f4ff', borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>📝</Text>
                </View>
                <View style={styles.headerContent}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                        {title}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Quiz • {questions.length} question{questions.length !== 1 ? "s" : ""}
                    </Text>
                </View>
            </View>

            {/* Quiz Details */}
            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Difficulty</Text>
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
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Questions</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{questions.length}</Text>
                    </View>
                </View>

                {settings.includeCalculations && (
                    <View style={[styles.featureBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>🧮 Includes Calculations</Text>
                    </View>
                )}

                {settings.timeLimit && (
                    <View style={[styles.featureBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                            ⏱️ Time Limit: {settings.timeLimit} minutes
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.startButton]}
                    onPress={handleStartQuiz}
                    activeOpacity={0.7}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.startButtonText}>Start Quiz</Text>
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
    featureBadge: {
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
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
    startButton: {
        backgroundColor: "#4285F4",
    },
    startButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Outfit_500Medium",
    },
});

export default QuizAttachment;
