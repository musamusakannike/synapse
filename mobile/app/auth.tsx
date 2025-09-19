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
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("@/assets/images/logo.png")}
              width={50}
              height={50}
              style={styles.authLogo}
            />
            <Text style={styles.authText}>Synapse</Text>
          </View>
          <Text style={styles.authTitle}>Get Started now</Text>
          <Text style={styles.authSubTitle}>
            Create an account or log in to explore about our app
          </Text>

          <View style={{ gap: 18, paddingLeft: 8, marginTop: 30 }}>
            <AuthInput label="Name" placeholder="Enter your name" />
            <AuthInput label="Email" placeholder="Enter your email" />
            <AuthInput label="Password" placeholder="Enter your password" />
          </View>
        </View>

        <TouchableOpacity style={styles.authButton}>
          <Text style={styles.authButtonText}>Continue</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthPage;
