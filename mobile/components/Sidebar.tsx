import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { ChatAPI } from '../lib/api';
import ChatListItem from './ChatListItem';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Chat {
    id: string;
    title: string;
    lastMessage: {
        content: string;
        timestamp: string;
    } | null;
    lastActivity: string;
}

export interface SidebarRef {
    open: () => void;
    close: () => void;
}

interface SidebarProps {
    onChatSelect?: (chatId: string) => void;
}

const Sidebar = forwardRef<SidebarRef, SidebarProps>(({ onChatSelect }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated, openAuthModal } = useAuth();

    const translateX = useSharedValue(-SCREEN_WIDTH);
    const backdropOpacity = useSharedValue(0);

    const open = () => {
        if (!isAuthenticated) {
            openAuthModal();
            return;
        }
        setIsOpen(true);
        translateX.value = withTiming(0, { duration: 300 });
        backdropOpacity.value = withTiming(1, { duration: 300 });
        fetchChats();
    };

    const close = () => {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        backdropOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(() => {
            runOnJS(setIsOpen)(false);
            runOnJS(setSearchQuery)('');
        }, 300);
    };

    useImperativeHandle(ref, () => ({
        open,
        close,
    }));

    const fetchChats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ChatAPI.getUserChats(1, 50);
            const chatData = response.data.chats.map((chat: any) => ({
                id: chat.id,
                title: chat.title,
                lastMessage: chat.lastMessage,
                lastActivity: chat.lastActivity,
            }));
            setChats(chatData);
            setFilteredChats(chatData);
        } catch (err: any) {
            console.error('Error fetching chats:', err);
            setError(err.message || 'Failed to load chats');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNewChat = async () => {
        try {
            const response = await ChatAPI.createNewChat('New Chat', 'general');
            const newChat = {
                id: response.data.chat.id,
                title: response.data.chat.title,
                lastMessage: null,
                lastActivity: response.data.chat.createdAt,
            };
            setChats([newChat, ...chats]);
            setFilteredChats([newChat, ...filteredChats]);

            if (onChatSelect) {
                onChatSelect(newChat.id);
            }
            close();
        } catch (err: any) {
            console.error('Error creating chat:', err);
        }
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            await ChatAPI.deleteChat(chatId);
            const updatedChats = chats.filter(chat => chat.id !== chatId);
            setChats(updatedChats);
            setFilteredChats(updatedChats.filter(chat =>
                chat.title.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        } catch (err: any) {
            console.error('Error deleting chat:', err);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredChats(chats);
        } else {
            const filtered = chats.filter(chat =>
                chat.title.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredChats(filtered);
        }
    };

    const handleChatPress = (chatId: string) => {
        if (onChatSelect) {
            onChatSelect(chatId);
        }
        close();
    };

    const sidebarStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, backdropStyle]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={close}
                    activeOpacity={1}
                />
            </Animated.View>

            {/* Sidebar */}
            <Animated.View style={[styles.sidebar, sidebarStyle]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Chats</Text>
                    <TouchableOpacity onPress={close} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search chats..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    <TouchableOpacity onPress={handleCreateNewChat} style={styles.newChatButton}>
                        <FontAwesome name="pencil-square-o" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Chat List */}
                <ScrollView
                    style={styles.chatList}
                    showsVerticalScrollIndicator={false}
                >
                    {isLoading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#4285F4" />
                        </View>
                    ) : error ? (
                        <View style={styles.centerContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={fetchChats} style={styles.retryButton}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredChats.length === 0 ? (
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No chats found' : 'No chats yet'}
                            </Text>
                            {!searchQuery && (
                                <Text style={styles.emptySubtext}>
                                    Create a new chat to get started
                                </Text>
                            )}
                        </View>
                    ) : (
                        filteredChats.map((chat, index) => (
                            <ChatListItem
                                key={chat.id}
                                id={chat.id}
                                title={chat.title}
                                lastMessage={chat.lastMessage}
                                onPress={() => handleChatPress(chat.id)}
                                onDelete={() => handleDeleteChat(chat.id)}
                                index={index}
                            />
                        ))
                    )}
                </ScrollView>
            </Animated.View>
        </>
    );
});

Sidebar.displayName = 'Sidebar';

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: SCREEN_WIDTH,
        backgroundColor: '#fff',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Outfit_500Medium',
        color: '#1f1f1f',
    },
    closeButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
        fontWeight: '300',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchInput: {
        backgroundColor: '#f0f4f9',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#1f1f1f',
        width: "90%"
    },
    newChatButton: {
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatList: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Outfit_500Medium',
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#999',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#ff3b30',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#4285F4',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
    },
});

export default Sidebar;
