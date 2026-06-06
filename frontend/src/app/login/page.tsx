import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | Sabi Learn",
  description: "Sign in to Sabi Learn to continue your personalized AI learning journey, review your courses, and generate new topic quizzes.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Sign In | Sabi Learn",
    description: "Sign in to Sabi Learn to continue your personalized AI learning journey, review your courses, and generate new topic quizzes.",
    url: "https://sabilearn.online/login",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Sabi Learn",
    description: "Sign in to Sabi Learn to continue your personalized AI learning journey, review your courses, and generate new topic quizzes.",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
