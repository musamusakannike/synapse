import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an Account | Synapse",
  description: "Create your free Synapse account. Unlock a highly personalized learning experience with AI-powered course creation, study videos, and custom topic quizzes.",
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Create an Account | Synapse",
    description: "Create your free Synapse account. Unlock a highly personalized learning experience with AI-powered course creation, study videos, and custom topic quizzes.",
    url: "https://synapse.codiac.online/register",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create an Account | Synapse",
    description: "Create your free Synapse account. Unlock a highly personalized learning experience with AI-powered course creation, study videos, and custom topic quizzes.",
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
