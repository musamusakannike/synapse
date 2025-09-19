import {
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles";
import AuthInput from "@/components/AuthInput";

const AuthPage = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.authContainer}
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
              <Text style={styles.authTitle}>Get Started now</Text>
              <Text style={styles.authSubTitle}>
                Create an account or log in to explore about our app
              </Text>
            </View>
          </View>

          {/* Form Section with improved layout */}
          <View style={styles.formSection}>
            <AuthInput label="Name" placeholder="Enter your name" />
            <AuthInput label="Email" placeholder="Enter your email" type="email" />
            <AuthInput label="Password" placeholder="Enter your password" type="password" />
          </View>
        </View>

        {/* Button Section */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.authButton} activeOpacity={0.9}>
            <Text style={styles.authButtonText}>Continue</Text>
          </TouchableOpacity>
          
          {/* Additional sign in option */}
          <View style={styles.signInSection}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthPage;