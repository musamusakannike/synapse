import { styles } from "@/styles";
import {
  KeyboardAvoidingView,
  Text,
  View,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import useWebsiteGen from "@/lib/useWebsiteGen";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from "expo-router";

export default function WebsiteGeneration() {
  const [prompt, setPrompt] = useState("");
  const [websiteType, setWebsiteType] = useState("simple");
  const { loading, generatedWebsite, error, generateWebsite, clearWebsite } = useWebsiteGen();
  const { user } = useAuth();
  const router = useRouter();

  const websiteTypes = [
    { id: "simple", name: "Simple Website", description: "Basic static website" },
    { id: "interactive", name: "Interactive", description: "Website with JavaScript functionality" },
    { id: "dashboard", name: "Dashboard", description: "Data visualization dashboard" },
    { id: "landing", name: "Landing Page", description: "Marketing/promotional page" },
  ];

  const handleGenerate = async () => {
    if (prompt.trim()) {
      await generateWebsite(prompt, websiteType);
    }
  };

  const handlePreview = async () => {
    if (generatedWebsite?.htmlCode) {
      try {
        // Create a data URL from the HTML code
        const htmlBlob = `data:text/html;charset=utf-8,${encodeURIComponent(generatedWebsite.htmlCode)}`;
        
        // Open in web browser
        await WebBrowser.openBrowserAsync(htmlBlob, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          controlsColor: '#007AFF',
          toolbarColor: '#000000',
        });
      } catch (error) {
        console.error('Error opening website preview:', error);
        Alert.alert('Error', 'Failed to open website preview');
      }
    }
  };

  const handleSaveHTML = () => {
    if (generatedWebsite?.htmlCode) {
      // For now, just show an alert with instructions
      Alert.alert(
        "Save Website",
        "To save this website:\n\n1. Copy the HTML code\n2. Create a new .html file on your computer\n3. Paste the code and save\n4. Open the file in any web browser",
        [
          { text: "OK", style: "default" }
        ]
      );
    }
  };

  const renderWebsiteTypeSelector = () => (
    <View style={styles.websiteTypeContainer}>
      <Text style={styles.sectionTitle}>Website Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {websiteTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.websiteTypeChip,
              websiteType === type.id && styles.websiteTypeChipSelected
            ]}
            onPress={() => setWebsiteType(type.id)}
          >
            <Text style={[
              styles.websiteTypeChipText,
              websiteType === type.id && styles.websiteTypeChipTextSelected
            ]}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Website Generator</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Website Type Selector */}
          {renderWebsiteTypeSelector()}

          {/* Prompt Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Describe Your Website</Text>
            <TextInput
              placeholder="E.g., Create a portfolio website for a photographer with an image gallery and contact form"
              value={prompt}
              onChangeText={setPrompt}
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholderTextColor="#666"
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity 
            style={[styles.generateButton, loading && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>Generate Website</Text>
            )}
          </TouchableOpacity>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Generated Website Display */}
          {generatedWebsite && (
            <View style={styles.resultContainer}>
              <Text style={styles.sectionTitle}>Generated Website</Text>
              <View style={styles.websitePreview}>
                <Text style={styles.websitePrompt}>Prompt: {generatedWebsite.prompt}</Text>
                <Text style={styles.websiteTimestamp}>
                  Generated: {new Date(generatedWebsite.timestamp).toLocaleString()}
                </Text>
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.previewButton} onPress={handlePreview}>
                    <Ionicons name="eye-outline" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Preview</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveHTML}>
                    <Ionicons name="download-outline" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Save HTML</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.clearButton} onPress={clearWebsite}>
                    <Ionicons name="trash-outline" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                {/* HTML Code Preview */}
                <ScrollView style={styles.codePreview} nestedScrollEnabled>
                  <Text style={styles.codeText}>
                    {generatedWebsite.htmlCode.substring(0, 500)}
                    {generatedWebsite.htmlCode.length > 500 && '...'}
                  </Text>
                </ScrollView>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}