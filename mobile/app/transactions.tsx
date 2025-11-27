import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { SubscriptionAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface Transaction {
  _id: string;
  plan: string;
  duration: string;
  amount: number;
  currency: string;
  status: string;
  startsAt: string;
  expiresAt: string;
  paymentMethod?: string;
  createdAt: string;
  txRef: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { colors, isDark } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
      router.back();
      return;
    }

    loadTransactions();
    headerOpacity.value = withSpring(1, { duration: 800 });
  }, [isAuthenticated, openAuthModal, router, loadTransactions, headerOpacity]);

  const loadTransactions = useCallback(async () => {
    try {
      const response = await SubscriptionAPI.getHistory();
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
      Alert.alert("Error", "Failed to load transaction history");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTransactions();
  }, [loadTransactions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === "NGN") {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case "day":
        return "1 Day";
      case "week":
        return "1 Week";
      case "month":
        return "1 Month";
      default:
        return duration;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
        return "#4caf50";
      case "pending":
        return "#ff9800";
      case "failed":
        return "#f44336";
      case "cancelled":
        return "#9e9e9e";
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "successful":
        return "checkmark-circle";
      case "pending":
        return "time";
      case "failed":
        return "close-circle";
      case "cancelled":
        return "ban";
      default:
        return "help-circle";
    }
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionTitleRow}>
          <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
          <View style={styles.transactionTitleContent}>
            <Text style={[styles.transactionPlan, { color: colors.text }]}>
              {item.plan} Plan
            </Text>
            <Text style={[styles.transactionDuration, { color: colors.textSecondary }]}>
              {getDurationLabel(item.duration)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.transactionDetails, { borderTopColor: colors.border }]}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {formatPrice(item.amount, item.currency)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {formatDate(item.createdAt)} at {formatTime(item.createdAt)}
          </Text>
        </View>

        {item.paymentMethod && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Method</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.paymentMethod.charAt(0).toUpperCase() + item.paymentMethod.slice(1)}
            </Text>
          </View>
        )}

        {item.status === "successful" && item.startsAt && item.expiresAt && (
          <>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Valid From</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(item.startsAt)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Valid Until</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(item.expiresAt)}
              </Text>
            </View>
          </>
        )}

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Reference</Text>
          <Text style={[styles.detailValueSmall, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.txRef}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary}15` }]}>
        <Ionicons name="receipt-outline" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Transactions Yet</Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Your subscription transactions will appear here once you make a purchase.
      </Text>
      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={() => router.push("/subscription")}
      >
        <Text style={styles.subscribeButtonText}>View Plans</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderTransaction}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontSize: 16, fontFamily: "Outfit_400Regular" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600", fontFamily: "Outfit_500Medium" },
  headerSpacer: { width: 40 },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyListContent: { flex: 1 },
  transactionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  transactionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transactionTitleContent: {
    gap: 2,
  },
  transactionPlan: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  transactionDuration: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  transactionDetails: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Outfit_500Medium",
  },
  detailValueSmall: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    maxWidth: "60%",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Outfit_400Regular",
    marginBottom: 24,
  },
  subscribeButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
});
