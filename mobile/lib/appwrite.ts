import { Client, Account, Databases, ID, Query } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("68cc345f0012792efe03");

export const account = new Account(client);
export const databases = new Databases(client);

// Sign Up
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) throw new Error("Account creation failed");

    await signIn(email, password);

    return newAccount;
  } catch (error: any) {
    console.error("Sign up failed:", error);
    throw new Error(error.message);
  }
};

// Sign In
export const signIn = async (email: string, password: string) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: any) {
    console.error("Sign in failed:", error);
    throw new Error(error.message);
  }
};

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;
    return currentAccount;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const APPWRITE_CHATS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!;
const APPWRITE_MESSAGES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!;

// Delete Chat
export const deleteChat = async (chatId: string) => {
  try {
    const messages = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_MESSAGES_COLLECTION_ID,
      [Query.equal("chatId", chatId)]
    );

    for (const message of messages.documents) {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_MESSAGES_COLLECTION_ID,
        message.$id
      );
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_CHATS_COLLECTION_ID,
      chatId
    );
  } catch (error: any) {
    console.error("Delete chat failed:", error);
    throw new Error(error.message);
  }
};

// Clear Chat History
export const clearChatHistory = async (userId: string) => {
  try {
    const chats = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_CHATS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    for (const chat of chats.documents) {
      await deleteChat(chat.$id);
    }
  } catch (error: any) {
    console.error("Clear chat history failed:", error);
    throw new Error(error.message);
  }
};

export default client;
