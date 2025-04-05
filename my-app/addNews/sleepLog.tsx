import React, { useState } from 'react';
import { Moon, Clock, BedDouble, Coffee, Zap, ArrowRight, AlertTriangle, Smile } from 'lucide-react';

const SleepPanel = () => {
  const [activeTab, setActiveTab] = useState('duration');
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const [formData, setFormData] = useState({
    sleepHours: '',
    sleepQuality: '',
    bedTime: '',
    wakeTime: '',
    deepSleepMinutes: '',
    remSleepMinutes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = () => {
    // Check if required fields are filled based on active tab
    if (isCurrentTabEmpty() || isLoading) return;
    
    setIsLoading(true); // Start loading
    
    // Prepare request body based on active tab
    let requestBody = {
      sleepType: activeTab
    };
    
    if (activeTab === 'duration') {
      // For duration tab, only log the quality
      requestBody = {
        ...requestBody,
        sleepQuality: formData.sleepQuality
      };
    } else if (activeTab === 'timing') {
      // Calculate sleep window for the payload
      const sleepWindow = calculateSleepWindow(formData.bedTime, formData.wakeTime);
      
      requestBody = {
        ...requestBody,
        bedTime: formData.bedTime,
        wakeTime: formData.wakeTime,
        sleepWindow
      };
    }
    
    // Send data to the server
    fetch('/api/sleep', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Sleep data saved successfully:', data);
      setSubmitted(true);
      setIsLoading(false); // Stop loading on success
    })
    .catch(error => {
      console.error('Error saving sleep data:', error);
      setIsLoading(false); // Stop loading on error
    })
    .finally(() => {
      // Reset form after timeout regardless of success/failure
      setTimeout(() => {
        setSubmitted(false);
        
        // Reset only the active tab fields to preserve other data
        if (activeTab === 'duration') {
          setFormData(prev => ({ ...prev, sleepHours: '', sleepQuality: '' }));
        } else if (activeTab === 'timing') {
          setFormData(prev => ({ ...prev, bedTime: '', wakeTime: '' }));
        } else if (activeTab === 'phases') {
          setFormData(prev => ({ ...prev, deepSleepMinutes: '', remSleepMinutes: '' }));
        }
      }, 3000);
    });
  };
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const sleepTabs = [
    { id: 'duration', icon: BedDouble, label: 'Quality', color: 'text-indigo-500' },
    { id: 'timing', icon: Clock, label: 'Timing', color: 'text-teal-500' },
  ];
  
  const sleepQualityOptions = [
    { id: 'poor', label: 'Poor 😴', color: 'border-red-400 bg-red-50' },
    { id: 'fair', label: 'Fair 😐', color: 'border-yellow-400 bg-yellow-50' },
    { id: 'good', label: 'Good 😊', color: 'border-green-400 bg-green-50' },
    { id: 'excellent', label: 'Excellent 🥳', color: 'border-indigo-400 bg-indigo-50' }
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'duration':
        return (
          <div className="space-y-6">     
            <div>
              <div className="grid grid-cols-2 gap-3">
                {sleepQualityOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={!isLoading ? () => setFormData(prev => ({ ...prev, sleepQuality: option.id })) : undefined}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.sleepQuality === option.id
                        ? `${option.color} font-bold shadow-md`
                        : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                    } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'timing':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-lg font-medium text-gray-700 mb-2 block">
                Bedtime
              </label>
              <input
                type="time"
                name="bedTime"
                value={formData.bedTime}
                onChange={handleInputChange}
                className="w-full p-4 text-2xl font-bold text-center text-teal-600 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="text-lg font-medium text-gray-700 mb-2 block">
                Wake Time
              </label>
              <input
                type="time"
                name="wakeTime"
                value={formData.wakeTime}
                onChange={handleInputChange}
                className="w-full p-4 text-2xl font-bold text-center text-teal-600 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                disabled={isLoading}
              />
            </div>
            
            {formData.bedTime && formData.wakeTime && (
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock size={18} className="text-teal-500 mr-2" />
                    <span className="text-sm text-gray-600">Sleep Window</span>
                  </div>
                  <span className="text-lg font-semibold text-teal-600">
                    {calculateSleepWindow(formData.bedTime, formData.wakeTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
            
      default:
        return null;
    }
  };
  
  const isCurrentTabEmpty = () => {
    switch (activeTab) {
      case 'duration':
        return !formData.sleepQuality; // Only check for sleep quality
      case 'timing':
        return !formData.bedTime || !formData.wakeTime;
      case 'phases':
        return !formData.deepSleepMinutes || !formData.remSleepMinutes;
      default:
        return true;
    }
  };
  
  // Helper functions
  const calculateSleepWindow = (bedTime, wakeTime) => {
    try {
      const bedDate:any = new Date(`2000-01-01T${bedTime}`);
      let wakeDate:any = new Date(`2000-01-01T${wakeTime}`);
      
      // Adjust if wake time is on the next day
      if (wakeDate < bedDate) {
        wakeDate = new Date(`2000-01-02T${wakeTime}`);
      }
      
      const diffMs = wakeDate - bedDate;
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      
      return `${hours}h ${minutes}m`;
    } catch (e) {
      return 'Invalid times';
    }
  };
  
  const calculateQualitySleepPercentage = (deepSleep, remSleep, totalHours) => {
    if (!deepSleep || !remSleep || !totalHours) return '--';
    
    const totalSleepMinutes = totalHours * 60;
    const qualitySleepMinutes = parseFloat(deepSleep) + parseFloat(remSleep);
    const percentage = (qualitySleepMinutes / totalSleepMinutes) * 100;
    
    return percentage.toFixed(0);
  };
  
  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg overflow-y-scroll">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800"></h1>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
            <Moon size={18} className="text-indigo-600" />
            <span className="font-semibold text-gray-700">{today}</span>
          </div>
        </div>
        
        {/* Sleep Type Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6">
          <div className="flex space-x-2">
            {sleepTabs.map((tab) => (
              <div
                key={tab.id}
                onClick={!isLoading ? () => setActiveTab(tab.id) : undefined}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white border-2 border-gray-200 shadow-md'
                    : 'bg-white/80 border border-gray-200'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
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
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          {renderTabContent()}
          
          <div className="mt-6 flex justify-between items-center">
            <div
              onClick={() => isCurrentTabEmpty() || isLoading ? null : handleSubmit()}
              className={`flex w-full items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold text-white ${
                isCurrentTabEmpty() || isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : activeTab === 'duration' 
                    ? 'bg-indigo-600 hover:opacity-90 cursor-pointer'
                    : activeTab === 'timing' 
                    ? 'bg-teal-600 hover:opacity-90 cursor-pointer'
                    : 'bg-purple-600 hover:opacity-90 cursor-pointer'
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
                  <span>Log Sleep</span>
                  <ArrowRight size={16} />
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Confirmation Message */}
        {submitted && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg animate-pulse">
            <div className="flex items-center">
              <Zap size={24} className="text-green-500 mr-3" />
              <p className="text-green-700">
                Sleep data recorded successfully! Sweet dreams.
              </p>
            </div>
          </div>
        )}
        
        {/* Weekly Summary */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700 mb-3">Weekly Sleep Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Average Duration</p>
              <p className="text-lg font-bold text-indigo-600">7.2h</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Avg. Bedtime</p>
              <p className="text-lg font-bold text-teal-600">10:45 PM</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Deep Sleep</p>
              <p className="text-lg font-bold text-purple-600">85m/night</p>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Coffee size={18} className="text-blue-500" />
              <span className="text-sm text-gray-600">Sleep Consistency Score: <span className="font-bold text-blue-600">85%</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepPanel;