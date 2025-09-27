"use client";
import React, { useState } from "react";
import { X, Mail, Github, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AuthModal: React.FC<Props> = ({ open, onClose }) => {
  const [step, setStep] = useState<"choose" | "email" | "code">("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");

  if (!open) return null;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailContinue = () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setStep("email");
  };

  const sendVerification = async () => {
    setSending(true);
    // Placeholder: call backend to send code
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setStep("code");
  };

  const verifyCode = async () => {
    if (!code || code.length < 6) {
      setCodeError("Please enter a valid 6-digit code");
      return;
    }
    setCodeError("");
    setSending(true);
    // Placeholder: call backend to verify
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded shadow-2xl w-full max-w-md mx-4 transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            {step === "choose" && "Welcome"}
            {step === "email" && "Check your email"}
            {step === "code" && "Enter verification code"}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          {step === "choose" && (
            <div className="space-y-6">
              <p className="text-center text-gray-600">
                Sign in or create an account to continue
              </p>

              {/* Social Auth Buttons */}
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors group">
                  <div className="w-5 h-5 flex items-center justify-center text-white text-xs font-bold">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    Continue with Google
                  </span>
                </button>

                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors group">
                  <Github size={20} className="text-gray-700" />
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    Continue with GitHub
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <span className="text-sm text-gray-400 bg-white px-2">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>

              {/* Email Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                        emailError
                          ? "border-red-300 bg-red-50/50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full" />
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEmailContinue}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "email" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="text-blue-600" size={24} />
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">
                  We'll send a verification code to
                </p>
                <p className="font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                  {email}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("choose")}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
                <button
                  onClick={sendVerification}
                  disabled={sending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Sending...
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "code" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600" size={24} />
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">
                  Enter the 6-digit code we sent to
                </p>
                <p className="font-medium text-gray-700">{email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setCode(value);
                      if (codeError) setCodeError("");
                    }}
                    className={`w-full text-center text-2xl font-mono py-4 px-4 border-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors tracking-widest ${
                      codeError
                        ? "border-red-300 bg-red-50/50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  {codeError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center justify-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full" />
                      {codeError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("choose")}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={18} />
                    Start over
                  </button>
                  <button
                    onClick={verifyCode}
                    disabled={sending || code.length < 6}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded font-medium hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Verifying...
                      </>
                    ) : (
                      "Verify & continue"
                    )}
                  </button>
                </div>
              </div>

              <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Didn't receive the code? Resend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
