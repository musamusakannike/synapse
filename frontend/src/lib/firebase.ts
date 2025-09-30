"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import firebaseConfig from "@/firebaseConfig.json";

// Ensure we only initialize once (Next.js fast refresh safe)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Optional: force account selection prompt
googleProvider.setCustomParameters({ prompt: "select_account" });
githubProvider.addScope('user:email');

export default app;
