'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { setUserData, updateUserData, markOnboardingCompleted } from '../../lib/userState';
import FaceAnalysisWidget from '../../components/FaceAnalysisWidget';
import SkinToneAnalysisWidget from '../../components/SkinToneAnalysisWidget';
import BodyAnalysisWidget from '../../components/BodyAnalysisWidget';
import PersonalityAnalysisWidget from '../../components/PersonalityAnalysisWidget';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

// Onboarding steps
const STEPS = {
  LOGIN: 'login',
  BASIC_INFO: 'basic_info',
  SKIN_FACE_ANALYSIS: 'skin_face_analysis',
  BODY_ANALYSIS: 'body_analysis',
  PERSONALITY_ANALYSIS: 'personality_analysis',
  COMPLETE: 'complete'
} as const;

type StepType = typeof STEPS[keyof typeof STEPS];

interface UserData {
  id:string;
  email: string;
  name: string;
  profile_picture: string;
  gender: 'male' | 'female' | '';
  location: string;
  skin_tone: string;
  face_shape: string | null;
  body_shape: string | null;
  personality: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  is_new_user: string;
}

interface Product {
  title: string;
  price: string;
  image: string;
  link: string;
}

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepType>(STEPS.LOGIN);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserDataState] = useState<UserData>({
    id:'',
    email: '',
    name: '',
    profile_picture:'',
    gender: '',
    location: '',
    skin_tone: '',
    face_shape: null,
    body_shape: null,
    personality: null,
    is_new_user:'',
    onboarding_completed: false
  });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to update user data in localStorage
  const updateUserDataInStorage = (updatedData: Partial<UserData>) => {
    const currentData = JSON.parse(localStorage.getItem('aurasync_user_data') || '{}');
    const newData = { ...currentData, ...updatedData };
    localStorage.setItem('aurasync_user_data', JSON.stringify(newData));
    setUserDataState(newData);
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // User is logged in with Firebase, verify with backend
        const idToken = await currentUser.getIdToken();
        const response = await fetch(`http://localhost:8000/auth/verify-user`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: currentUser.displayName,
            profile_picture: currentUser.photoURL,
            email: currentUser.email,
            firebase_id: currentUser.uid
          })
        });

        if (response.ok) {
          const backendUserData = await response.json();
          
          // Create combined user data
          const loggedInUser: UserData = {
            id: backendUserData.id,
            email: backendUserData.email,
            name: currentUser.displayName || '',
            profile_picture: currentUser.photoURL || '',
            gender: backendUserData.gender || '',
            location: backendUserData.location || '',
            skin_tone: backendUserData.skin_tone || '',
            face_shape: backendUserData.face_shape,
            body_shape: backendUserData.body_shape,
            personality: backendUserData.personality,
            onboarding_completed: backendUserData.onboarding_completed || false,
            is_new_user: backendUserData.is_new_user
          };

          setUserData(loggedInUser);
          setUserDataState(loggedInUser);

          // Store user data in localStorage for other pages to access
          localStorage.setItem('aurasync_user_data', JSON.stringify(loggedInUser));

          // Check onboarding completion and redirect accordingly
          if (loggedInUser.onboarding_completed) {
            // User has completed onboarding, redirect based on gender
            if (loggedInUser.gender === 'male') {
              router.push('/male');
            } else if (loggedInUser.gender === 'female') {
              router.push('/female');
            } else {
              // Fallback to male page if gender is not set
              router.push('/male');
            }
          } else {
            // User needs to complete onboarding, start from basic info
            setCurrentStep(STEPS.BASIC_INFO);
          }
        } else {
          // Backend verification failed, show login page
          setCurrentStep(STEPS.LOGIN);
        }
      } else {
        // No Firebase user, show login page
        setCurrentStep(STEPS.LOGIN);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setCurrentStep(STEPS.LOGIN);
    } finally {
      setIsLoading(false);
    }
  };


  // Optional: Create a separate utility function for backend authentication
