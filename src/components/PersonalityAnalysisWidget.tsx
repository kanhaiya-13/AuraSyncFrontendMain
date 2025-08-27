"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mbtiQuestions = [
  { question: "You find it takes effort to introduce yourself to other people.", dimension: 'IE', direction: 1 },
  { question: "You get energized going to social events that involve many interactions.", dimension: 'IE', direction: -1 },
  { question: "You do not mind being at the center of attention.", dimension: 'IE', direction: -1 },
  { question: "You often prefer to work alone.", dimension: 'IE', direction: 1 },
  { question: "You consider yourself more practical than creative.", dimension: 'SN', direction: 1 },
  { question: "You often spend time exploring unrealistic and impractical yet intriguing ideas.", dimension: 'SN', direction: -1 },
  { question: "You often contemplate the reasons for human existence.", dimension: 'SN', direction: -1 },
  { question: "Your travel plans are usually well thought out.", dimension: 'SN', direction: 1 },
  { question: "Logic is usually more important than heart when it comes to making important decisions.", dimension: 'TF', direction: 1 },
  { question: "Winning a debate matters less to you than making sure no one gets upset.", dimension: 'TF', direction: -1 },
  { question: "You often have a hard time understanding other people's feelings.", dimension: 'TF', direction: 1 },
  { question: "You rarely worry about how your actions affect other people.", dimension: 'TF', direction: 1 },
  { question: "Your home and work environments are quite tidy.", dimension: 'JP', direction: 1 },
  { question: "Deadlines seem to you to be of relative rather than absolute importance.", dimension: 'JP', direction: -1 },
  { question: "Keeping your options open is more important than having a to-do list.", dimension: 'JP', direction: -1 },
  { question: "You like to have a to-do list for each day.", dimension: 'JP', direction: 1 }
];

const scale = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 }
];

function calculateMbti(answers: number[]): string {
  let scores = { IE: 0, SN: 0, TF: 0, JP: 0 };
  mbtiQuestions.forEach((q, i) => {
    scores[q.dimension as keyof typeof scores] += (answers[i] - 3) * q.direction;
  });
  let mbti = '';
  mbti += scores.IE > 0 ? 'I' : 'E';
  mbti += scores.SN > 0 ? 'S' : 'N';
  mbti += scores.TF > 0 ? 'T' : 'F';
  mbti += scores.JP > 0 ? 'J' : 'P';
  return mbti;
}

interface PersonalityAnalysisWidgetProps {
  onComplete?: (mbti: string) => void;
}

const PersonalityAnalysisWidget: React.FC<PersonalityAnalysisWidgetProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(mbtiQuestions.length).fill(3));
  const [showResult, setShowResult] = useState(false);
  const [mbti, setMbti] = useState('');
  const [showNext, setShowNext] = useState(false);

  const handleChange = (value: number) => {
    setAnswers(a => a.map((v, i) => (i === step ? value : v)));
  };
  const handleNext = () => {
    if (step < mbtiQuestions.length - 1) setStep(s => s + 1);
    else {
      const result = calculateMbti(answers);
      setMbti(result);
      setShowResult(true);
      setShowNext(true);
    }
  };
  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Personality Analysis</h1>
      {!showResult ? (
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center"
            >
              <div className="text-xl font-semibold mb-6">{mbtiQuestions[step].question}</div>
              <div className="flex flex-col gap-4 w-full">
                {scale.map(opt => (
                  <label key={opt.value} className="flex items-center gap-4 cursor-pointer">
                    <input
                      type="radio"
                      name={`q${step}`}
                      value={opt.value}
                      checked={answers[step] === opt.value}
                      onChange={() => handleChange(opt.value)}
                      className="accent-indigo-500 w-5 h-5"
                    />
                    <span className="text-lg">{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  className="px-6 py-2 bg-gray-600 rounded-lg text-lg font-semibold hover:bg-gray-700 transition"
                  onClick={handleBack}
                  disabled={step === 0}
                >Back</button>
                <button
                  className="px-6 py-2 bg-indigo-600 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
                  onClick={handleNext}
                >{step === mbtiQuestions.length - 1 ? 'Finish' : 'Next'}</button>
              </div>
              <div className="mt-4 text-gray-400">Question {step + 1} of {mbtiQuestions.length}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center w-full max-w-xl">
          <div className="text-2xl font-bold text-green-400 mb-4">Your MBTI Type: {mbti}</div>
          {showNext && (
            <button
              className="mt-4 px-8 py-3 bg-indigo-600 rounded-xl text-xl font-bold hover:bg-indigo-700 transition"
              onClick={() => onComplete && onComplete(mbti)}
            >Next</button>
          )}
          <button className="mt-4 px-8 py-3 bg-gray-600 rounded-xl text-xl font-bold hover:bg-gray-700 transition" onClick={() => setShowResult(false)}>Retake Quiz</button>
        </div>
      )}
    </div>
  );
};

export default PersonalityAnalysisWidget; 