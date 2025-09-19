import { Text, TextInput, View } from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles";

const AuthInput = ({
  placeholder,
  label,
  type = "default",
  value,
  onChangeText,
}: {
  placeholder: string;
  label: string;
  type?: string;
  value: string;
  onChangeText: (text: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}
      >
        <TextInput
          style={styles.authInput}
          placeholder={placeholder}
          placeholderTextColor={"#666"}
          keyboardType={type === "email" ? "email-address" : "default"}
          secureTextEntry={type === "password"}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

export default AuthInput;
