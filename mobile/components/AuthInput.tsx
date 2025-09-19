import { Text, TextInput, View } from "react-native";
import React from "react";
import { styles } from "@/styles";

const AuthInput = ({
  placeholder,
  label,
  type="default",
}: {
  placeholder: string;
  label: string;
  type?: string;
}) => {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.authText}>{label}</Text>
      <TextInput
        style={styles.authInput}
        placeholder={placeholder}
        placeholderTextColor={"#AAA"}
        keyboardType={type === "email" ? "email-address" : "default"}
        secureTextEntry={type === "password"}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

export default AuthInput;
