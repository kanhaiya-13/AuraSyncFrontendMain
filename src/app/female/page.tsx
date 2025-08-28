'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GenderNavbar from '../../components/GenderNavbar';
import FaceAnalysisWidget from '../../components/FaceAnalysisWidget';
import BodyAnalysisWidget from '../../components/BodyAnalysisWidget';
import SkinToneAnalysisWidget from '../../components/SkinToneAnalysisWidget';
import HeroFemale from '@/components/female/HeroFemale';
import OutfitRecommendations from '@/components/female/OutfitRecommendations';
import OccasionRecommendations from '@/components/female/OccasionRecommendation';
import MarqueeText from '@/components/female/MarqueeText';
import ProductGrid from '@/components/female/ProductGrid';

// Analysis steps
const ANALYSIS_STEPS = [
  "Welcome",
  "Face Analysis", 
  "Skin Tone Analysis", 
  "Body Analysis", 
  "Personality Analysis",
  "Recommendations"
];

interface AnalysisResults {
  face_shape?: string;
  skin_tone?: string;
  body_shape?: string;
  personality_type?: string;
  gender: 'Female';
}

interface Product {
  title: string;
  price: string;
  image: string;
  link: string;
  description?: string;
}

// Hero Section Component - Exact match to the image
const Hero = () => {
  return (
    <section className="min-h-screen relative overflow-hidden">
    
    
     
      <HeroFemale/>

      {/* Bottom Navigation Bar - Exact match */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/40 backdrop-blur-lg rounded-full px-8 py-4 flex items-center gap-8">
          <button className="text-white hover:text-pink-300 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </button>
          <button className="text-white hover:text-pink-300 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </button>
          <button className="text-white hover:text-pink-300 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
            </svg>
          </button>
          <button className="text-white hover:text-pink-300 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

// Main Female Page Component with Analysis Logic
const FemaleHome = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<AnalysisResults>({ gender: 'Female' });
  const [skipped, setSkipped] = useState<{ face: boolean; body: boolean; personality: boolean; skin_tone: boolean }>({ 
    face: false, body: false, personality: false, skin_tone: false 
  });
  const [completed, setCompleted] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);

  const canShowRecommendations = completed.length >= 2;

  // Onboarding gate and immediate recommendations view
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('aurasync_user_data') || '{}');
    if (!userData || !userData.onboarding_completed) {
      window.location.href = '/onboarding';
      return;
    }
    // Show recommendations immediately when onboarding is completed
    setShowRecommendations(true);
    if (!recommendationsLoaded) {
      fetchRecommendations();
      setRecommendationsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length - 1 && canShowRecommendations) {
      setShowRecommendations(true);
      fetchRecommendations();
    }
  }, [currentStep, canShowRecommendations]);

  // Auto-fetch recommendations when user data is available
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('aurasync_user_data') || '{}');
    if (userData && userData.onboarding_completed && userData.gender === 'female' && !recommendationsLoaded) {
      fetchRecommendations();
      setRecommendationsLoaded(true);
    }
  }, [recommendationsLoaded]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = JSON.parse(localStorage.getItem('aurasync_user_data') || '{}');
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body_shape: userData.body_shape || results.body_shape || 'Hourglass',
          personality_type: userData.personality || results.personality_type || 'ISTJ',
          skin_tone: userData.skin_tone || results.skin_tone || 'Warm',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setSearchQuery(data.query);
      setProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      setLoading(false);
    }
  };

  const handleComplete = (type: 'face' | 'skin_tone' | 'body' | 'personality', value: string) => {
    setResults(prev => ({ ...prev, [type === 'face' ? 'face_shape' : type === 'body' ? 'body_shape' : type === 'personality' ? 'personality_type' : 'skin_tone']: value }));
    setCompleted(prev => Array.from(new Set([...prev, type])));
    setCurrentStep(prev => prev + 1);
  };

  const handleSkip = (type: 'face' | 'skin_tone' | 'body' | 'personality') => {
    setSkipped(prev => ({ ...prev, [type]: true }));
    setCurrentStep(prev => prev + 1);
  };

  const handleStartAnalysis = () => {
    setCurrentStep(1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setResults({ gender: 'Female' });
    setSkipped({ face: false, body: false, personality: false, skin_tone: false });
    setCompleted([]);
    setShowRecommendations(false);
    setProducts([]);
    setLoading(false);
    setError(null);
    setSearchQuery(null);
  };

  // Welcome Step with Hero UI
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-black text-white">
        <Hero />
        
        {/* Analysis Start Button */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={handleStartAnalysis}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-xl text-2xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl"
          >
            Start Your Style Analysis
          </button>
        </div>
      </div>
    );
  }

  // Recommendations Step
  if (showRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">Your Personalized Recommendations</h1>
            
            {loading && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4"></div>
                <p className="text-xl">Searching Amazon for personalized fashion recommendations...</p>
                <p className="text-sm text-gray-300 mt-2">This may take a few moments</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-bold mb-2 text-red-200">Error</h2>
                <p className="text-red-300">{error}</p>
                <button
                  onClick={fetchRecommendations}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {searchQuery && (
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-bold mb-2">Search Query</h2>
                <p className="text-gray-300 text-sm mb-2">Based on your preferences, we searched for:</p>
                <p className="bg-gray-800 p-4 rounded-lg text-yellow-300 font-mono text-sm break-words">{searchQuery}</p>
              </div>
            )}
            
            {products.length > 0 && (
              <div className="w-full">
                <h2 className="text-3xl font-bold mb-6 text-center">Recommended Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, idx) => (
                    <motion.a
                      key={idx}
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center transition-all hover:scale-105 hover:shadow-3xl duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <img 
                        src={product.image} 
                        alt={product.title || "Product"} 
                        className="rounded-xl mb-4 max-h-48 object-contain w-full" 
                      />
                      <div className="text-lg font-bold text-pink-700 mb-2 uppercase tracking-wide">FASHION</div>
                      <div className="text-lg font-bold text-gray-900 mb-2 text-center line-clamp-2">{product.title || "Fashion Pick"}</div>
                      <div className="text-xl font-semibold text-green-600 mb-2">{product.price || "Price N/A"}</div>
                      {product.description && (
                        <div className="text-sm text-gray-600 mb-4 line-clamp-3">{product.description}</div>
                      )}
                      <span className="w-full mt-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-600 transition text-lg shadow flex items-center justify-center gap-2">
                        View on Amazon
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
            
            {products.length === 0 && !loading && !error && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
                <p className="text-gray-300">We couldn&apos;t find any products matching your preferences. Try adjusting your selections or check back later.</p>
              </div>
            )}
            
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleRestart}
                className="px-8 py-4 bg-gray-600 rounded-xl text-xl font-bold hover:bg-gray-700 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleBack}
                className="px-8 py-4 bg-pink-600 rounded-xl text-xl font-bold hover:bg-pink-700 transition-colors"
              >
                Back to Analysis
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Analysis Steps
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Step {currentStep} of {ANALYSIS_STEPS.length - 1}</h2>
            <span className="text-gray-300">{ANALYSIS_STEPS[currentStep]}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / (ANALYSIS_STEPS.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Analysis Components */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <FaceAnalysisWidget
                onComplete={(result) => handleComplete('face', result.face_shape || 'Unknown')}
              />
            )}

            {currentStep === 2 && (
              <SkinToneAnalysisWidget
                onComplete={(result) => handleComplete('skin_tone', result)}
                onSkip={() => handleSkip('skin_tone')}
              />
            )}

            {currentStep === 3 && (
              <BodyAnalysisWidget
                onComplete={(result) => handleComplete('body', result.body_shape || 'Unknown')}
              />
            )}

            {currentStep === 4 && null}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep <= 1}
            className="px-6 py-3 bg-gray-600 rounded-lg text-white font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FemaleLanding() {
  return (
    <div className="min-h-screen bg-black">
      <GenderNavbar gender='female'/>
       <div>
         <FemaleHome />
        <OutfitRecommendations/>
        <OccasionRecommendations/>
        <MarqueeText/>
        <ProductGrid/>
       </div>
    </div>
  );
}