const authenticateWithBackend = async (firebaseUser) => {
  try {
    const idToken = await firebaseUser.getIdToken();
    // ${process.env.NEXT_PUBLIC_BACKEND_URL}
    const response = await fetch(`http://localhost:8000/auth/verify-user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: firebaseUser.displayName,
        profile_picture: firebaseUser.photoURL,
        email: firebaseUser.email,
        firebase_id: firebaseUser.uid
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error response:', errorData);
      throw new Error(errorData.detail || `Backend authentication failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Backend authentication error:', error);
    throw error;
  }
};

  // Step 1: Login Component
  const LoginStep = () => {
    const handleGoogleLogin = async () => {
      try {
        // Step 1: Firebase Authentication
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;

      // Backend authentication and user registration
      const backendUserData = await authenticateWithBackend(firebaseUser);

            // Create combined user data
      const loggedInUser:UserData = {
        id: backendUserData.id,
        email: backendUserData.email,
        name: firebaseUser.displayName || '',
        profile_picture: firebaseUser.photoURL || '',
        gender: backendUserData.gender || '',
        location: backendUserData.location || '',
        skin_tone: backendUserData.skin_tone || '',
        face_shape: backendUserData.face_shape || null,
        body_shape: backendUserData.body_shape || null,
        personality: backendUserData.personality || null,
        onboarding_completed: backendUserData.onboarding_completed || false,
        is_new_user: backendUserData.is_new_user || ''
      };

      setUserData(loggedInUser);
      setUserDataState(loggedInUser);

      // Store user data in localStorage for other pages to access
      localStorage.setItem('aurasync_user_data', JSON.stringify(loggedInUser));

      // Check onboarding completion and navigate accordingly
      if (loggedInUser.onboarding_completed) {
        // User has completed onboarding, redirect based on gender
        if (loggedInUser.gender === 'male') {
          router.push('/male');
        } else if (loggedInUser.gender === 'female') {
          router.push('/female');
        } else {
          // Fallback to male page if gender is not set
          router.push('/male');
        }
      } else {
        // User needs to complete onboarding, start from basic info
        setCurrentStep(STEPS.BASIC_INFO);
      }
      } catch (error) {
        console.error('Google sign-in failed:', error);
        alert('Google sign-in failed. Please try again.');
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black"
      >
        <div className="text-center text-white p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to AuraSync</h1>
          <p className="text-xl mb-8 text-gray-300">Let&apos;s personalize your fashion journey</p>
          
          <button
            onClick={handleGoogleLogin}
            className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center mx-auto gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="mt-8">
            <button
              onClick={() => {
                // For testing - skip to next step
                const mockUserData: UserData = {
                  id: '1',
                  email: 'test@gmail.com',
                  name: '',
                  profile_picture: '',
                  gender: '',
                  location: 'Mumbai',
                  skin_tone: '',
                  face_shape: null,
                  body_shape: null,
                  personality: null,
                  onboarding_completed: false,
                  is_new_user: 'true'
                };
                setUserData(mockUserData);
                setUserDataState(mockUserData);
                
                // Store mock user data in localStorage
                localStorage.setItem('aurasync_user_data', JSON.stringify(mockUserData));
                
                setCurrentStep(STEPS.BASIC_INFO);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Skip for testing →
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Step 2: Basic Info Component
  const BasicInfoStep = () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (userData.name && userData.gender) {
        const updatedData = { ...userData };
        updateUserData(updatedData);
        setUserDataState(updatedData);
        
        // Update localStorage with the new data
        updateUserDataInStorage(updatedData);
        
        setCurrentStep(STEPS.SKIN_FACE_ANALYSIS);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Tell us about yourself</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserDataState({...userData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:border-white/50"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserDataState({...userData, gender: 'male'})}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    userData.gender === 'male' 
                      ? 'border-blue-400 bg-blue-400/20' 
                      : 'border-white/30 bg-white/10 hover:border-white/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👨</div>
                    <div className="font-medium">Male</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setUserDataState({...userData, gender: 'female'})}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    userData.gender === 'female' 
                      ? 'border-pink-400 bg-pink-400/20' 
                      : 'border-white/30 bg-white/10 hover:border-white/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👩</div>
                    <div className="font-medium">Female</div>
                  </div>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!userData.name || !userData.gender}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Continue to Analysis
            </button>
          </form>
        </div>
      </motion.div>
    );
  };

  // Step 3: Skin & Face Analysis Component
  const SkinFaceAnalysisStep = () => {
    const [analysisData, setAnalysisData] = useState({
      skin_tone: '',
      face_shape: ''
    });

    const [currentAnalysis, setCurrentAnalysis] = useState<'skin_tone' | 'face_shape' | null>(null);
    const [progress, setProgress] = useState(0);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [analysisResults, setAnalysisResults] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [faceLocked, setFaceLocked] = useState(false);
     const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleNext = () => {
      if (analysisData.skin_tone) {
        const updatedData = { ...userData, ...analysisData };
        updateUserData(updatedData);
        setUserDataState(updatedData);
        
        // Update localStorage with the new data
        updateUserDataInStorage(updatedData);
        
        setCurrentStep(STEPS.BODY_ANALYSIS);
      }
    };

    const startAnalysis = async (type: 'skin_tone' | 'face_shape', method: 'camera' | 'upload' = 'camera') => {
      if (type === 'face_shape' && faceLocked) return;
      setCurrentAnalysis(type);
      setProgress(0);
      setCapturedImages([]);
      setAnalysisResults([]);
      setIsAnalyzing(false);
      setShowManualInput(false);
      setUploadedImage(null);
      
      if (method === 'upload') {
        setShowUpload(true);
        setShowCamera(false);
        setIsAutoCapturing(false);
        // Trigger file input
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      } else {
        setShowCamera(true);
        setIsAutoCapturing(true);
        setShowUpload(false);
        // Start automatic capture process
        startAutoCapture();
      }
    };

    const startAutoCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        
        // Start automatic capture sequence
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          await captureImage();
          setProgress((i + 1) * 25);
        }
        
        // Stop camera after capturing
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        setShowCamera(false);
        setIsAutoCapturing(false);
        
      } catch (err) {
        console.error('Camera access error:', err);
        setShowCamera(false);
        setIsAutoCapturing(false);
        // Fallback to manual input
        handleManualInput(currentAnalysis!);
      }
    };

    const captureImage = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              setCapturedImages(prev => [...prev, imageUrl]);
              
              // Analyze the captured image
              await analyzeImage(blob);
            }
          }, 'image/jpeg');
        }
      }
    };

    const analyzeImage = async (blob: Blob) => {
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append('file', new File([blob], 'captured.jpg', { type: 'image/jpeg' }));
        
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const endpoint = currentAnalysis === 'skin_tone' 
          ? `${API}/analyze/skin-tone`
          : `${API}/analyze/face`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const data = await response.json();
        let result = '';
        
        if (currentAnalysis === 'skin_tone') {
          result = data.skin_tone || 'Unknown';
        } else {
          result = data.face_shape || 'Unknown';
        }
        
        setAnalysisResults(prev => [...prev, result]);
        
        // If we have 3 results, determine final result
        if (analysisResults.length + 1 >= 3) {
          const finalResults = [...analysisResults, result];
          const mostCommon = finalResults.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const finalResult = Object.entries(mostCommon).reduce((a, b) => 
            mostCommon[a[0]] > mostCommon[b[0]] ? a : b
          )[0];
          
          setAnalysisData(prev => ({ ...prev, [currentAnalysis!]: finalResult }));
          setCurrentAnalysis(null);
          setProgress(100);
        }
        
      } catch (error) {
        console.error('Analysis error:', error);
        // Add a default result if analysis fails
        const defaultResult = currentAnalysis === 'skin_tone' ? 'Warm' : 'Oval';
        setAnalysisResults(prev => [...prev, defaultResult]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleManualInput = (type: 'skin_tone' | 'face_shape') => {
      setCurrentAnalysis(type);
      setShowManualInput(true);
      setShowCamera(false);
      setIsAutoCapturing(false);
      setShowUpload(false);
      if (type === 'skin_tone') {
        setFaceLocked(true);
        setAnalysisData(prev => ({ ...prev, face_shape: '' }));
      }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Create preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setProgress(50);

      // Analyze the uploaded image
      try {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('file', file);
        
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const endpoint = currentAnalysis === 'skin_tone' 
          ? `${API}/analyze/skin-tone`
          : `${API}/analyze/face`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const data = await response.json();
        let result = '';
        
        if (currentAnalysis === 'skin_tone') {
          result = data.skin_tone || 'Unknown';
        } else {
          result = data.face_shape || 'Unknown';
        }
        
        setAnalysisResults([result]);
        setAnalysisData(prev => ({ ...prev, [currentAnalysis!]: result }));
        setCurrentAnalysis(null);
        setProgress(100);
        setShowUpload(false);
        
      } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed. Please try again or use manual selection.');
        setShowUpload(false);
        setCurrentAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleManualSelection = (value: string) => {
      setAnalysisData(prev => ({ ...prev, [currentAnalysis!]: value }));
      setCurrentAnalysis(null);
      setShowManualInput(false);
    };

    // Upload Analysis Component
    const UploadAnalysis = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          {currentAnalysis === 'skin_tone' ? 'Skin Tone Analysis' : 'Face Shape Analysis'}
          <span className="ml-2 text-sm px-2 py-1 rounded bg-green-500/20 text-green-300">
            Upload Analysis
          </span>
        </h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-300 mb-4">
          Progress: {progress}% - {isAnalyzing ? 'Analyzing...' : 'Ready'}
        </p>

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Analyzing uploaded image...</p>
          </div>
        )}

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <div className="mb-6 flex flex-col items-center">
            <img 
              src={uploadedImage} 
              alt="Uploaded image" 
              className="w-full max-w-md rounded-lg border-2 border-gray-700 mb-2 shadow-lg" 
            />
            <p className="text-sm text-gray-300">Uploaded image preview</p>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Analysis Result:</h4>
            <div className="bg-green-500/20 rounded-lg p-3">
              <p className="text-green-300 font-medium">
                {currentAnalysis === 'skin_tone' ? 'Skin Tone' : 'Face Shape'}: {analysisResults[0]}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => handleManualInput(currentAnalysis!)}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manual Input Instead
        </button>
      </div>
    );

    // Manual Input Components
    const SkinToneManualInput = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Select Your Skin Tone</h3>
        <div className="space-y-3">
          {['Warm', 'Cool', 'Neutral'].map((tone) => (
            <button
              key={tone}
              onClick={() => handleManualSelection(tone)}
              className="w-full p-3 rounded-lg border-2 border-white/30 bg-white/10 hover:border-white/50 transition-colors"
            >
              {tone}
            </button>
          ))}
        </div>
      </div>
    );

    const FaceShapeManualInput = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Select Your Face Shape</h3>
        <div className="space-y-3">
          {['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Rectangle'].map((shape) => (
            <button
              key={shape}
              onClick={() => handleManualSelection(shape)}
              className="w-full p-3 rounded-lg border-2 border-white/30 bg-white/10 hover:border-white/50 transition-colors"
            >
              {shape}
            </button>
          ))}
        </div>
      </div>
    );

    // Camera Analysis Component
    const CameraAnalysis = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          {currentAnalysis === 'skin_tone' ? 'Skin Tone Analysis' : 'Face Shape Analysis'}
        </h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-300 mb-4">
          Progress: {progress}% - {capturedImages.length}/3 images captured
        </p>

        {isAutoCapturing && (
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              Auto-capturing in progress...
            </div>
            <p className="text-sm text-gray-300">Please stay still while we capture 3 images</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Analyzing image...</p>
          </div>
        )}

        {/* Camera Feed */}
        {showCamera && (
          <div className="mb-6 flex flex-col items-center">
            <video 
              ref={videoRef} 
              className="w-full max-w-md rounded-lg border-2 border-gray-700 mb-2 shadow-lg" 
              autoPlay 
              playsInline 
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {capturedImages.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Captured Images:</h4>
            <div className="grid grid-cols-3 gap-2">
              {capturedImages.map((img, index) => (
                <div key={index} className="bg-white/20 rounded p-2 text-center text-sm">
                  <img src={img} alt={`Image ${index + 1}`} className="w-full h-20 object-cover rounded mb-1" />
                  Image {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Analysis Results:</h4>
            <div className="space-y-1">
              {analysisResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-300">
                  Image {index + 1}: {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => handleManualInput(currentAnalysis!)}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manual Input Instead
        </button>
      </div>
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Skin Tone & Face Shape Analysis</h2>
          <p className="text-center text-gray-300 mb-8">Let&apos;s analyze your skin tone and face shape</p>
          
          {/* Show upload analysis if active */}
          {showUpload && currentAnalysis && (
            <div className="mb-8">
              <UploadAnalysis />
            </div>
          )}

          {/* Show camera analysis if active */}
          {currentAnalysis && !showManualInput && !showUpload && (
            <div className="mb-8">
              <CameraAnalysis />
            </div>
          )}

          {/* Show manual input if active */}
          {showManualInput && currentAnalysis === 'skin_tone' && <SkinToneManualInput />}
          {showManualInput && currentAnalysis === 'face_shape' && <FaceShapeManualInput />}

          {/* Show analysis options if no analysis is active */}
          {!currentAnalysis && !showManualInput && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Skin Tone Analysis - Compulsory */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">🎨</span>
                  Skin Tone Analysis
                  <span className="ml-2 text-red-400 text-sm">*Required</span>
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  {analysisData.skin_tone ? `Selected: ${analysisData.skin_tone}` : 'Not completed'}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => startAnalysis('skin_tone', 'upload')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    📁 Upload Photo
                  </button>
                  <button
                    onClick={() => startAnalysis('skin_tone', 'camera')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    📷 Camera Analysis
                  </button>
                  <button
                    onClick={() => handleManualInput('skin_tone')}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ✏️ Manual Selection
                  </button>
                </div>
              </div>

              {/* Face Analysis - Optional */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Face Shape Analysis
                  <span className="ml-2 text-gray-400 text-sm">Optional</span>
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  {analysisData.face_shape ? `Selected: ${analysisData.face_shape}` : 'Not completed'}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => startAnalysis('face_shape', 'upload')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    📁 Upload Photo
                  </button>
                  <button
                    onClick={() => startAnalysis('face_shape', 'camera')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    📷 Camera Analysis
                  </button>
                  <button
                    onClick={() => handleManualInput('face_shape')}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ✏️ Manual Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentStep(STEPS.BASIC_INFO)}
              className="px-8 py-3 rounded-lg border-2 border-white/30 bg-white/10 text-white hover:border-white/50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!analysisData.skin_tone}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Next: Body Analysis
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Step 4: Body Analysis Component
  const BodyAnalysisStep = () => {
    const [analysisData, setAnalysisData] = useState({
      body_shape: ''
    });

    const [currentAnalysis, setCurrentAnalysis] = useState<'body_shape' | null>(null);
    const [progress, setProgress] = useState(0);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [analysisResults, setAnalysisResults] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleNext = () => {
      const updatedData = { ...userData, body_shape: analysisData.body_shape };
      updateUserData(updatedData);
      setUserDataState(updatedData);
      
      // Update localStorage with the new data
      updateUserDataInStorage(updatedData);
      
      setCurrentStep(STEPS.PERSONALITY_ANALYSIS);
    };

    const startAnalysis = async (type: 'body_shape', method: 'camera' | 'upload' = 'camera') => {
      setCurrentAnalysis(type);
      setProgress(0);
      setCapturedImages([]);
      setAnalysisResults([]);
      setIsAnalyzing(false);
      setShowManualInput(false);
      setUploadedImage(null);
      

      
      if (method === 'upload') {
        setShowUpload(true);
        setShowCamera(false);
        setIsAutoCapturing(false);
        // Trigger file input
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      } else {
        setShowCamera(true);
        setIsAutoCapturing(true);
        setShowUpload(false);
        // Start automatic capture process
        startAutoCapture();
      }
    };

    const startAutoCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        
        // Start automatic capture sequence
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          await captureImage();
          setProgress((i + 1) * 25);
        }
        
        // Stop camera after capturing
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        setShowCamera(false);
        setIsAutoCapturing(false);
        
      } catch (err) {
        console.error('Camera access error:', err);
        setShowCamera(false);
        setIsAutoCapturing(false);
        // Fallback to manual input
        handleManualInput('body_shape');
      }
    };

    const captureImage = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              setCapturedImages(prev => [...prev, imageUrl]);
              
              // Analyze the captured image
              await analyzeImage(blob);
            }
          }, 'image/jpeg');
        }
      }
    };

    const analyzeImage = async (blob: Blob) => {
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append('file', new File([blob], 'captured.jpg', { type: 'image/jpeg' }));
        
        // Use basic body analysis endpoint
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const endpoint = `${API}/analyze/body`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const data = await response.json();
        const result = data.body_shape || 'Unknown';
        
        // Log analysis details for debugging
        console.log('Body analysis result:', {
          body_shape: data.body_shape,
          confidence: data.confidence,
          analysis_type: data.analysis_type,
          probabilities: data.probabilities
        });
        
        setAnalysisResults(prev => [...prev, result]);
        
        // If we have 3 results, determine final result
        if (analysisResults.length + 1 >= 3) {
          const finalResults = [...analysisResults, result];
          const mostCommon = finalResults.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const finalResult = Object.entries(mostCommon).reduce((a, b) => 
            mostCommon[a[0]] > mostCommon[b[0]] ? a : b
          )[0];
          
          setAnalysisData(prev => ({ ...prev, [currentAnalysis!]: finalResult }));
          setCurrentAnalysis(null);
          setProgress(100);
        }
        
      } catch (error) {
        console.error('Analysis error:', error);
        // Add a default result if analysis fails
        const defaultResult = userData.gender === 'female' ? 'Hourglass' : 'Mesomorph';
        setAnalysisResults(prev => [...prev, defaultResult]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleManualInput = (type: 'body_shape') => {
      setCurrentAnalysis(type);
      setShowManualInput(true);
      setShowCamera(false);
      setIsAutoCapturing(false);
      setShowUpload(false);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Create preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setProgress(50);

      // Analyze the uploaded image
      try {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('file', file);
        
        // Use basic body analysis endpoint
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const endpoint = `${API}/analyze/body`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const data = await response.json();
        const result = data.body_shape || 'Unknown';
        
        // Log analysis details for debugging
        console.log('Body analysis result:', {
          body_shape: data.body_shape,
          confidence: data.confidence,
          analysis_type: data.analysis_type,
          probabilities: data.probabilities
        });
        
        setAnalysisResults([result]);
        setAnalysisData(prev => ({ ...prev, [currentAnalysis!]: result }));
        setCurrentAnalysis(null);
        setProgress(100);
        setShowUpload(false);
        
      } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed. Please try again or use manual selection.');
        setShowUpload(false);
        setCurrentAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleManualSelection = (value: string) => {
      setAnalysisData(prev => ({ ...prev, [currentAnalysis!]: value }));
      setCurrentAnalysis(null);
      setShowManualInput(false);
    };

    // Upload Analysis Component
    const UploadAnalysis = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          Body Shape Analysis 
          <span className="ml-2 text-sm px-2 py-1 rounded bg-blue-500/20 text-blue-300">
            Upload
          </span>
        </h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-300 mb-4">
          Progress: {progress}% - {isAnalyzing ? 'Analyzing...' : 'Ready'}
        </p>

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Analyzing uploaded image...</p>
          </div>
        )}

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <div className="mb-6 flex flex-col items-center">
            <img 
              src={uploadedImage} 
              alt="Uploaded image" 
              className="w-full max-w-md rounded-lg border-2 border-gray-700 mb-2 shadow-lg" 
            />
            <p className="text-sm text-gray-300">Uploaded image preview</p>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Analysis Result:</h4>
            <div className="bg-green-500/20 rounded-lg p-3">
              <p className="text-green-300 font-medium">
                Body Shape: {analysisResults[0]}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => handleManualInput('body_shape')}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manual Input Instead
        </button>
      </div>
    );

    // Manual Input Component
    const BodyShapeManualInput = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Select Your Body Shape</h3>
        <div className="space-y-3">
          {userData.gender === 'female' 
            ? ['Hourglass', 'Rectangle', 'Inverted Triangle', 'Apple', 'Pear'].map((shape) => (
                <button
                  key={shape}
                  onClick={() => handleManualSelection(shape)}
                  className="w-full p-3 rounded-lg border-2 border-white/30 bg-white/10 hover:border-white/50 transition-colors"
                >
                  {shape}
                </button>
              ))
            : ['Mesomorph', 'Ectomorph', 'Trapezoid', 'Endomorph'].map((shape) => (
                <button
                  key={shape}
                  onClick={() => handleManualSelection(shape)}
                  className="w-full p-3 rounded-lg border-2 border-white/30 bg-white/10 hover:border-white/50 transition-colors"
                >
                  {shape}
                </button>
              ))
          }
        </div>
      </div>
    );

    // Camera Analysis Component
    const CameraAnalysis = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          Body Shape Analysis 
          <span className="ml-2 text-sm px-2 py-1 rounded bg-blue-500/20 text-blue-300">
            Camera
          </span>
        </h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-300 mb-4">
          Progress: {progress}% - {capturedImages.length}/3 images captured
        </p>

        {isAutoCapturing && (
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              Auto-capturing in progress...
            </div>
            <p className="text-sm text-gray-300">Please stay still while we capture 3 images</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Analyzing image...</p>
          </div>
        )}

        {/* Camera Feed */}
        {showCamera && (
          <div className="mb-6 flex flex-col items-center">
            <video 
              ref={videoRef} 
              className="w-full max-w-md rounded-lg border-2 border-gray-700 mb-2 shadow-lg" 
              autoPlay 
              playsInline 
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {capturedImages.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Captured Images:</h4>
            <div className="grid grid-cols-3 gap-2">
              {capturedImages.map((img, index) => (
                <div key={index} className="bg-white/20 rounded p-2 text-center text-sm">
                  <img src={img} alt={`Image ${index + 1}`} className="w-full h-20 object-cover rounded mb-1" />
                  Image {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Analysis Results:</h4>
            <div className="space-y-1">
              {analysisResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-300">
                  Image {index + 1}: {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => handleManualInput('body_shape')}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manual Input Instead
        </button>
      </div>
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Body Shape Analysis</h2>
          <p className="text-center text-gray-300 mb-8">Let&apos;s analyze your body shape</p>
          
          {/* Show upload analysis if active */}
          {showUpload && currentAnalysis && (
            <div className="mb-8">
              <UploadAnalysis />
            </div>
          )}

          {/* Show camera analysis if active */}
          {currentAnalysis && !showManualInput && !showUpload && (
            <div className="mb-8">
              <CameraAnalysis />
            </div>
          )}

          {/* Show manual input if active */}
          {showManualInput && currentAnalysis === 'body_shape' && <BodyShapeManualInput />}

          {/* Show analysis options if no analysis is active */}
          {!currentAnalysis && !showManualInput && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">👕</span>
                  Body Shape Analysis
                  <span className="ml-2 text-gray-400 text-sm">Optional</span>
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  {analysisData.body_shape ? `Selected: ${analysisData.body_shape}` : 'Not completed'}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => startAnalysis('body_shape', 'upload')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    📁 Upload Photo
                  </button>
                  <button
                    onClick={() => startAnalysis('body_shape', 'camera')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    📷 Camera Analysis
                  </button>
                  <button
                    onClick={() => handleManualInput('body_shape')}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ✏️ Manual Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentStep(STEPS.SKIN_FACE_ANALYSIS)}
              className="px-8 py-3 rounded-lg border-2 border-white/30 bg-white/10 text-white hover:border-white/50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Next: Personality Analysis
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Step 5: Personality Analysis Component (16 Questions)
  const PersonalityAnalysisStep = () => {
      const handleNext = (personalityType: string) => {
    const updatedData = { ...userData, personality: personalityType };
    updateUserData(updatedData);
    setUserDataState(updatedData);
    
    // Update localStorage with the new data
    updateUserDataInStorage(updatedData);
    
    setCurrentStep(STEPS.COMPLETE);
  };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Personality Analysis</h2>
          <p className="text-center text-gray-300 mb-8">Discover your style personality with our 16-question assessment</p>
          
          <PersonalityAnalysisWidget onComplete={handleNext} />
        </div>
      </motion.div>
    );
  };



  // Step 6: Complete Component
  const CompleteStep = () => {
    const handleComplete = async () => {
      try {
        // Mark onboarding as completed in the backend
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          const response = await fetch(`http://localhost:8000/auth/update-onboarding`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              onboarding_completed: true,
              gender: userData.gender,
              name: userData.name,
              skin_tone: userData.skin_tone,
              face_shape: userData.face_shape,
              body_shape: userData.body_shape,
              personality: userData.personality
            })
          });

          if (response.ok) {
            // Store user data in localStorage for other pages to access
            const userDataForStorage = {
              ...userData,
              onboarding_completed: true
            };
            localStorage.setItem('aurasync_user_data', JSON.stringify(userDataForStorage));
            
            // Redirect to gender-specific homepage
            if (userData.gender === 'male') {
              router.push('/male');
            } else if (userData.gender === 'female') {
              router.push('/female');
            } else {
              // Fallback to male page
              router.push('/male');
            }
          } else {
            console.error('Failed to update onboarding status');
            // Still redirect even if update fails
            router.push(userData.gender === 'male' ? '/male' : '/female');
          }
        } else {
          // No user logged in, redirect anyway
          router.push(userData.gender === 'male' ? '/male' : '/female');
        }
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Redirect even if there's an error
        router.push(userData.gender === 'male' ? '/male' : '/female');
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black"
      >
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to AuraSync!</h1>
          <p className="text-xl mb-8 text-gray-300">
            Your personalized fashion journey is ready to begin
          </p>
          
          <button
            onClick={handleComplete}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Start Exploring
          </button>
        </div>
      </motion.div>
    );
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Render current step
  return (
    <AnimatePresence mode="wait">
      {currentStep === STEPS.LOGIN && <LoginStep key="login" />}
      {currentStep === STEPS.BASIC_INFO && <BasicInfoStep key="basic_info" />}
      {currentStep === STEPS.SKIN_FACE_ANALYSIS && <SkinFaceAnalysisStep key="skin_face_analysis" />}
      {currentStep === STEPS.BODY_ANALYSIS && <BodyAnalysisStep key="body_analysis" />}
      {currentStep === STEPS.PERSONALITY_ANALYSIS && <PersonalityAnalysisStep key="personality_analysis" />}
      {currentStep === STEPS.COMPLETE && <CompleteStep key="complete" />}
    </AnimatePresence>
  );
}
