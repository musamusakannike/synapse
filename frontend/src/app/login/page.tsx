import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Synapse to continue your personalized AI learning journey, review your courses, and generate new topic quizzes.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Sign In | Synapse",
    description: "Sign in to Synapse to continue your personalized AI learning journey, review your courses, and generate new topic quizzes.",
    url: "https://synapse.codiac.online/login",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Synapse",
    description: "Sign in to Synapse to continue your personalized AI learning journey, review your courses, and generate new topic quizzes.",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
