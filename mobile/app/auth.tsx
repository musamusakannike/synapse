import {
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles";
import AuthInput from "@/components/AuthInput";
import { signIn, signUp } from "../lib/appwrite";
import { useRouter } from "expo-router";

const AuthPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setIsSubmitting(true);
    try {
      if (authMode === "signup") {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.authContainer}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.authContent}>
            {/* Header Section with improved spacing and visual hierarchy */}
            <View style={styles.authHeader}>
              <View style={styles.logoContainer}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={require("@/assets/images/logo.png")}
                    width={50}
                    height={50}
                    style={styles.authLogo}
                  />
                </View>
                <Text style={styles.brandText}>Synapse</Text>
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.authTitle}>
                  {authMode === "signup" ? "Get Started now" : "Welcome back"}
                </Text>
                <Text style={styles.authSubTitle}>
                  {authMode === "signup"
                    ? "Create an account or log in to explore about our app"
                    : "Log in to your account"}
                </Text>
              </View>
            </View>

            {/* Form Section with improved layout */}
            <View style={styles.formSection}>
              {authMode === "signup" && (
                <AuthInput
                  label="Name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                />
              )}
              <AuthInput
                label="Email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChangeText={setEmail}
              />
              <AuthInput
                label="Password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Button Section */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.authButton}
              activeOpacity={0.9}
              onPress={handleAuth}
              disabled={isSubmitting}
            >
              <Text style={styles.authButtonText}>
                {isSubmitting
                  ? "Submitting..."
                  : authMode === "signup"
                  ? "Sign Up"
                  : "Login"}
              </Text>
            </TouchableOpacity>

            {/* Additional sign in option */}
            <View style={styles.signInSection}>
              <Text style={styles.signInText}>
                {authMode === "signup"
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setAuthMode(authMode === "signup" ? "login" : "signup");
                }}
              >
                <Text style={styles.signInLink}>
                  {authMode === "signup" ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthPage;