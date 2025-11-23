import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface ChatListItemProps {
    id: string;
    title: string;
    lastMessage: {
        content: string;
        timestamp: string;
    } | null;
    onPress: () => void;
    onDelete: () => void;
    index: number;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
    title,
    lastMessage,
    onPress,
    onDelete,
    index,
}) => {
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

    const renderRightActions = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
    );

    return (
        <Animated.View entering={FadeInRight.delay(index * 50)}>
            <Swipeable renderRightActions={renderRightActions}>
                <TouchableOpacity style={styles.container} onPress={onPress}>
                    <View style={styles.content}>
                        <Text style={styles.title} numberOfLines={1}>
                            {title}
                        </Text>
                        {lastMessage && (
                            <Text style={styles.preview} numberOfLines={2}>
                                {lastMessage.content}
                            </Text>
                        )}
                    </View>
                    {lastMessage && (
                        <Text style={styles.timestamp}>
                            {formatTimestamp(lastMessage.timestamp)}
                        </Text>
                    )}
                </TouchableOpacity>
            </Swipeable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: '#1f1f1f',
        marginBottom: 4,
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
    deleteButton: {
        backgroundColor: '#ff3b30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
    },
});

export default ChatListItem;
