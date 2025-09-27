import React from "react";
import { Check, X, Sparkles, Crown, GraduationCap } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  period?: string;
  tagline: string;
  featured?: boolean;
  features: Array<{ label: string; available: boolean; note?: string }>;
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "₦0",
    period: "",
    tagline: "Get started with core tools",
    features: [
      { label: "AI Study Tutor (daily limit)", available: true, note: "Limited" },
      { label: "Context-Aware Chat history", available: true, note: "Limited" },
      { label: "Smart Notes & Summaries", available: true, note: "Limited" },
      { label: "Quiz Generator", available: false },
      { label: "Upload multi-format documents", available: false },
      { label: "Progress tracking dashboard", available: false },
      { label: "Priority support", available: false },
    ],
    cta: "Start for Free",
  },
  {
    name: "Guru",
    price: "₦5,000",
    period: "/month",
    tagline: "Unlock powerful learning",
    featured: true,
    features: [
      { label: "AI Study Tutor (higher limits)", available: true },
      { label: "Context-Aware Chat with memory", available: true },
      { label: "Smart Notes & flashcards", available: true },
      { label: "Quiz Generator", available: true },
      { label: "Upload PDFs, slides & text", available: true },
      { label: "Progress tracking dashboard", available: true },
      { label: "Priority support", available: true },
    ],
    cta: "Go Guru",
  },
  {
    name: "Scholar",
    price: "₦8,000",
    period: "/month",
    tagline: "For serious learners & teams",
    features: [
      { label: "Everything in Guru", available: true },
      { label: "Highest usage limits", available: true },
      { label: "Advanced quiz analytics", available: true },
      { label: "Collaboration (shared spaces)", available: true },
      { label: "Priority+ support", available: true },
    ],
    cta: "Become a Scholar",
  },
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-gray-500">Pricing</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2">
            Simple, student-friendly pricing
          </h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Prices are in Nigerian Naira. Student discounts apply automatically for
            verified academic emails (e.g., your active student mail).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:px-12 mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                "rounded border bg-gray-50 border-gray-200 p-6 flex flex-col",
                plan.featured
                  ? "ring-2 ring-blue-500 shadow-md bg-white"
                  : "shadow-sm",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.tagline}</p>
                </div>
              </div>

              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-gray-500 mb-1">{plan.period}</span>
                )}
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    {f.available ? (
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mt-0.5" />
                    )}
                    <span
                      className={[
                        "text-sm",
                        f.available ? "text-gray-800" : "text-gray-400",
                      ].join(" ")}
                    >
                      {f.label}
                      {f.note && (
                        <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full border inline-block align-middle text-gray-600 border-gray-300 bg-white">
                          {f.note}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={[
                  "mt-6 w-full py-2.5 rounded text-sm font-semibold transition-colors",
                  plan.featured
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50",
                ].join(" ")}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          Student discounts are available for verified academic emails. If your
          school uses a different domain, you can request manual verification after
          sign-up.
        </div>
      </div>
    </section>
  );
};

export default Pricing;
