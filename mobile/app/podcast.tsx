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
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import usePodcast from "@/lib/usePodcast";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import Slider from '@react-native-community/slider';

export default function PodcastGeneration() {
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [podcastStyle, setPodcastStyle] = useState("professional");
  const [voiceGender, setVoiceGender] = useState("NEUTRAL");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(0.0);
  
  // Audio player state
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const { 
    loading, 
    generatedPodcast, 
    error, 
    generateFullPodcast, 
    clearPodcast 
  } = usePodcast();
  const { user } = useAuth();
  const router = useRouter();

  const podcastStyles = [
    { id: "professional", name: "Professional", description: "Clear, engaging tone for news" },
    { id: "casual", name: "Casual", description: "Friendly, conversational style" },
    { id: "energetic", name: "Energetic", description: "Enthusiastic, upbeat tone" },
    { id: "educational", name: "Educational", description: "Informative, clear explanations" },
  ];

  const voiceGenders = [
    { id: "NEUTRAL", name: "Neutral" },
    { id: "MALE", name: "Male" },
    { id: "FEMALE", name: "Female" },
  ];

  const handleGenerate = async () => {
    if (articleTitle.trim() && articleContent.trim()) {
      try {
        await generateFullPodcast(
          articleTitle,
          articleContent,
          podcastStyle,
          voiceGender,
          voiceSpeed,
          voicePitch
        );
      } catch (error) {
        console.error('Podcast generation failed:', error);
      }
    }
  };

  const loadAudio = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );

      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying || false);
        }
      });

      return newSound;
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const playPause = async () => {
    if (!sound && generatedPodcast?.downloadUrl) {
      const newSound = await loadAudio(generatedPodcast.downloadUrl);
      if (newSound) {
        await newSound.playAsync();
      }
    } else if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const handleDownload = async () => {
    if (generatedPodcast?.downloadUrl) {
      try {
        await Linking.openURL(generatedPodcast.downloadUrl);
      } catch (error) {
        console.error('Error downloading file:', error);
        Alert.alert('Error', 'Failed to download audio file');
      }
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderPodcastStyleSelector = () => (
    <View style={styles.podcastStyleContainer}>
      <Text style={styles.sectionTitle}>Podcast Style</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {podcastStyles.map((style) => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.podcastStyleChip,
              podcastStyle === style.id && styles.podcastStyleChipSelected
            ]}
            onPress={() => setPodcastStyle(style.id)}
          >
            <Text style={[
              styles.podcastStyleChipText,
              podcastStyle === style.id && styles.podcastStyleChipTextSelected
            ]}>
              {style.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderVoiceSettings = () => (
    <View style={styles.voiceSettingsContainer}>
      <Text style={styles.sectionTitle}>Voice Settings</Text>
      
      {/* Voice Gender */}
      <View style={styles.voiceSettingRow}>
        <Text style={styles.voiceSettingLabel}>Voice</Text>
        <View style={styles.genderSelector}>
          {voiceGenders.map((gender) => (
            <TouchableOpacity
              key={gender.id}
              style={[
                styles.genderOption,
                voiceGender === gender.id && styles.genderOptionSelected
              ]}
              onPress={() => setVoiceGender(gender.id)}
            >
              <Text style={[
                styles.genderOptionText,
                voiceGender === gender.id && styles.genderOptionTextSelected
              ]}>
                {gender.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Voice Speed */}
      <View style={styles.voiceSettingRow}>
        <Text style={styles.voiceSettingLabel}>Speed</Text>
        <Text style={styles.voiceSettingValue}>{voiceSpeed.toFixed(1)}x</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={{ height: 40 }}
            minimumValue={0.25}
            maximumValue={2.0}
            value={voiceSpeed}
            onValueChange={setVoiceSpeed}
            step={0.1}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#302A4F"
            thumbStyle={{ backgroundColor: "#007AFF" }}
          />
        </View>
      </View>

      {/* Voice Pitch */}
      <View style={styles.voiceSettingRow}>
        <Text style={styles.voiceSettingLabel}>Pitch</Text>
        <Text style={styles.voiceSettingValue}>{voicePitch.toFixed(1)}</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={{ height: 40 }}
            minimumValue={-5.0}
            maximumValue={5.0}
            value={voicePitch}
            onValueChange={setVoicePitch}
            step={0.1}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#302A4F"
            thumbStyle={{ backgroundColor: "#007AFF" }}
          />
        </View>
      </View>
    </View>
  );

  const renderAudioPlayer = () => {
    if (!generatedPodcast) return null;

    return (
      <View style={styles.audioPlayer}>
        <View style={styles.audioControls}>
          <Text style={styles.audioTime}>{formatTime(position)}</Text>
          
          <TouchableOpacity style={styles.playButton} onPress={playPause}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          
          <Text style={styles.audioTime}>{formatTime(duration)}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }
              ]} 
            />
          </View>
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Download ({generatedPodcast.fileSize})</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Podcast Generator</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Article Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Article Title</Text>
            <TextInput
              placeholder="Enter article title..."
              value={articleTitle}
              onChangeText={setArticleTitle}
              style={[styles.textArea, { minHeight: 50 }]}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Article Content</Text>
            <TextInput
              placeholder="Paste article content here..."
              value={articleContent}
              onChangeText={setArticleContent}
              style={[styles.textArea, { minHeight: 120 }]}
              multiline
              numberOfLines={6}
              placeholderTextColor="#666"
            />
          </View>

          {/* Podcast Style Selector */}
          {renderPodcastStyleSelector()}

          {/* Voice Settings */}
          {renderVoiceSettings()}

          {/* Generate Button */}
          <TouchableOpacity 
            style={[
              styles.generatePodcastButton, 
              loading && styles.generatePodcastButtonDisabled
            ]}
            onPress={handleGenerate}
            disabled={loading || !articleTitle.trim() || !articleContent.trim()}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.generatePodcastButtonText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.generatePodcastButtonText}>Generate Podcast</Text>
            )}
          </TouchableOpacity>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Generated Podcast Display */}
          {generatedPodcast && (
            <View style={styles.resultContainer}>
              <Text style={styles.sectionTitle}>Generated Podcast</Text>
              <View style={styles.podcastPreview}>
                <Text style={styles.podcastTitle}>{generatedPodcast.articleTitle}</Text>
                
                <View style={styles.podcastMeta}>
                  <Text style={styles.podcastMetaText}>
                    Style: {generatedPodcast.podcastStyle}
                  </Text>
                  <Text style={styles.podcastMetaText}>
                    Duration: {generatedPodcast.estimatedDuration}
                  </Text>
                  <Text style={styles.podcastMetaText}>
                    Words: {generatedPodcast.wordCount}
                  </Text>
                </View>

                {/* Script Preview */}
                <ScrollView style={styles.scriptPreview} nestedScrollEnabled>
                  <Text style={styles.scriptText}>
                    {generatedPodcast.script.substring(0, 300)}
                    {generatedPodcast.script.length > 300 && '...'}
                  </Text>
                </ScrollView>

                {/* Audio Player */}
                {renderAudioPlayer()}

                {/* Action Buttons */}
                <View style={styles.podcastActionButtons}>
                  <TouchableOpacity style={styles.clearButton} onPress={clearPodcast}>
                    <Ionicons name="trash-outline" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.podcastMetaText}>
                  Generated: {new Date(generatedPodcast.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.podcastMetaText}>
                  Generation time: {generatedPodcast.generationTime}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}