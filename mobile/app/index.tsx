import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate
} from 'react-native-reanimated';

const AnimatedButton = ({ children, delay, icon }: { children: string, delay: number, icon: string }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1));
    translateY.value = withDelay(delay, withSpring(0));
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyle]}>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          {icon} {children}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AIInterface() {
  const headerOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withSpring(1, { duration: 800 });
    titleOpacity.value = withDelay(200, withSpring(1, { duration: 800 }));
  }, [headerOpacity, titleOpacity]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{
      translateY: interpolate(titleOpacity.value, [0, 1], [30, 0])
    }]
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Synapse</Text>

        <View style={styles.profileCircle}>
          <View style={styles.profileInner}>
            <Text style={styles.profileText}>💻</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <Animated.View style={titleStyle}>
          <Text style={styles.greeting}>Hi Musa</Text>
          <Text style={styles.question}>Where should we start?</Text>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.buttonsWrapper}>
          <AnimatedButton delay={400} icon="✍️">Upload Document</AnimatedButton>
          <AnimatedButton delay={500} icon="">Generate a complete course</AnimatedButton>
          <AnimatedButton delay={600} icon="">Take a Quiz</AnimatedButton>
          <AnimatedButton delay={800} icon="">Watch Tutorials</AnimatedButton>
        </View>
      </ScrollView>

      {/* Bottom Input Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.inputContainer}>
          <View>
            <TextInput placeholder='Ask Synapse' placeholderTextColor={"#666"} style={styles.input} lineBreakModeIOS='tail' numberOfLines={3} multiline={true} />
          </View>
          <View style={styles.inputButtons}>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.thinkingButton}>
              <Text style={styles.thinkingText}>Thinking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.micButton}>
              <Text style={styles.micIcon}>🎤</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.voiceButton}>
              <View style={styles.voiceBar} />
              <View style={[styles.voiceBar, styles.voiceBarTall]} />
              <View style={styles.voiceBar} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 10,
  },
  menuLine: {
    width: 24,
    height: 2,
    backgroundColor: '#000',
    marginVertical: 3,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    color: '#000',
    fontFamily: 'Outfit_500Medium',
    letterSpacing: 0.5,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4285F4',
    padding: 2,
  },
  profileInner: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  greeting: {
    fontSize: 32,
    color: '#4285F4',
    fontFamily: 'Outfit_500Medium',
    marginBottom: 8,
  },
  question: {
    fontSize: 32,
    fontWeight: '400',
    color: '#C4C7C5',
    fontFamily: 'Outfit_400Regular',
    lineHeight: 42,
  },
  buttonsWrapper: {
    marginTop: 50,
    gap: 16,
  },
  buttonContainer: {
    marginBottom: 0,
  },
  button: {
    backgroundColor: '#f0f4f9',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  buttonText: {
    color: '#1f1f1f',
    fontSize: 17,
    fontFamily: 'Outfit_400Regular',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'column',
    backgroundColor: '#f0f4f9',
    width: '100%',
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    color: '#1f1f1f',
    fontSize: 18,
    fontFamily: 'Outfit_400Regular',
    padding: 12,
    borderRadius: 28,
    minHeight: 120
  },
  addButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e1e5ea',
    borderRadius: 18,
  },
  addButtonText: {
    color: '#444',
    fontSize: 24,
    fontWeight: '300',
  },
  inputPlaceholder: {
    flex: 1,
    color: '#666',
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
  },
  inputButtons: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  thinkingButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  thinkingText: {
    color: '#444',
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
  },
  micButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  micIcon: {
    fontSize: 20,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#e8f0fe',
    borderRadius: 20,
  },
  voiceBar: {
    width: 3,
    height: 12,
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
  voiceBarTall: {
    height: 18,
  },
});