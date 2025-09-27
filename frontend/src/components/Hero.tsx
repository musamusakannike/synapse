import React from "react";
import {
  Brain,
  Lightbulb,
  Calculator,
  Globe,
  ArrowRight,
  Atom,
  User,
} from "lucide-react";

const SynapseHero = () => {
  return (
    <div className="min-h-screen lg:min-h-[calc(100vh-64px)] bg-gray-50 relative overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-800 font-mono">SYNAPSE</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#"
            className="text-gray-600 hover:text-green-600 transition-colors flex items-center"
          >
            Blog <ArrowRight className="w-4 h-4 ml-1" />
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Our Mission
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors hidden md:block">
            Get Started
          </button>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
                <User className="w-6 h-6"  />
            </span>
          </div>
        </div>
      </nav>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {/* Brain/Neural Network Icon */}
        <div className="absolute top-32 left-20 animate-pulse">
          <Brain className="w-16 h-16 text-blue-400 opacity-60" />
        </div>

        {/* Formula */}
        <div className="absolute top-64 left-16 transform -rotate-12">
          <div className="bg-white p-4 rounded-lg shadow-lg border">
            <span className="text-gray-700 font-mono text-lg">∂f/∂x = lim</span>
          </div>
        </div>

        {/* Paper Airplane */}
        <div className="absolute top-44 left-1/3 transform rotate-12 animate-bounce">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-12 border-b-gray-400 opacity-70" />
        </div>

        {/* Book Stack */}
        <div
          className="absolute top-28 right-20 animate-spin"
          style={{ animationDuration: "20s" }}
        >
          <Atom className="w-16 h-16 text-blue-400 opacity-60" />
        </div>

        {/* Lightbulb */}
        <div className="absolute bottom-1/3 right-32 animate-pulse">
          <Lightbulb className="w-12 h-12 text-yellow-400 opacity-60" />
        </div>

        {/* Calculator */}
        <div className="absolute bottom-40 left-24">
          <Calculator className="w-14 h-14 text-gray-500 opacity-50 transform rotate-12" />
        </div>

        {/* DNA Helix */}
        <div className="absolute bottom-32 right-16 animate-pulse">
          <div className="w-12 h-16 relative">
            <div className="absolute inset-0 border-l-2 border-blue-400 opacity-60 transform rotate-12" />
            <div className="absolute inset-0 border-r-2 border-blue-400 opacity-60 transform -rotate-12" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          The AI tutor that lives in your{" "}
          <span className="text-blue-600">mind</span>.
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
          Accelerate your learning with AI that adapts to your thinking. No
          context switching, no cognitive overload.
        </p>

        <button className="bg-blue-600 text-white px-8 py-4 rounded text-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <span>Start learning for free</span>
        </button>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-10 left-10 opacity-30">
        <Globe
          className="w-10 h-10 text-blue-500 animate-spin"
          style={{ animationDuration: "30s" }}
        />
      </div>

      <div className="absolute bottom-16 right-1/4 opacity-40">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full animate-bounce" />
      </div>
    </div>
  );
};

export default SynapseHero;
