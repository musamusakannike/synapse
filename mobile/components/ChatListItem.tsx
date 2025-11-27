import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ChatListItemProps {
    id: string;
    title: string;
    lastMessage: {
        content: string;
        timestamp: string;
    } | null;
    isArchived?: boolean;
    isFavorite?: boolean;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onPress: () => void;
    onLongPress?: () => void;
    onDelete: () => void;
    onEdit?: (newTitle: string) => void;
    onArchive?: () => void;
    onFavorite?: () => void;
    onSelect?: () => void;
    index: number;
    peekHintActive?: boolean;
    onPeekHintComplete?: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
    id,
    title,
    lastMessage,
    isArchived = false,
    isFavorite = false,
    isSelectionMode = false,
    isSelected = false,
    onPress,
    onLongPress,
    onDelete,
    onEdit,
    onArchive,
    onFavorite,
    onSelect,
    onPeekHintComplete,
    index,
    peekHintActive,
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const swipeableRef = useRef<Swipeable | null>(null);
    const hasRunPeekRef = useRef(false);
    const { colors } = useTheme();

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleEditSubmit = () => {
        if (editedTitle.trim() && onEdit) {
            onEdit(editedTitle.trim());
            setShowEditModal(false);
        }
    };

    useEffect(() => {
        if (!peekHintActive || hasRunPeekRef.current) {
            return;
        }

        hasRunPeekRef.current = true;

        let openTimeout: number | undefined;
        let closeTimeout: number | undefined;

        openTimeout = setTimeout(() => {
            if (!swipeableRef.current) return;

            swipeableRef.current.openRight();

            closeTimeout = setTimeout(() => {
                swipeableRef.current?.close();
                if (onPeekHintComplete) {
                    onPeekHintComplete();
                }
            }, 800);
        }, 300);

        return () => {
            if (openTimeout) clearTimeout(openTimeout);
            if (closeTimeout) clearTimeout(closeTimeout);
        };
    }, [peekHintActive, onPeekHintComplete]);

    const renderRightActions = () => (
        <View style={styles.actionsContainer}>
            {onEdit && (
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => setShowEditModal(true)}
                >
                    <FontAwesome name="edit" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
            )}
            {onArchive && (
                <TouchableOpacity
                    style={[styles.actionButton, styles.archiveButton]}
                    onPress={onArchive}
                >
                    <FontAwesome name={isArchived ? "inbox" : "archive"} size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                        {isArchived ? "Unarchive" : "Archive"}
                    </Text>
                </TouchableOpacity>
            )}
            {onFavorite && (
                <TouchableOpacity
                    style={[styles.actionButton, styles.favoriteButton]}
                    onPress={onFavorite}
                >
                    <FontAwesome name={isFavorite ? "star" : "star-o"} size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                        {isFavorite ? "Unfavorite" : "Favorite"}
                    </Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
            >
                <FontAwesome name="trash" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const handleItemPress = () => {
        if (isSelectionMode && onSelect) {
            onSelect();
        } else {
            onPress();
        }
    };

    return (
        <>
            <Animated.View entering={FadeInRight.delay(index * 50)}>
                <Swipeable
                    ref={swipeableRef}
                    renderRightActions={renderRightActions}
                    enabled={!isSelectionMode}
                >
                    <TouchableOpacity
                        style={[
                            styles.container,
                            { backgroundColor: colors.background },
                            isSelected && [styles.selectedContainer, { backgroundColor: colors.inputBackground }]
                        ]}
                        onPress={handleItemPress}
                        onLongPress={onLongPress || onSelect}
                        activeOpacity={0.7}
                    >
                        {isSelectionMode && (
                            <View style={styles.checkboxContainer}>
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: colors.border },
                                    isSelected && styles.checkboxSelected
                                ]}>
                                    {isSelected && (
                                        <FontAwesome name="check" size={14} color="#fff" />
                                    )}
                                </View>
                            </View>
                        )}
                        <View style={styles.content}>
                            <View style={styles.titleRow}>
                                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                                    {title}
                                </Text>
                                <View style={styles.indicators}>
                                    {isFavorite && (
                                        <FontAwesome
                                            name="star"
                                            size={14}
                                            color="#FFB800"
                                            style={styles.indicator}
                                        />
                                    )}
                                    {isArchived && (
                                        <FontAwesome
                                            name="archive"
                                            size={14}
                                            color={colors.textSecondary}
                                            style={styles.indicator}
                                        />
                                    )}
                                </View>
                            </View>
                            {lastMessage && (
                                <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
                                    {lastMessage.content}
                                </Text>
                            )}
                        </View>
                        {lastMessage && (
                            <Text style={[styles.timestamp, { color: colors.placeholder }]}>
                                {formatTimestamp(lastMessage.timestamp)}
                            </Text>
                        )}
                    </TouchableOpacity>
                </Swipeable>
            </Animated.View>

            {/* Edit Title Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Chat Title</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                            value={editedTitle}
                            onChangeText={setEditedTitle}
                            placeholder="Enter chat title"
                            placeholderTextColor={colors.placeholder}
                            autoFocus
                            onSubmitEditing={handleEditSubmit}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: colors.inputBackground }]}
                                onPress={() => {
                                    setEditedTitle(title);
                                    setShowEditModal(false);
                                }}
                            >
                                <Text style={[styles.modalButtonTextCancel, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSave]}
                                onPress={handleEditSubmit}
                            >
                                <Text style={styles.modalButtonTextSave}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    selectedContainer: {
        backgroundColor: '#f0f4f9',
    },
    checkboxContainer: {
        marginRight: 12,
        justifyContent: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: '#1f1f1f',
        flex: 1,
    },
    indicators: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    indicator: {
        marginLeft: 6,
    },
    preview: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#666',
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: '#999',
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
    },
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        paddingHorizontal: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Outfit_500Medium',
        marginTop: 4,
    },
    editButton: {
        backgroundColor: '#4285F4',
    },
    archiveButton: {
        backgroundColor: '#FF9500',
    },
    favoriteButton: {
        backgroundColor: '#FFB800',
    },
    deleteButton: {
        backgroundColor: '#ff3b30',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Outfit_600SemiBold',
        color: '#1f1f1f',
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: '#f0f4f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#1f1f1f',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#f0f0f0',
    },
    modalButtonSave: {
        backgroundColor: '#4285F4',
    },
    modalButtonTextCancel: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
    },
    modalButtonTextSave: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
    },
});

export default ChatListItem;
