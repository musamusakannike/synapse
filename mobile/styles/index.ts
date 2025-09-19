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
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 10
  },
  authLogo: {
    width: 50,
    height: 50,
    borderRadius: 30
  },
  authText: {
    fontSize: 16,
    fontFamily: "JetBrainsMono-Medium",
    color: "#FFF"
  },
  authTitle: {
    fontSize: 36,
    fontFamily: "JetBrainsMono-Bold",
    color: "#FFF",
    paddingLeft: 8,
    paddingTop: 12,
  },
  authSubTitle: {
    fontSize: 16,
    fontFamily: "JetBrainsMono-Medium",
    color: "#AAA",
    paddingLeft: 8
  },
  authInput: {
    
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
    borderBottomRightRadius: 4, // make it look like a bubble tail
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
