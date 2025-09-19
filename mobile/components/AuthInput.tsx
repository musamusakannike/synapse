import { Text, TextInput, View, TextInputProps } from "react-native";
import React from "react";
import { styles } from "@/styles";

const AuthInput = ({
  placeholder,
  label,
  type = "default",
  value,
  onChangeText,
  ...props
}: {
  placeholder: string;
  label: string;
  type?: string;
  value: string;
  onChangeText: (text: string) => void;
} & TextInputProps) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.authInput}
          placeholder={placeholder}
          placeholderTextColor={"#666"}
          keyboardType={type === "email" ? "email-address" : "default"}
          secureTextEntry={type === "password"}
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
    </View>
  );
};

export default AuthInput;
