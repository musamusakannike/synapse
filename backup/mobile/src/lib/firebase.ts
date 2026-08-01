import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Configure Google Sign-In. Call this once on app startup.
 * The webClientId comes from your Firebase console > Authentication > Sign-in method > Google.
 */
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: "49669304081-pbml5pmtl0bfrq6p8bnu4le1sm93j3fj.apps.googleusercontent.com",
  });
}

/**
 * Perform Google Sign-In and return a Firebase ID token
 * that can be sent to the backend for verification.
 */
export async function signInWithGoogle(): Promise<string | null> {
  try {
    // Check if device has Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign in and get the id token
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase with the Google credential
    const userCredential = await auth().signInWithCredential(googleCredential);

    // Get the Firebase ID token to send to our backend
    const firebaseIdToken = await userCredential.user.getIdToken();
    return firebaseIdToken;
  } catch (error: any) {
    // User cancelled the sign-in flow
    if (error.code === 'SIGN_IN_CANCELLED' || error.code === '12501') {
      return null;
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Sign out from both Firebase and Google.
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await auth().signOut();
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch {
    // Silent — may fail if not signed in
  }
}
