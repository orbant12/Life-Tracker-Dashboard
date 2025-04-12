import { TrendingDown, Scale, Target, ArrowRight, Zap } from 'lucide-react';
import React, { useState } from 'react';



export const WeightPanel = ({selectedDate}) => {
    const [weight, setWeight] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // New state for loading
    const [isPoop, setIsPoop] = useState(false)
    const [isBloated, setIsBloated] = useState(false)
    const [isWatery, setIsWatery] = useState(false)
    const [isBadSleep, setIsBadSleep] = useState(false)
    
    const feelings = [
      { emoji: '💩', label: 'Poop', color: 'bg-amber-50 border-amber-200' },
      { emoji: '💨', label: 'Bloated', color: 'bg-red-50 border-gray-200' },
      { emoji: '🌊', label: 'Watery', color: 'bg-blue-50 border-blue-200' },
      { emoji: '😴', label: 'Bad Sleep', color: 'bg-purple-50 border-purple-200' }
    ];
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (weight !== null && weight !== '') {
        setIsLoading(true); // Start loading
        
        fetch('/api/weight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            weight: parseFloat(weight),
            bloated: isBloated,
            poop: isPoop,
            watery: isWatery,
            isBadSleep: isBadSleep,
            date: selectedDate
          }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Weight saved successfully:', data);
          setSubmitted(true);
          setIsLoading(false); // Stop loading on success
        })
        .catch(error => {
          console.error('Error saving weight:', error);
          setIsLoading(false); // Stop loading on error
        })
        .finally(() => {
          setTimeout(() => {
            setSubmitted(false);
            setWeight('');
          }, 3000);
        });
      }
    };
    
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  
    const handleToggle = (name) => {
      if(name == "Poop"){
          setIsPoop(!isPoop)
      } else if (name == "Bad Sleep"){
          setIsBadSleep(!isBadSleep)
      } else if (name == "Watery"){
          setIsWatery(!isWatery)
      } else if (name == "Bloated"){
          setIsBloated(!isBloated)
      }
    }
  
    return (
      <div className="w-full bg-white to-indigo-50 p-6 rounded-xl shadow-lg">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800"></h1>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
              <Scale size={18} className="text-indigo-600" />
              <span className="font-semibold text-gray-700">{today}</span>
            </div>
          </div>
          
          {/* Feelings Icons */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {feelings.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  item.label == "Poop" && setIsPoop(true)
                  item.label == "Bloated" && setIsBloated(true)
                  item.label == "Watery" && setIsWatery(true)
                  item.label == "Bad Sleep" && setIsBadSleep(true)
                  handleToggle(item.label)
              }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  item.label === "Poop" && isPoop || item.label === "Bad Sleep" && isBadSleep || item.label === "Bloated" && isBloated || item.label === "Watery" && isWatery
                    ? 'border-indigo-500 shadow-md transform scale-105' 
                    : `border-gray-200 ${item.color}`
                }`}
              >
                <span className="text-4xl mb-2">{item.emoji}</span>
                <span className="font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
          
          {/* Weight Input */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex flex-col">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter your weight"
                  className="w-full p-4 text-2xl font-bold text-center text-indigo-600 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  kg
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button
                type="submit"
                disabled={weight === '' || isLoading}
                className={`flex w-full items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                  weight === '' || isLoading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Log Weight</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Confirmation Message */}
          {submitted && (
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg animate-pulse">
              <div className="flex items-center">
                <Zap size={24} className="text-green-500 mr-3" />
                <p className="text-green-700">
                  Weight logged successfully! Keep up the great work.
                </p>
              </div>
            </div>
          )}
          
          {/* Progress Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingDown size={18} className="text-green-500" />
                  <span className="font-medium text-gray-700">Weekly Change</span>
                </div>
                <span className="text-lg font-bold text-green-500">-1 kg</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target size={18} className="text-indigo-500" />
                  <span className="font-medium text-gray-700">Goal Distance</span>
                </div>
                <span className="text-lg font-bold text-indigo-500">72 kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  