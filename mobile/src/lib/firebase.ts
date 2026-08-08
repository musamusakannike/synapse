import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// webClientId is the "client_type: 3" OAuth client from google-services.json
// (project "synapsebotai") — required by @react-native-google-signin so it
// can request a Google ID token that Firebase Auth will accept.
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: '49669304081-pbml5pmtl0bfrq6p8bnu4le1sm93j3fj.apps.googleusercontent.com',
  });
}

export const isAppleAuthAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  return await AppleAuthentication.isAvailableAsync();
};
