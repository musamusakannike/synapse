import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#100A1F",
  },
  container: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  authContent: {
    flex: 1,
    justifyContent: "center",
  },
  
  // Header Section Styles
  authHeader: {
    marginBottom: 48,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  authLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  brandText: {
    fontSize: 28,
    fontFamily: "JetBrainsMono-Bold",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  titleSection: {
    gap: 8,
  },
  authTitle: {
    fontSize: 32,
    fontFamily: "JetBrainsMono-Bold",
    color: "#FFF",
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  authSubTitle: {
    fontSize: 16,
    fontFamily: "JetBrainsMono-Medium",
    color: "#AAA",
    lineHeight: 22,
    marginTop: 4,
  },
  
  // Form Section Styles
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "JetBrainsMono-Medium",
    color: "#FFF",
    marginLeft: 4,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: "rgba(170, 170, 170, 0.3)",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  inputWrapperFocused: {
    borderColor: "#007AFF",
    backgroundColor: "rgba(0, 122, 255, 0.05)",
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  authInput: {
    padding: 16,
    fontSize: 16,
    color: "#FFF",
    fontFamily: "JetBrainsMono-Medium",
    minHeight: 56,
  },
  
  // Button Section Styles
  buttonSection: {
    paddingBottom: 32,
    gap: 24,
  },
  authButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#007AFF",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  authButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "JetBrainsMono-Bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  signInSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    fontFamily: "JetBrainsMono-Medium",
    color: "#AAA",
  },
  signInLink: {
    fontSize: 14,
    fontFamily: "JetBrainsMono-Bold",
    color: "#007AFF",
  },
  
  // Existing styles (unchanged)
  authText: {
    fontSize: 16,
    fontFamily: "JetBrainsMono-Medium",
    color: "#FFF"
  },
  chatContainer: {
    padding: 12,
  },
  messageContainer: {
    maxWidth: "75%",
    padding: 12,
    marginVertical: 6,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#555555",
    backgroundColor: "#100A1F",
  },
  input: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  sendText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});