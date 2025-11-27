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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatAPI } from '../lib/api';
import ChatListItem from './ChatListItem';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Chat {
    id: string;
    title: string;
    lastMessage: {
        content: string;
        timestamp: string;
    } | null;
    lastActivity: string;
    isArchived?: boolean;
    isFavorite?: boolean;
}

export interface SidebarRef {
    open: () => void;
    close: () => void;
}

interface SidebarProps {
    onChatSelect?: (chatId: string) => void;
    onNewChat?: () => void;
}

type TabType = 'all' | 'favorites' | 'archived';

const Sidebar = forwardRef<SidebarRef, SidebarProps>(({ onChatSelect, onNewChat }, ref) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [chats, setChats] = useState<Chat[]>([]);
    const [favoriteChats, setFavoriteChats] = useState<Chat[]>([]);
    const [archivedChats, setArchivedChats] = useState<Chat[]>([]);
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
    const [shouldShowSwipeHint, setShouldShowSwipeHint] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { isAuthenticated, openAuthModal, isSubscribed } = useAuth();
    const { colors } = useTheme();

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
        (async () => {
            try {
                const value = await AsyncStorage.getItem('chat_swipe_hint_shown');
                if (value === 'true') {
                    setShouldShowSwipeHint(false);
                } else {
                    setShouldShowSwipeHint(true);
                }
            } catch (e) {
                console.error('Error reading swipe hint flag', e);
            }
        })();
    };

    const close = () => {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        backdropOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(() => {
            runOnJS(setIsOpen)(false);
            runOnJS(setSearchQuery)('');
            runOnJS(setSelectionMode)(false);
            runOnJS(setSelectedChats)(new Set());
            runOnJS(setShowDeleteConfirm)(false);
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
                isArchived: chat.isArchived || false,
                isFavorite: chat.isFavorite || false,
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

    const fetchFavoriteChats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ChatAPI.getFavoriteChats(1, 50);
            const chatData = response.data.chats.map((chat: any) => ({
                id: chat.id,
                title: chat.title,
                lastMessage: chat.lastMessage,
                lastActivity: chat.lastActivity,
                isArchived: chat.isArchived || false,
                isFavorite: chat.isFavorite || false,
            }));
            setFavoriteChats(chatData);
        } catch (err: any) {
            console.error('Error fetching favorite chats:', err);
            setError(err.message || 'Failed to load favorite chats');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchArchivedChats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ChatAPI.getArchivedChats(1, 50);
            const chatData = response.data.chats.map((chat: any) => ({
                id: chat.id,
                title: chat.title,
                lastMessage: chat.lastMessage,
                lastActivity: chat.lastActivity,
                isArchived: chat.isArchived || false,
                isFavorite: chat.isFavorite || false,
            }));
            setArchivedChats(chatData);
        } catch (err: any) {
            console.error('Error fetching archived chats:', err);
            setError(err.message || 'Failed to load archived chats');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setSearchQuery('');
        setSelectionMode(false);
        setSelectedChats(new Set());
        setShowDeleteConfirm(false);

        if (tab === 'favorites') {
            fetchFavoriteChats();
        } else if (tab === 'archived') {
            fetchArchivedChats();
        } else {
            fetchChats();
        }
    };

    const handleCreateNewChat = () => {
        // Call the new chat callback to reset AIInterface and close sidebar
        if (onNewChat) {
            onNewChat();
        }
        close();
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            await ChatAPI.deleteChat(chatId);
            updateChatLists(chatId, 'delete');
        } catch (err: any) {
            console.error('Error deleting chat:', err);
        }
    };

    const handleBulkDeletePress = () => {
        if (selectedChats.size > 0) {
            setShowDeleteConfirm(true);
        }
    };

    const confirmBulkDelete = async () => {
        if (selectedChats.size === 0) return;

        try {
            const chatIds = Array.from(selectedChats);
            await ChatAPI.bulkDeleteChats(chatIds);

            chatIds.forEach(chatId => updateChatLists(chatId, 'delete'));

            setSelectionMode(false);
            setSelectedChats(new Set());
            setShowDeleteConfirm(false);
        } catch (err: any) {
            console.error('Error bulk deleting chats:', err);
        }
    };

    const handleEditTitle = async (chatId: string, newTitle: string) => {
        try {
            await ChatAPI.updateChatTitle(chatId, newTitle);
            updateChatLists(chatId, 'update', { title: newTitle });
        } catch (err: any) {
            console.error('Error updating chat title:', err);
        }
    };

    const handleArchive = async (chatId: string, isCurrentlyArchived: boolean) => {
        try {
            if (isCurrentlyArchived) {
                await ChatAPI.unarchiveChat(chatId);
                updateChatLists(chatId, 'update', { isArchived: false });
            } else {
                await ChatAPI.archiveChat(chatId);
                updateChatLists(chatId, 'update', { isArchived: true });
            }

            // Refresh the current tab
            if (activeTab === 'archived') {
                fetchArchivedChats();
            } else {
                fetchChats();
            }
        } catch (err: any) {
            console.error('Error archiving chat:', err);
        }
    };

    const handleFavorite = async (chatId: string, isCurrentlyFavorite: boolean) => {
        try {
            if (isCurrentlyFavorite) {
                await ChatAPI.unfavoriteChat(chatId);
                updateChatLists(chatId, 'update', { isFavorite: false });
            } else {
                await ChatAPI.favoriteChat(chatId);
                updateChatLists(chatId, 'update', { isFavorite: true });
            }

            // Refresh the current tab
            if (activeTab === 'favorites') {
                fetchFavoriteChats();
            }
        } catch (err: any) {
            console.error('Error favoriting chat:', err);
        }
    };

    const updateChatLists = (chatId: string, action: 'delete' | 'update', updates?: Partial<Chat>) => {
        const updateList = (list: Chat[]) => {
            if (action === 'delete') {
                return list.filter(chat => chat.id !== chatId);
            } else if (action === 'update' && updates) {
                return list.map(chat =>
                    chat.id === chatId ? { ...chat, ...updates } : chat
                );
            }
            return list;
        };

        setChats(prev => updateList(prev));
        setFilteredChats(prev => updateList(prev));
        setFavoriteChats(prev => updateList(prev));
        setArchivedChats(prev => updateList(prev));
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const currentList = activeTab === 'favorites' ? favoriteChats :
            activeTab === 'archived' ? archivedChats : chats;

        if (query.trim() === '') {
            setFilteredChats(currentList);
        } else {
            const filtered = currentList.filter(chat =>
                chat.title.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredChats(filtered);
        }
    };

    const handleChatPress = (chatId: string) => {
        if (selectionMode) {
            handleSelect(chatId);
        } else {
            if (onChatSelect) {
                onChatSelect(chatId);
            }
            close();
        }
    };

    const handleLongPress = (chatId: string) => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedChats(new Set([chatId]));
        } else {
            handleSelect(chatId);
        }
    };

    const handleSelect = (chatId: string) => {
        setSelectedChats(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chatId)) {
                newSet.delete(chatId);
            } else {
                newSet.add(chatId);
            }

            // If no items selected, exit selection mode
            if (newSet.size === 0) {
                setSelectionMode(false);
            }

            return newSet;
        });
    };

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setSelectedChats(new Set());
        setShowDeleteConfirm(false);
    };

    const getCurrentChats = () => {
        if (activeTab === 'favorites') return favoriteChats;
        if (activeTab === 'archived') return archivedChats;
        return chats;
    };

    const getDisplayChats = () => {
        const currentChats = getCurrentChats();
        if (searchQuery.trim() === '') {
            return currentChats;
        }
        return filteredChats;
    };

    const sidebarStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    if (!isOpen) return null;

    const displayChats = getDisplayChats();

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
            <Animated.View style={[styles.sidebar, sidebarStyle, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Chats</Text>
                    <TouchableOpacity onPress={close} style={styles.closeButton}>
                        <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                        onPress={() => handleTabChange('all')}
                    >
                        <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'all' && styles.tabTextActive]}>
                            All Chats
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
                        onPress={() => handleTabChange('favorites')}
                    >
                        <FontAwesome
                            name="star"
                            size={14}
                            color={activeTab === 'favorites' ? '#4285F4' : colors.textSecondary}
                            style={styles.tabIcon}
                        />
                        <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'favorites' && styles.tabTextActive]}>
                            Favorites
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'archived' && styles.tabActive]}
                        onPress={() => handleTabChange('archived')}
                    >
                        <FontAwesome
                            name="archive"
                            size={14}
                            color={activeTab === 'archived' ? '#4285F4' : colors.textSecondary}
                            style={styles.tabIcon}
                        />
                        <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'archived' && styles.tabTextActive]}>
                            Archived
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search and Actions */}
                <View style={styles.searchContainer}>
                    {selectionMode ? (
                        <View style={styles.selectionHeader}>
                            <TouchableOpacity onPress={exitSelectionMode}>
                                <Text style={styles.selectionCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.selectionCount, { color: colors.text }]}>
                                {selectedChats.size} selected
                            </Text>
                        </View>
                    ) : (
                        <>
                            <TextInput
                                style={[styles.searchInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                placeholder="Search chats..."
                                placeholderTextColor={colors.placeholder}
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            <TouchableOpacity onPress={handleCreateNewChat} style={styles.newChatButton}>
                                <FontAwesome name="pencil-square-o" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </>
                    )}
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
                    ) : displayChats.length === 0 ? (
                        <View style={styles.centerContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {searchQuery ? 'No chats found' :
                                    activeTab === 'favorites' ? 'No favorite chats' :
                                        activeTab === 'archived' ? 'No archived chats' : 'No chats yet'}
                            </Text>
                            {!searchQuery && activeTab === 'all' && (
                                <Text style={[styles.emptySubtext, { color: colors.placeholder }]}>
                                    Create a new chat to get started
                                </Text>
                            )}
                        </View>
                    ) : (
                        displayChats.map((chat, index) => (
                            <ChatListItem
                                key={chat.id}
                                id={chat.id}
                                title={chat.title}
                                lastMessage={chat.lastMessage}
                                isArchived={chat.isArchived}
                                isFavorite={chat.isFavorite}
                                isSelectionMode={selectionMode}
                                isSelected={selectedChats.has(chat.id)}
                                onPress={() => handleChatPress(chat.id)}
                                onLongPress={() => handleLongPress(chat.id)}
                                onDelete={() => handleDeleteChat(chat.id)}
                                onEdit={(newTitle) => handleEditTitle(chat.id, newTitle)}
                                onArchive={() => handleArchive(chat.id, chat.isArchived || false)}
                                onFavorite={() => handleFavorite(chat.id, chat.isFavorite || false)}
                                onSelect={() => handleSelect(chat.id)}
                                index={index}
                                peekHintActive={shouldShowSwipeHint && index === 0 && !selectionMode}
                                onPeekHintComplete={index === 0 ? async () => {
                                    setShouldShowSwipeHint(false);
                                    try {
                                        await AsyncStorage.setItem('chat_swipe_hint_shown', 'true');
                                    } catch (e) {
                                        console.error('Error saving swipe hint flag', e);
                                    }
                                } : undefined}
                            />
                        ))
                    )}
                </ScrollView>

                {/* Subscription Button - Only show for non-subscribed users */}
                {!selectionMode && !isSubscribed && (
                    <View style={[styles.subscriptionContainer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={styles.subscriptionButton}
                            onPress={() => {
                                close();
                                router.push('/subscription');
                            }}
                        >
                            <Ionicons name="diamond" size={20} color="#FFD700" />
                            <View style={styles.subscriptionTextContainer}>
                                <Text style={styles.subscriptionTitle}>Upgrade to GURU</Text>
                                <Text style={[styles.subscriptionSubtitle, { color: colors.textSecondary }]}>Unlock unlimited features</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Bulk Delete Button */}
                {selectionMode && selectedChats.size > 0 && (
                    <View style={[styles.bulkActionContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                        <TouchableOpacity
                            style={styles.bulkDeleteButton}
                            onPress={handleBulkDeletePress}
                        >
                            <FontAwesome name="trash" size={20} color="#fff" />
                            <Text style={styles.bulkDeleteText}>
                                Delete {selectedChats.size} chat{selectedChats.size > 1 ? 's' : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <View style={styles.confirmOverlay}>
                        <View style={[styles.confirmSheet, { backgroundColor: colors.card }]}>
                            <View style={styles.confirmHeader}>
                                <Text style={[styles.confirmTitle, { color: colors.text }]}>Delete Chats?</Text>
                                <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                                    Are you sure you want to delete {selectedChats.size} selected chat{selectedChats.size > 1 ? 's' : ''}? This action cannot be undone.
                                </Text>
                            </View>
                            <View style={styles.confirmActions}>
                                <TouchableOpacity
                                    style={[styles.cancelButton, { backgroundColor: colors.inputBackground }]}
                                    onPress={() => setShowDeleteConfirm(false)}
                                >
                                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteConfirmButton}
                                    onPress={confirmBulkDelete}
                                >
                                    <Text style={styles.deleteConfirmText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
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
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#4285F4',
    },
    tabIcon: {
        marginRight: 4,
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#999',
    },
    tabTextActive: {
        fontFamily: 'Outfit_500Medium',
        color: '#4285F4',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectionHeader: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectionCancel: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: '#4285F4',
    },
    selectionCount: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: '#1f1f1f',
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
    bulkActionContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    bulkDeleteButton: {
        backgroundColor: '#ff3b30',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bulkDeleteText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        marginLeft: 8,
    },
    confirmOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        zIndex: 1100,
    },
    confirmSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    confirmHeader: {
        marginBottom: 24,
    },
    confirmTitle: {
        fontSize: 20,
        fontFamily: 'Outfit_600SemiBold',
        color: '#1f1f1f',
        marginBottom: 8,
        textAlign: 'center',
    },
    confirmMessage: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f4f9',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: '#666',
    },
    deleteConfirmButton: {
        flex: 1,
        backgroundColor: '#ff3b30',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteConfirmText: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: '#fff',
    },
    subscriptionContainer: {
        padding: 16,
        borderTopWidth: 1,
    },
    subscriptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 12,
    },
    subscriptionTextContainer: {
        flex: 1,
    },
    subscriptionTitle: {
        fontSize: 15,
        fontFamily: 'Outfit_500Medium',
        color: '#1f1f1f',
    },
    subscriptionSubtitle: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: '#666',
        marginTop: 2,
    },
});

export default Sidebar;
