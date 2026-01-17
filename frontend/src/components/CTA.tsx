"use client";
import React from "react";
import Link from "next/link";
import { useAuthModal } from "../contexts/AuthModalContext";

const CTA: React.FC = () => {
  const { openModal } = useAuthModal();
  return (
    <section id="cta" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded border border-blue-200 bg-linear-to-br from-blue-50 to-white">
          {/* Decorative background */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15) 0, transparent 40%),
                radial-gradient(circle at 80% 30%, rgba(99,102,241,0.12) 0, transparent 35%),
                radial-gradient(circle at 30% 80%, rgba(59,130,246,0.10) 0, transparent 45%)
              `,
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6 py-14 md:py-16">
            <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">Get started</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900 max-w-2xl">
              Ready to learn faster with an AI tutor that adapts to you?
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Join students already using Synapse to study smarter. Start free, upgrade anytime.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={openModal}
                className="inline-flex items-center justify-center px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow"
              >
                Start for Free
              </button>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-semibold transition-colors"
              >
                See Pricing
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              No credit card required • Cancel anytime • Student-friendly pricing
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
