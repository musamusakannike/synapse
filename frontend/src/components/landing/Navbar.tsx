"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const { openModal } = useAuthModal();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How it Works", href: "#how-it-works" },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass py-3"
            : "bg-transparent py-5"
        }`}
        style={{
          borderBottom: scrolled ? "1px solid var(--l-border)" : "none",
        }}
      >
        <div className="landing-container flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--l-text-heading)", fontFamily: "'Satoshi', sans-serif" }}
          >
            SYNAPSE
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="landing-link text-sm font-medium"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={openModal}
              className="landing-btn-primary text-sm"
              style={{ padding: "10px 24px" }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[2px] rounded-full"
              style={{ background: "var(--l-text)" }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-[2px] rounded-full"
              style={{ background: "var(--l-text)" }}
              transition={{ duration: 0.15 }}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[2px] rounded-full"
              style={{ background: "var(--l-text)" }}
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ top: "60px" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "var(--l-bg)", opacity: 0.98 }}
            />
            <div className="relative z-10 flex flex-col items-center gap-6 pt-12 pb-8">
              {navLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium"
                  style={{ color: "var(--l-text)" }}
                >
                  {label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openModal();
                }}
                className="landing-btn-primary mt-4"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
