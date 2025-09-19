import { Text, View, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles";

const AuthPage = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authContainer}>
        <View style={{gap: 4}}>
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
          <Text style={styles.authSubTitle}>Create an account or log in to explore about our app</Text>
        </View>

        
      </View>
    </SafeAreaView>
  );
};

export default AuthPage;
