import React, { useState } from 'react';
import { Activity, Heart, Dumbbell, Bike, FootprintsIcon, Trophy, ArrowRight, Zap } from 'lucide-react';

const ExercisePanel = () => {
  const [activeTab, setActiveTab] = useState('steps');

  const [formData, setFormData] = useState({
    steps: '',
    zone2Minutes: '',
    zone2HeartRate: '',
    vo2MaxScore: '',
    gymMinutes: '',
    gymCalories: '',
    bikeMinutes: '',
    bikeDistance: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const calculateCalorieBurn = (type,duration,distance) => {
    if(type == "zone2"){
      const caloriesPerMin = 11
      const kmPerBurn = 75
      const total_1 = caloriesPerMin * duration;
      const total_2 = kmPerBurn * distance
      if(total_1 >= total_2){
        return total_1
      } else {
        return total_2
      }
    } else if (type == "gym") {
      const caloriesPerMin = selectedType == 'fullbody' ? 9 : 7
      const total = caloriesPerMin * duration;
      return total
    } else if (type == "steps"){
      const perStep = 0.04
      const total = perStep * duration
      return total
    } else if (type == "bike"){
      const caloriesPerMin = 8
      const kmPerBurn = 28
      const total_2 = caloriesPerMin * duration
      const total_1 = kmPerBurn * distance
      if(total_1 >= total_2){
        return total_1
      } else {
        return total_2
      }
      
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const logSteps = async () => {
    if (!formData.steps) return;
    
    try {
      setSubmitted(true);
      const burn = await calculateCalorieBurn(activeTab,formData.steps,0)
      const response = await fetch("/api/steps", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steps: parseInt(formData.steps),
          burn:burn
        }),
      });
      
      const data = await response.json();
      console.log('Steps logged successfully:', data);
      
      // Reset form after timeout
      setTimeout(() => {
        setSubmitted(false);
        setFormData(prev => ({ ...prev, steps: '' }));
      }, 3000);
    } catch (error) {
      console.error('Error logging steps:', error);
      setSubmitted(false);
    }
  };
  
  const logExercise = async () => {
    try {
      setSubmitted(true);
      
      let requestBody = {};

      // Create request body based on active tab
      if (activeTab === 'zone2' && formData.zone2Minutes && formData.zone2HeartRate) {
        const burn = await calculateCalorieBurn(activeTab,formData.zone2Minutes,formData.zone2HeartRate)
        requestBody = {
          exerciseType: 'zone2',
          duration: parseInt(formData.zone2Minutes),
          distance: parseFloat(formData.zone2HeartRate),
          burn: burn,
        };
      } 
      else if (activeTab === 'vo2max' && formData.vo2MaxScore) {
        requestBody = {
          exerciseType: 'vo2max',
          duration: 0, // You might want to add a duration field to your VO2Max form
          vo2max: parseFloat(formData.vo2MaxScore)
        };
      }
      else if (activeTab === 'gym' && formData.gymMinutes && selectedType) {
        const burn = await calculateCalorieBurn(activeTab,formData.gymMinutes,0)
        requestBody = {
          exerciseType: 'gym',
          duration: parseInt(formData.gymMinutes),
          workoutType: selectedType,
          burn:burn,
        };
      }
      else {
        // If required fields aren't filled, exit early
        setSubmitted(false);
        return;
      }
      
      const response = await fetch("/api/exercise", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      console.log('Exercise logged successfully:', data);
      
      // Reset form after timeout
      setTimeout(() => {
        setSubmitted(false);
        
        if (activeTab === 'zone2') {
          setFormData(prev => ({ ...prev, zone2Minutes: '', zone2HeartRate: '' }));
        } else if (activeTab === 'vo2max') {
          setFormData(prev => ({ ...prev, vo2MaxScore: '' }));
        } else if (activeTab === 'gym') {
          setFormData(prev => ({ ...prev, gymMinutes: '' }));
          setSelectedType('');
        }
      }, 3000);
    } catch (error) {
      console.error('Error logging exercise:', error);
      setSubmitted(false);
    }
  };
  
  const logBike = async () => {
    if (!formData.bikeMinutes || !formData.bikeDistance) return;
    
    try {
      setSubmitted(true);
      const burn = await calculateCalorieBurn(activeTab,formData.bikeMinutes,formData.bikeDistance)
      const response = await fetch("/api/bike", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: parseInt(formData.bikeMinutes),
          distance: parseFloat(formData.bikeDistance),
          burn: burn
        }),
      });
      
      const data = await response.json();
      console.log('Cycling data logged successfully:', data);
      
      // Reset form after timeout
      setTimeout(() => {
        setSubmitted(false);
        setFormData(prev => ({ ...prev, bikeMinutes: '', bikeDistance: '' }));
      }, 3000);
    } catch (error) {
      console.error('Error logging cycling data:', error);
      setSubmitted(false);
    }
  };
  
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if form is valid first
    if (isCurrentTabEmpty()) return;
    
    // Call the appropriate logging function based on the active tab
    switch (activeTab) {
      case 'steps':
        logSteps();
        break;
      case 'zone2':
      case 'vo2max':
      case 'gym':
        logExercise();
        break;
      case 'bike':
        logBike();
        break;
      default:
        break;
    }
  }
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const exerciseTabs = [
    { id: 'steps', icon: FootprintsIcon, label: 'Steps', color: 'text-blue-500' },
    { id: 'zone2', icon: Heart, label: 'Zone 2', color: 'text-green-500' },
    { id: 'vo2max', icon: Activity, label: 'VO2 Max', color: 'text-purple-500' },
    { id: 'gym', icon: Dumbbell, label: 'Gym', color: 'text-red-500' },
    { id: 'bike', icon: Bike, label: 'Bike', color: 'text-amber-500' }
  ];
  
  const workoutTypes = [
    { id: 'pull', label: 'Pull' },
    { id: 'push', label: 'Push' },
    { id: 'fullbody', label: 'Full Body' }
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'steps':
        return (
          <div className="space-y-4">
            <div className="relative">
    
              <input
                type="number"
                name="steps"
                value={formData.steps}
                onChange={handleInputChange}
                placeholder="Enter steps"
                className="w-full p-4 text-2xl font-bold text-center text-blue-600 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                steps
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-2">
                <Trophy size={18} className="text-blue-500" />
                <span className="text-sm text-gray-600">Daily Goal: 10,000 steps</span>
              </div>
            </div>
          </div>
        );
      case 'zone2':
        return (
          <div className="space-y-4">
            <div className="relative">
         
              <input
                type="number"
                name="zone2Minutes"
                value={formData.zone2Minutes}
                onChange={handleInputChange}
                placeholder="Enter duration"
                className="w-full p-4 text-2xl font-bold text-center text-green-600 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                minutes
              </div>
            </div>
            <div className="relative">
           
              <input
                type="number"
                name="zone2HeartRate"
                value={formData.zone2HeartRate}
                onChange={handleInputChange}
                placeholder="Enter Distance"
                className="w-full p-4 text-2xl font-bold text-center text-green-600 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                km
              </div>
            </div>
          </div>
        );
      case 'vo2max':
        return (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                name="vo2MaxScore"
                value={formData.vo2MaxScore}
                onChange={handleInputChange}
                placeholder="Enter VO2 Max"
                className="w-full p-4 text-2xl font-bold text-center text-purple-600 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                ml/kg/min
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Previous: 42.3</span>
                <span className="text-sm font-semibold text-purple-600">+0.5 Improvement</span>
              </div>
            </div>
          </div>
        );
      case 'gym':
        return (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                name="gymMinutes"
                value={formData.gymMinutes}
                onChange={handleInputChange}
                placeholder="Enter duration"
                className="w-full p-4 text-2xl font-bold text-center text-red-600 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                minutes
              </div>
            </div>
            <div className="w-full">
  
      <div className="grid grid-cols-3 gap-3">
        {workoutTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedType === type.id
                ? 'border-red-500 bg-red-50 text-red-700 font-bold shadow-md'
                : 'border-gray-200 hover:border-red-300 text-gray-700'
            }`}
          >
            {type.label}
          </div>
        ))}
      </div>
    </div>
          </div>
        );
      case 'bike':
        return (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                name="bikeMinutes"
                value={formData.bikeMinutes}
                onChange={handleInputChange}
                placeholder="Enter duration"
                className="w-full p-4 text-2xl font-bold text-center text-amber-600 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                minutes
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                name="bikeDistance"
                value={formData.bikeDistance}
                onChange={handleInputChange}
                placeholder="Enter distance"
                className="w-full p-4 text-2xl font-bold text-center text-amber-600 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                km
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  const isCurrentTabEmpty = () => {
    switch (activeTab) {
      case 'steps':
        return !formData.steps;
      case 'vo2max':
        return !formData.vo2MaxScore;
        case 'zone2':
            return !formData.zone2Minutes || !formData.zone2HeartRate;  // OR operator
          case 'gym':
            return !formData.gymMinutes || !(selectedType);  // OR operator
          case 'bike':
            return !formData.bikeMinutes || !formData.bikeDistance;  // OR operator
      default:
        return true;
    }
  };
  
  const getActiveTabColor = () => {
    const tab = exerciseTabs.find(tab => tab.id === activeTab);
    return tab ? tab.color.replace('text-', 'bg-').replace('-500', '-600') : 'bg-blue-600';
  };
  
  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800"></h1>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
            <Activity size={18} className="text-indigo-600" />
            <span className="font-semibold text-gray-700">{today}</span>
          </div>
        </div>
        
        {/* Exercise Type Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <div className="flex space-x-2">
            {exerciseTabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? `bg-white border-2 border-${tab.id === 'steps' ? 'blue' : tab.id === 'zone2' ? 'green' : tab.id === 'vo2max' ? 'purple' : tab.id === 'gym' ? 'red' : 'amber'}-400 shadow-md`
                    : 'bg-white/80 border border-gray-200'
                }`}
              >
                <tab.icon size={18} className={tab.color} />
                <span className={`font-medium ${activeTab === tab.id ? tab.color : 'text-gray-600'}`}>
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content Area */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-6">
          {renderTabContent()}
          
          <div className="mt-6 flex justify-between items-center">
          <div
            onClick={handleSubmit}
            className={`flex w-full items-center space-x-2 py-3 px-6 rounded-lg font-semibold text-white ${
                isCurrentTabEmpty()
                ? 'bg-gray-300 cursor-not-allowed'
                : activeTab === 'steps' 
                    ? 'bg-blue-600 hover:opacity-90'
                    : activeTab === 'zone2' 
                    ? 'bg-green-600 hover:opacity-90'
                    : activeTab === 'vo2max' 
                    ? 'bg-purple-600 hover:opacity-90'
                    : activeTab === 'gym' 
                    ? 'bg-red-600 hover:opacity-90'
                    : 'bg-amber-600 hover:opacity-90'
            }`}
            >
            <span>Save Activity</span>
            <ArrowRight size={16} />
            </div>
          </div>
        </form>
        
        {/* Confirmation Message */}
        {submitted && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg animate-pulse">
            <div className="flex items-center">
              <Zap size={24} className="text-green-500 mr-3" />
              <p className="text-green-700">
                Exercise data logged successfully! Keep up the momentum.
              </p>
            </div>
          </div>
        )}
        
        {/* Weekly Progress Summary */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700 mb-3">Weekly Progress</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Total Steps</p>
              <p className="text-lg font-bold text-blue-600">36,429</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Zone 2 Time</p>
              <p className="text-lg font-bold text-green-600">165 min</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Cycling</p>
              <p className="text-lg font-bold text-amber-600">18.5 mi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePanel;