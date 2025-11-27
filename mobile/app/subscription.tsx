import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
  FadeInDown,
} from "react-native-reanimated";
import { SubscriptionAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  pricing: {
    day: number;
    week: number;
    month: number;
  };
}

interface SubscriptionStatus {
  tier: string;
  expiresAt: string | null;
  isActive: boolean;
}

type Duration = "day" | "week" | "month";

const FEATURES = [
  { icon: "infinity", text: "Unlimited AI conversations" },
  { icon: "school-outline", text: "Unlimited course generation" },
  { icon: "help-circle-outline", text: "Unlimited quiz creation" },
  { icon: "albums-outline", text: "Unlimited flashcards" },
  { icon: "document-text-outline", text: "Unlimited document uploads" },
  { icon: "flash-outline", text: "Priority response times" },
  { icon: "sparkles-outline", text: "Access to premium features" },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { colors, isDark } = useTheme();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration>("month");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
      router.back();
      return;
    }

    loadData();
    headerOpacity.value = withSpring(1, { duration: 800 });
    contentOpacity.value = withDelay(200, withSpring(1, { duration: 800 }));
  }, [isAuthenticated, openAuthModal, router, loadData, headerOpacity, contentOpacity]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [plansResponse, statusResponse] = await Promise.all([
        SubscriptionAPI.getPlans(),
        SubscriptionAPI.getStatus(),
      ]);
      setPlans(plansResponse.data.data || []);
      setStatus(statusResponse.data.data || null);
    } catch (error) {
      console.error("Error loading subscription data:", error);
      Alert.alert("Error", "Failed to load subscription information");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (!plans.length) return;

    setIsProcessing(true);
    try {
      const response = await SubscriptionAPI.initiatePayment("GURU", selectedDuration);
      const { paymentLink } = response.data.data;

      if (paymentLink) {
        // Open payment link in in-app browser
        const result = await WebBrowser.openBrowserAsync(paymentLink, {
          dismissButtonStyle: "close",
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          toolbarColor: colors.background,
          controlsColor: colors.primary,
        });

        // Refresh status after returning from browser
        if (result.type === "dismiss" || result.type === "cancel") {
          await loadData();
        }
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      Alert.alert("Error", error.message || "Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  }, [plans, selectedDuration, colors, loadData]);

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDurationLabel = (duration: Duration) => {
    switch (duration) {
      case "day":
        return "Daily";
      case "week":
        return "Weekly";
      case "month":
        return "Monthly";
    }
  };

  const getSavingsPercentage = (duration: Duration) => {
    if (!plans.length) return 0;
    const plan = plans[0];
    const dailyRate = plan.pricing.day;
    
    switch (duration) {
      case "week":
        return Math.round((1 - plan.pricing.week / (dailyRate * 7)) * 100);
      case "month":
        return Math.round((1 - plan.pricing.month / (dailyRate * 30)) * 100);
      default:
        return 0;
    }
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: interpolate(contentOpacity.value, [0, 1], [30, 0]) }],
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading subscription info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentPlan = plans[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Subscription</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => router.push("/transactions")}>
          <Ionicons name="receipt-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentStyle}>
          {/* Current Status Card */}
          {status && (
            <View style={[styles.statusCard, { backgroundColor: status.isActive ? "#e8f5e9" : colors.card, borderColor: status.isActive ? "#81c784" : colors.border }]}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusBadge, { backgroundColor: status.isActive ? "#4caf50" : colors.textSecondary }]}>
                  <Text style={styles.statusBadgeText}>
                    {status.isActive ? "ACTIVE" : "FREE"}
                  </Text>
                </View>
                <Text style={[styles.statusTier, { color: status.isActive ? "#2e7d32" : colors.text }]}>
                  {status.tier} Plan
                </Text>
              </View>
              {status.isActive && status.expiresAt && (
                <Text style={[styles.statusExpiry, { color: "#558b2f" }]}>
                  Expires on {formatDate(status.expiresAt)}
                </Text>
              )}
              {!status.isActive && (
                <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
                  Upgrade to GURU for unlimited access
                </Text>
              )}
            </View>
          )}

          {/* Plan Card */}
          {currentPlan && (
            <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.planHeader}>
                <View style={styles.planTitleRow}>
                  <MaterialCommunityIcons name="crown" size={28} color="#FFD700" />
                  <Text style={[styles.planName, { color: colors.text }]}>{currentPlan.name}</Text>
                </View>
                <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
                  {currentPlan.description}
                </Text>
              </View>

              {/* Duration Selection */}
              <View style={styles.durationContainer}>
                {(["day", "week", "month"] as Duration[]).map((duration) => {
                  const isSelected = selectedDuration === duration;
                  const savings = getSavingsPercentage(duration);
                  
                  return (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationOption,
                        { borderColor: isSelected ? colors.primary : colors.border },
                        isSelected && { backgroundColor: `${colors.primary}10` },
                      ]}
                      onPress={() => setSelectedDuration(duration)}
                    >
                      {savings > 0 && (
                        <View style={styles.savingsBadge}>
                          <Text style={styles.savingsText}>Save {savings}%</Text>
                        </View>
                      )}
                      <Text style={[styles.durationLabel, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                        {getDurationLabel(duration)}
                      </Text>
                      <Text style={[styles.durationPrice, { color: isSelected ? colors.primary : colors.text }]}>
                        {formatPrice(currentPlan.pricing[duration])}
                      </Text>
                      {isSelected && (
                        <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                <Text style={[styles.featuresTitle, { color: colors.text }]}>What&apos;s included:</Text>
                {FEATURES.map((feature, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(index * 50).duration(400)}
                    style={styles.featureItem}
                  >
                    <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}15` }]}>
                      <Ionicons name={feature.icon as any} size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* Subscribe Button */}
          <TouchableOpacity
            style={[styles.subscribeButton, isProcessing && styles.subscribeButtonDisabled]}
            onPress={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={styles.processingContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.subscribeButtonText}> Processing...</Text>
              </View>
            ) : (
              <Text style={styles.subscribeButtonText}>
                {status?.isActive ? "Extend Subscription" : "Subscribe Now"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Subscription will be charged immediately upon confirmation.
          </Text>
        </Animated.View>
      </ScrollView>
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
  historyButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Outfit_500Medium",
  },
  statusTier: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Outfit_500Medium",
  },
  statusExpiry: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  planCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  planHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  planName: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Outfit_500Medium",
  },
  planDescription: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  durationContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
  },
  durationOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    position: "relative",
  },
  savingsBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#4caf50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savingsText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Outfit_500Medium",
  },
  durationLabel: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
    marginBottom: 4,
  },
  durationPrice: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Outfit_500Medium",
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featuresContainer: {
    padding: 20,
    paddingTop: 0,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    backgroundColor: "#ccc",
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  processingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "Outfit_400Regular",
  },
});
