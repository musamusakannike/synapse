import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Create your free Synapse account. Unlock a highly personalized learning experience with AI-powered course creation, study videos, and custom topic quizzes.",
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
