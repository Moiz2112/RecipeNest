'use client';

import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import Link from 'next/link';
import Layout from '../components/Layout';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const slideImages = [
  {
    title: 'Discover New Recipes',
    description: 'Explore thousands of AI-generated recipes tailored to your taste',
    gradient: 'from-orange-400 via-red-500 to-pink-500',
  },
  {
    title: 'Personalized Suggestions',
    description: 'Get recipe recommendations based on your dietary preferences',
    gradient: 'from-green-300 via-blue-500 to-purple-600',
  },
  {
    title: 'Save & Organize',
    description: 'Keep all your favorite recipes in one secure place',
    gradient: 'from-yellow-300 via-yellow-500 to-orange-500',
  },
  {
    title: 'Community Sharing',
    description: 'Share your creations and inspire other food lovers',
    gradient: 'from-pink-500 via-red-500 to-yellow-500',
  },
];

function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index % slideImages.length);
  };

  return (
    <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slideImages.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
              <div className="text-center text-white px-6">
                <h3 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{slide.title}</h3>
                <p className="text-lg md:text-xl drop-shadow-md">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => goToSlide(currentSlide - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all z-10"
      >
        <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={() => goToSlide(currentSlide + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all z-10"
      >
        <ChevronRightIcon className="w-6 h-6 text-gray-800" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slideImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/70'
              }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="w-full">
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center animate-fadeInUp">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent mb-4">
                RecipeNest
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-2">
                Your AI-Powered Culinary Companion
              </p>
              <p className="text-gray-500 text-lg">
                Discover, create, and share delicious recipes powered by artificial intelligence
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 md:py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-fadeInUp">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  About Smart Recipe Generator
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  Smart Recipe Generator is a cutting-edge web application that leverages artificial intelligence to help you discover and create personalized recipes based on your available ingredients and dietary preferences.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Whether you're a culinary enthusiast looking for inspiration or someone seeking quick meal solutions, our platform provides intelligent recipe suggestions tailored to your needs.
                </p>
              </div>

              <div className="animate-fadeInUp bg-gradient-to-br from-brand-500 to-accent-500 p-8 rounded-2xl text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-4">Platform Type</h3>
                <p className="mb-6 text-white/95">
                  A full-stack AI-powered web application built with modern technologies to provide seamless recipe generation.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    Web-based application
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    Real-time AI processing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    User-friendly interface
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    Personalized experience
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section className="py-16 md:py-20 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Vision & Mission</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Vision */}
              <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all animate-fadeInUp">
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To transform the way people discover, create, and enjoy food by leveraging artificial intelligence to make personalized culinary experiences accessible to everyone, regardless of cooking skill level.
                </p>
              </div>

              {/* Mission */}
              <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-brand-500 to-orange-500 mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To empower home cooks and culinary enthusiasts by providing intelligent, easy-to-use tools that inspire creativity in the kitchen and reduce the barriers to healthy, delicious meal preparation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Slider Section */}
        <section className="py-16 md:py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fadeInUp">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
              <p className="text-gray-600 text-lg">
                Explore the features that make Smart Recipe Generator unique
              </p>
            </div>
            <ImageSlider />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 transform hover:-translate-y-1 animate-fadeInUp">
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Recipes</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Get personalized recipe suggestions powered by advanced AI technology</p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 transform hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Search</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Find recipes by ingredients, cuisine, or dietary requirements instantly</p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 transform hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">❤️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Favorites</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Build your personal recipe collection and access it anytime</p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 transform hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share & Discover</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Share your favorite recipes and discover what others are cooking</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 px-4 bg-gradient-to-r from-brand-600 to-brand-700">
          <div className="max-w-4xl mx-auto text-center text-white animate-fadeInUp">
            <h2 className="text-4xl font-bold mb-4">Ready to Create Amazing Recipes?</h2>
            <p className="text-brand-100 text-lg mb-8">
              Start discovering personalized recipes powered by AI today
            </p>
            <Link
              href="/Home"
              className="inline-block px-8 py-4 bg-white text-brand-600 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Go to Recipe Generator
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: {} };
};
