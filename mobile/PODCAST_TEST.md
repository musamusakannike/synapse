# Podcast Generation Feature - Mobile App

## 🎙️ **Feature Overview**

The Synapse mobile app now includes a complete podcast generation feature that converts articles into engaging audio podcasts using AI.

## 📱 **How to Use**

### 1. Access Podcast Generation
- Open the Synapse mobile app
- In the main chat screen sidebar, tap on **"Generate Podcast"** (red button with microphone icon)

### 2. Input Article Content
- **Article Title**: Enter a descriptive title for your article
- **Article Content**: Paste the full article content you want to convert

### 3. Customize Podcast Style
Choose from 4 different styles:
- **Professional**: Clear, engaging tone suitable for news podcasts
- **Casual**: Friendly, conversational tone as if talking to a friend
- **Energetic**: Enthusiastic, upbeat tone with excitement about the topic
- **Educational**: Informative tone that breaks down complex topics clearly

### 4. Configure Voice Settings
- **Voice Gender**: Choose between Neutral, Male, or Female
- **Speed**: Adjust speaking speed from 0.25x to 2.0x (default: 1.0x)
- **Pitch**: Fine-tune voice pitch from -5.0 to +5.0 (default: 0.0)

### 5. Generate Podcast
- Tap **"Generate Podcast"** to create both script and audio
- Wait for processing (typically 10-30 seconds depending on article length)

### 6. Listen & Download
- Use the built-in audio player to listen to your podcast
- Download the MP3 file to your device
- View the generated script and analytics

## 🎯 **Features**

### Core Functionality
- ✅ Article-to-script generation using Gemini AI
- ✅ Text-to-speech conversion with Google Cloud TTS
- ✅ Multiple podcast styles and voice options
- ✅ Built-in audio player with playback controls
- ✅ Download functionality for MP3 files
- ✅ Script preview and analytics

### Voice Customization
- ✅ 3 voice gender options (Neutral, Male, Female)
- ✅ Speed control (0.25x - 2.0x)
- ✅ Pitch adjustment (-5.0 to +5.0)
- ✅ Real-time slider controls

### Audio Player
- ✅ Play/Pause controls
- ✅ Progress bar with position tracking
- ✅ Duration and current time display
- ✅ Download button with file size info

## 🧪 **Testing the Feature**

### Sample Article for Testing
Use this sample article to test the feature:

**Title:** "The Future of AI in Healthcare"

**Content:**
```
Artificial intelligence is revolutionizing healthcare in ways we never imagined possible. From diagnostic imaging to drug discovery, AI technologies are enhancing medical practices and improving patient outcomes worldwide.

Machine learning algorithms can now analyze medical images with remarkable accuracy, often detecting diseases earlier than human radiologists. This early detection capability is particularly valuable in cancer screening, where catching the disease in its initial stages dramatically improves treatment success rates.

In drug discovery, AI is accelerating the process of finding new medications. What traditionally took decades can now be accomplished in years, potentially bringing life-saving treatments to patients much faster.

The integration of AI in electronic health records is also improving patient care by providing healthcare providers with better insights and personalized treatment recommendations.

However, challenges remain, including data privacy concerns, the need for regulatory frameworks, and ensuring AI systems are unbiased and accessible to all populations.

Despite these challenges, the future of AI in healthcare looks promising, with continued innovations expected to transform how we approach medical care and disease prevention.
```

### Expected Results
- **Generation Time**: ~15-30 seconds
- **Estimated Duration**: 2-3 minutes
- **Word Count**: ~150-200 words
- **File Size**: ~1-3 MB MP3

## 🔧 **Technical Requirements**

### Server Requirements
- ✅ Node.js backend with podcast API endpoints
- ✅ Google Gemini AI API key
- ✅ Google Cloud Text-to-Speech credentials
- ✅ MongoDB for podcast history storage

### Mobile Requirements
- ✅ Expo SDK with expo-audio for audio playback
- ✅ React Native Community Slider for voice controls
- ✅ Proper navigation setup
- ✅ Authentication integration

## 🐛 **Common Issues & Solutions**

### Generation Issues
- **"Generation failed"**: Check server is running and API keys are configured
- **"Authentication required"**: Ensure user is logged in
- **Long processing time**: Large articles take longer, be patient

### Audio Issues
- **Can't play audio**: Check device volume and permissions
- **Download fails**: Ensure network connectivity
- **Poor audio quality**: Try different voice settings

### UI Issues
- **Sliders not responding**: Restart the app
- **Screen not scrolling**: Check keyboard behavior settings

## 🎨 **UI Features**

### Design Elements
- **Color Scheme**: Red accent (#FF6B6B) for podcast-specific elements
- **Icons**: Microphone, play/pause, download icons from Ionicons
- **Typography**: JetBrains Mono font family for consistency
- **Layout**: Scrollable form with clear sections and visual hierarchy

### Interactive Components
- **Podcast Style Chips**: Horizontal scrollable selection
- **Voice Gender Buttons**: Toggle-style selection
- **Sliders**: Smooth controls for speed and pitch
- **Audio Player**: Custom-designed player with progress bar

## 📊 **Analytics & Metadata**

Each generated podcast includes:
- Word count and estimated duration
- Generation time tracking
- Voice settings used
- File size and format information
- Creation timestamp
- Podcast style applied

## 🔄 **Integration with Existing Features**

The podcast feature integrates seamlessly with:
- **Authentication**: Uses existing JWT token system
- **Navigation**: Follows app's routing patterns
- **Styling**: Consistent with website generation feature
- **Error Handling**: Unified error display system
- **API Client**: Uses existing axios configuration

## 📱 **Mobile-Specific Optimizations**

- **Keyboard Handling**: Proper KeyboardAvoidingView implementation
- **ScrollView**: Nested scrolling for long content
- **Touch Targets**: Optimized button sizes for mobile
- **Loading States**: Clear feedback during processing
- **Responsive Design**: Works on various screen sizes

## 🚀 **Future Enhancements**

Potential improvements could include:
- Podcast history view with search
- Multiple speakers/voices in single podcast
- Background music and sound effects
- Share functionality
- Podcast playlist creation
- Offline playback capability