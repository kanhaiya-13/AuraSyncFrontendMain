'use client';

import React from 'react';
import { getUserData } from '../../lib/userState';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const userData = getUserData();
  const router = useRouter();

  // Redirect if no user data
  React.useEffect(() => {
    if (!userData) {
      router.push('/');
    }
  }, [userData, router]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Dashboard</h1>
          <p className="text-gray-300">Your personalized fashion profile</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Basic Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Name:</span>
                <span className="font-medium">{userData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="font-medium">{userData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Gender:</span>
                <span className="font-medium capitalize">{userData.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Location:</span>
                <span className="font-medium">{userData.location}</span>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">🔬</span>
              Analysis Results
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Skin Tone:</span>
                <span className={`font-medium ${userData.skin_tone ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.skin_tone || 'Not completed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Face Shape:</span>
                <span className={`font-medium ${userData.face_shape ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.face_shape || 'Not completed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Body Shape:</span>
                <span className={`font-medium ${userData.body_shape ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.body_shape || 'Not completed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Personality:</span>
                <span className={`font-medium ${userData.personality ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.personality || 'Not completed'}
                </span>
              </div>
            </div>
          </div>

          {/* Onboarding Status */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">✅</span>
              Onboarding Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Profile Complete:</span>
                <span className={`font-medium ${userData.onboarding_completed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {userData.onboarding_completed ? 'Yes' : 'In Progress'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Hairstyle Access:</span>
                <span className={`font-medium ${userData.face_shape ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.face_shape ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/${userData.gender}`)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                🏠 Go to Homepage
              </button>
              <button
                onClick={() => router.push('/search')}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all"
              >
                🔍 Search Products
              </button>
              {userData.face_shape && (
                <button
                  onClick={() => router.push('/hairstyle')}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 transition-all"
                >
                  💇 Hairstyle Recommendations
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Completion Progress */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Analysis Completion
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span>{userData.onboarding_completed ? '100%' : '75%'}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: userData.onboarding_completed ? '100%' : '75%' }}
              ></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className={`text-center p-3 rounded-lg ${userData.skin_tone ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Skin Tone
              </div>
              <div className={`text-center p-3 rounded-lg ${userData.face_shape ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Face Shape
              </div>
              <div className={`text-center p-3 rounded-lg ${userData.body_shape ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Body Shape
              </div>
              <div className={`text-center p-3 rounded-lg ${userData.personality ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Personality
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
