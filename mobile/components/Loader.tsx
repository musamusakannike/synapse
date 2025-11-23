import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

type LoaderProps = {
    size?: "xs" | "sm" | "md" | "lg";
    color?: string;
};

const Loader: React.FC<LoaderProps> = ({ size = "md", color = "#4285F4" }) => {
    const sizeMap = {
        xs: 16,
        sm: 24,
        md: 32,
        lg: 48,
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size={sizeMap[size]} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
});

export default Loader;
