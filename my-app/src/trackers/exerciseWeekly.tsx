import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, MapPin, Dumbbell, Bike, 
  AlertCircle, Calendar, CalculatorIcon, HeartIcon, Target, Award } from 'lucide-react';
import { GiOpenedFoodCan, GiRunningShoe } from 'react-icons/gi';
import { WorkoutDataModal } from './exerciseStatic';

// Enhanced Pie Chart Component
const EnhancedPieChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [typeof value === 'number' ? value.toLocaleString() : value, name]}
          labelFormatter={(name) => `Category: ${name}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, unit, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
      <div className={`bg-${color || 'blue'}-100 p-3 rounded-full`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value} <span className="text-gray-500 text-sm">{unit}</span></p>
      </div>
    </div>
  );
};

// Widget Component
const Widget = ({ title, children, icon, className }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-full ${className}`}>
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              {icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">Weekly</span>
        </div>
      </div>
      
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

// Activity Distribution Chart
const ActivityDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No activity data available for this week</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          formatter={(value) => [value + ' min', 'Duration']}
          labelFormatter={(activity) => `${activity}`}
        />
        <Legend />
        <Bar dataKey="minutes" fill="#8884d8" name="Duration">
          {data.map((entry, index) => {
            // Color based on activity type
            let color = entry.color || '#8884d8';
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Daily Steps Chart
const DailyStepsChart = ({ data }) => {
  // Days of week abbreviations
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Process data to include day abbreviations
  const chartData = data.map((day, index) => ({
    name: dayAbbreviations[index],
    steps: day.steps || 0,
    kcal: day.kcalBurned || 0
  }));
  
  // Add target line
  const targetDailySteps = 10000;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Steps', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          formatter={(value, name) => [value.toLocaleString(), name === 'steps' ? 'Steps' : 'Calories Burned']}
          labelFormatter={(day) => `${day}'s Activity`}
        />
        <Legend />
        <Bar dataKey="steps" fill="#8884d8" name="Steps">
          {chartData.map((entry, index) => {
            // Color based on step count compared to target
            let color = '#8884d8'; // Default purple
            
            if (entry.steps === 0) {
              color = '#d3d3d3'; // Gray for no data
            } else if (entry.steps >= targetDailySteps) {
              color = '#4caf50'; // Green for meeting/exceeding target
            } else if (entry.steps >= targetDailySteps * 0.7) {
              color = '#ffeb3b'; // Yellow for close to target
            } else {
              color = '#ff9800'; // Orange for far from target
            }
            
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
        <Line 
          type="monotone" 
          dataKey={() => targetDailySteps} 
          stroke="#ff5252" 
          strokeWidth={2} 
          dot={false}
          name="Target"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Weekly Activity Score Display
const ActivityScoreDisplay = ({ data }) => {
  if (!data || !data.totals) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>Not enough data to calculate activity score</p>
      </div>
    );
  }
  
  // Calculate an activity score based on:
  // - Steps vs target (10k/day)
  // - Active minutes vs recommended (150 min/week)
  // - Strength sessions vs recommended (2/week)
  const stepsScore = Math.min(100, Math.round((data.totals.totalSteps / (7 * 10000)) * 100));
  const activeMinutesScore = Math.min(100, Math.round((data.totals.cardio.totalMinutes + data.totals.strength.totalMinutes) / 150 * 100));
  const strengthScore = Math.min(100, Math.round((data.totals.strength.sessionsCount / 2) * 100));
  
  // Weight the scores (40% steps, 40% active minutes, 20% strength)
  const overallScore = Math.round((stepsScore * 0.4) + (activeMinutesScore * 0.4) + (strengthScore * 0.2));
  
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Determine message based on score
  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent Activity Level';
    if (score >= 60) return 'Good Activity Level';
    if (score >= 40) return 'Fair Activity Level';
    return 'Low Activity Level';
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={`w-48 h-48 ${getScoreColor(overallScore)} rounded-full flex items-center justify-center mb-4 text-white`}>
        <div className="text-center">
          <p className="text-5xl font-bold">{overallScore}</p>
          <p className="text-sm mt-1">of 100</p>
        </div>
      </div>
      <p className="text-xl font-medium text-gray-700">{getScoreMessage(overallScore)}</p>
      
      {/* Component scores */}
      <div className="mt-4 grid grid-cols-3 gap-4 w-full">
        <div className="text-center">
          <p className="text-xs text-gray-500">Steps</p>
          <p className={`text-sm font-bold ${stepsScore >= 60 ? 'text-green-600' : 'text-orange-600'}`}>{stepsScore}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Active Minutes</p>
          <p className={`text-sm font-bold ${activeMinutesScore >= 60 ? 'text-green-600' : 'text-orange-600'}`}>{activeMinutesScore}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Strength</p>
          <p className={`text-sm font-bold ${strengthScore >= 60 ? 'text-green-600' : 'text-orange-600'}`}>{strengthScore}%</p>
        </div>
      </div>
    </div>
  );
};

// Exercise Recommendations Component
const ActivityRecommendations = ({ data }) => {
  if (!data || !data.totals) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No recommendations available</p>
      </div>
    );
  }
  
  // Generate recommendations based on the data
  const recommendations = [];
  
  // Steps recommendations
  const avgDailySteps = data.averages.avgDailySteps;
  if (avgDailySteps < 5000) {
    recommendations.push("Increase your daily steps to at least 7,000. Try taking short walking breaks during your workday.");
  } else if (avgDailySteps < 7500) {
    recommendations.push("Aim for 10,000 daily steps by adding a 20-minute walk to your routine.");
  }
  
  // Cardio recommendations
  const cardioMinutes = data.totals.cardio.totalMinutes;
  if (cardioMinutes < 75) {
    recommendations.push("Add at least 2 cardio sessions of 30 minutes each this week to improve heart health.");
  } else if (cardioMinutes < 150) {
    recommendations.push("Great start with cardio! Try to reach 150 minutes of moderate activity weekly for optimal health benefits.");
  }
  
  // Strength recommendations
  const strengthSessions = data.totals.strength.sessionsCount;
  if (strengthSessions < 2) {
    recommendations.push("Include at least 2 strength training sessions weekly to build muscle and boost metabolism.");
  }
  
  // Balance recommendations
  if (data.totals.cardio.totalMinutes > 0 && data.totals.strength.totalMinutes === 0) {
    recommendations.push("Balance your routine by adding strength training to complement your cardio workouts.");
  } else if (data.totals.strength.totalMinutes > 0 && data.totals.cardio.totalMinutes === 0) {
    recommendations.push("Add cardio workouts to your strength routine for better cardiovascular health.");
  }
  
  // Rest day recommendation
  if (data.totals.restDays < 1) {
    recommendations.push("Schedule at least one rest day per week to allow your body to recover and prevent burnout.");
  }
  
  // If no specific recommendations, add general ones
  if (recommendations.length === 0) {
    recommendations.push("Your activity balance looks good! Keep up the consistency in both cardio and strength training.");
    recommendations.push("Consider adding variety to your workouts to challenge different muscle groups.");
    recommendations.push("For continued progress, try gradually increasing workout intensity rather than duration.");
  }
  
  return (
    <div className="p-2">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Exercise Recommendations</h3>
      <ul className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="flex items-start space-x-2">
            <div className="mt-1">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 text-xs font-bold">{index + 1}</span>
              </div>
            </div>
            <p className="text-gray-700">{recommendation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Daily Activity Summary Component
const DailyActivitySummary = ({ data }) => {
  // Days of the week for selection
  const daysOfWeek = [
    { id: 0, name: 'Monday' },
    { id: 1, name: 'Tuesday' },
    { id: 2, name: 'Wednesday' },
    { id: 3, name: 'Thursday' },
    { id: 4, name: 'Friday' },
    { id: 5, name: 'Saturday' },
    { id: 6, name: 'Sunday' },
  ];

  // State to track selected day (default: first day)
  const [selectedDay, setSelectedDay] = useState(0);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  // Select a day
  const selectDay = (dayId) => {
    setSelectedDay(dayId);
  };

  // Get color based on day of week
  const getDayColor = (dayIndex) => {
    const colors = [
      '#4299E1', // Monday - blue
      '#48BB78', // Tuesday - green
      '#ED8936', // Wednesday - orange
      '#9F7AEA', // Thursday - purple
      '#F56565', // Friday - red
      '#38B2AC', // Saturday - teal
      '#ED64A6'  // Sunday - pink
    ];
    return colors[dayIndex];
  };

  // Check if data is valid
  const isValidData = data && data.dailyData && Array.isArray(data.dailyData) && data.dailyData.length > 0;
  
  // Get the selected day's data
  const selectedDayData = isValidData && selectedDay < data.dailyData.length ? data.dailyData[selectedDay] : null;
  
  // Format date from YYYY / MM / DD to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split(' / ');
    return `${month}/${day}/${year}`;
  };
  
  // Get date for the selected day
  const selectedDate = selectedDayData ? formatDate(selectedDayData.date) : '';
  
  // Function to format minutes as hours and minutes
  const formatMinutes = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
  };
  
  // Generate activity summary items for the selected day
  const generateActivityItems = () => {
    if (!selectedDayData) return [];
    
    const activityItems = [];
    const color = getDayColor(selectedDay);
    
    // Add steps if available
    if (selectedDayData.steps > 0) {
      activityItems.push({
        name: "Steps",
        value: `${selectedDayData.steps.toLocaleString()}`,
        description: selectedDayData.kcalBurned > 0 ? `${selectedDayData.kcalBurned} calories burned` : "",
        icon: <Activity className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    // Add Zone 2 training if available
    if (selectedDayData.cardio.zone2.minutes > 0) {
      activityItems.push({
        name: "Zone 2 Training",
        value: formatMinutes(selectedDayData.cardio.zone2.minutes),
        description: selectedDayData.cardio.zone2.distance > 0 ? 
                     `${selectedDayData.cardio.zone2.distance} km • Pace: ${selectedDayData.cardio.zone2.pace || '-'} min/km` : "",
        icon: <GiRunningShoe className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    // Add Cycling if available
    if (selectedDayData.cardio.cycling.minutes > 0) {
      activityItems.push({
        name: "Cycling",
        value: formatMinutes(selectedDayData.cardio.cycling.minutes),
        description: selectedDayData.cardio.cycling.distance > 0 ? 
                    `${selectedDayData.cardio.cycling.distance} km • Avg: ${selectedDayData.cardio.cycling.speed || '-'} km/h` : "",
        icon: <Bike className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    // Add VO2Max if available
    if (selectedDayData.cardio.vo2max) {
      activityItems.push({
        name: "VO2 Max",
        value: `${selectedDayData.cardio.vo2max} ml/kg/min`,
        description: "Cardiorespiratory fitness test",
        icon: <HeartIcon className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    // Add Strength training if available
    if (selectedDayData.strength.minutes > 0) {
      activityItems.push({
        name: "Gym Workout",
        value: formatMinutes(selectedDayData.strength.minutes),
        description: selectedDayData.strength.workoutType ? `${selectedDayData.strength.workoutType} workout` : "Strength training",
        icon: <Dumbbell className="h-4 w-4 text-white" />,
        bgColor: color,
        hasWorkoutData: selectedDayData.strength.workoutData !== null,
        workoutData: selectedDayData.strength.workoutData
      });
    }
    
    return activityItems;
  };
  
  const activityItems = generateActivityItems();
  const hasActivity = activityItems.length > 0;

  // Handle workout data click
  const handleWorkoutDataClick = (workoutData) => {
    setSelectedWorkout(workoutData);
    setShowWorkoutModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Daily Activity Summary</h2>
          </div>
          
          {/* Show date and total active minutes for selected day */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{selectedDate}</p>
            {hasActivity && (
              <p className="text-lg font-bold text-blue-600">
                {formatMinutes(
                  (selectedDayData.cardio.zone2.minutes || 0) + 
                  (selectedDayData.cardio.cycling.minutes || 0) + 
                  (selectedDayData.strength.minutes || 0)
                )}
              </p>
            )}
          </div>
        </div>
        
        {/* Day selection */}
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <div
                key={day.id}
                onClick={() => selectDay(day.id)}
                className={`px-3 cursor-pointer py-1 text-xs rounded-full transition-colors ${
                  selectedDay === day.id
                    ? `text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  selectedDay === day.id 
                    ? { backgroundColor: getDayColor(day.id) } 
                    : {}
                }
              >
                {day.name.substring(0, 3)}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        {hasActivity ? (
          activityItems.map((item, index) => (
            (item.value !== "0 min" && item.name !== "Steps") || (item.name === "Steps" && item.value !== "0") ? (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: item.bgColor }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="font-semibold">{item.value}</p>
                  {item.name === "Gym Workout" && item.hasWorkoutData ? (
                    <button 
                      onClick={() => handleWorkoutDataClick(item.workoutData)}
                      className="ml-2 p-1 bg-blue-50 rounded-full hover:bg-blue-100"
                    >
                      <ChevronRight className="h-4 w-4 text-blue-600" />
                    </button>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                  )}
                </div>
              </div>
            ) : null
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="flex flex-col items-center">
              <Calendar className="h-10 w-10 text-gray-300 mb-3" />
              <p>No activity recorded for {daysOfWeek[selectedDay].name}</p>
              <p className="text-sm mt-1">Rest days are important too!</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Weekly Summary Footer */}
      {isValidData && data.totals && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-600">
            <div>
              <span className="font-semibold">{data.totals.totalSteps.toLocaleString()}</span> steps
            </div>
            <div>
              <span className="font-semibold">{formatMinutes(data.totals.cardio.totalMinutes + data.totals.strength.totalMinutes)}</span> active
            </div>
            <div>
              <span className="font-semibold">{data.totals.activeDays}</span> active days
            </div>
            <div>
              <span className="font-semibold">{data.totals.totalKcalBurned.toLocaleString()}</span> kcal
            </div>
          </div>
        </div>
      )}

      {/* Workout Data Modal (can be implemented as a separate component) */}
      {showWorkoutModal && selectedWorkout && (
        <WorkoutDataModal workoutData={selectedWorkout} onClose={() => setShowWorkoutModal(false)} />
      )}
    </div>
  );
};

// Main Exercise Tracker Panel with Weekly View
const ExerciseTrackerPanelWeekly = () => {
  const [activitySummary, setActivitySummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityDistribution, setActivityDistribution] = useState([]);
  const [currentWeekRange, setCurrentWeekRange] = useState({start: '', end: ''});

  // Fetch exercise data
  useEffect(() => {
    const fetchExerciseData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/weekly/exercise');
        if (!response.ok) {
          throw new Error('Failed to fetch weekly exercise data');
        }
        const data = await response.json();
        setActivitySummary(data);
        setCurrentWeekRange({
          start: data.weekStart,
          end: data.weekEnd
        });
        
        // Prepare activity distribution data
        calculateActivityDistribution(data);
      } catch (err) {
        console.error('Error fetching exercise data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExerciseData();
  }, []);

  // Calculate activity distribution
  const calculateActivityDistribution = (data) => {
    if (!data || !data.totals) return;
    
    const distribution = [
      {
        name: 'Zone 2 Training',
        minutes: data.totals.cardio.zone2.totalMinutes,
        color: '#4caf50' // Green
      },
      {
        name: 'Cycling',
        minutes: data.totals.cardio.cycling.totalMinutes,
        color: '#2196f3' // Blue
      },
      {
        name: 'Strength Training',
        minutes: data.totals.strength.totalMinutes,
        color: '#9c27b0' // Purple
      }
    ];
    
    // Filter out zero values
    const filteredDistribution = distribution.filter(item => item.minutes > 0);
    setActivityDistribution(filteredDistribution);
  };

  // Function to format minutes
  const formatMinutes = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weekly exercise data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error loading exercise data: {error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activitySummary) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No exercise data available for the week</p>
        </div>
      </div>
    );
  }

  // For readability - extract metrics from the data
  const totals = activitySummary.totals;
  const averages = activitySummary.averages;
  
  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-auto h-full">
      <div className="mb-6">
        <p className="text-gray-600 font-[700] p-3 bg-white w-[30%] rounded">
          {currentWeekRange.start} to {currentWeekRange.end}
        </p>
      </div>

      {/* Stats at a glance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Activity className="h-5 w-5 text-blue-600" />} 
          title="Total Steps" 
          value={totals.totalSteps} 
          unit="steps"
          color="blue"
        />
        <StatCard 
          icon={<Clock className="h-5 w-5 text-green-600" />} 
          title="Active Minutes" 
          value={formatMinutes(totals.cardio.totalMinutes + totals.strength.totalMinutes)} 
          unit=""
          color="green"
        />
        <StatCard 
          icon={<Dumbbell className="h-5 w-5 text-purple-600" />} 
          title="Strength Sessions" 
          value={totals.strength.sessionsCount} 
          unit="workouts"
          color="purple"
        />
        <StatCard 
          icon={<CalculatorIcon className="h-5 w-5 text-red-600" />} 
          title="Calories Burned" 
          value={totals.totalKcalBurned} 
          unit="kcal"
          color="red"
        />
      </div>
      
      {/* Main charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Daily Steps" 
          icon={<Activity className="h-5 w-5 text-blue-600" />}
        >
          <DailyStepsChart data={activitySummary.dailyData} />
        </Widget>
        
        <Widget 
          title="Activity Distribution" 
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        >
          <ActivityDistributionChart data={activityDistribution} />
        </Widget>
      </div>
      
      {/* Activity score & recommendations section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Weekly Activity Score" 
          icon={<Target className="h-5 w-5 text-red-600" />}
        >
          <ActivityScoreDisplay data={activitySummary} />
        </Widget>
        
        <Widget 
          title="Recommendations" 
          icon={<Award className="h-5 w-5 text-blue-600" />}
        >
          <ActivityRecommendations data={activitySummary} />
        </Widget>
      </div>
      
      {/* Daily summary section */}
      <div className="mb-6">
        <DailyActivitySummary data={activitySummary} />
      </div>
      
      {/* Weekly highlights */}
      <div className="bg-white rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full mr-2">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Most Active Day</h3>
            </div>
            {activitySummary.weekAtGlance.reduce((max, day) => 
              day.totalActiveMinutes > (max?.totalActiveMinutes || 0) ? day : max, null)?.date 
              ? (
                <p className="text-gray-700">
                  {formatDate(activitySummary.weekAtGlance.reduce((max, day) => 
                    day.totalActiveMinutes > (max?.totalActiveMinutes || 0) ? day : max, null).date)}
                  <span className="block text-sm text-gray-500">
                    {formatMinutes(activitySummary.weekAtGlance.reduce((max, day) => 
                      day.totalActiveMinutes > (max?.totalActiveMinutes || 0) ? day : max, null).totalActiveMinutes)} of activity
                  </span>
                </p>
              ) : (
                <p className="text-gray-500">No activity recorded</p>
              )
            }
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-green-100 rounded-full mr-2">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium">Active Days</h3>
            </div>
            <p className="text-gray-700">
              {totals.activeDays} days this week
              <span className="block text-sm text-gray-500">
                {totals.activeDays > 3 ? 'Great consistency!' : 'Try to increase activity days'}
              </span>
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-purple-100 rounded-full mr-2">
                <HeartIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium">Cardio/Strength Ratio</h3>
            </div>
            <p className="text-gray-700">
              {Math.round((totals.cardio.totalMinutes / 
                (totals.cardio.totalMinutes + totals.strength.totalMinutes || 1)) * 100)}% / 
              {Math.round((totals.strength.totalMinutes / 
                (totals.cardio.totalMinutes + totals.strength.totalMinutes || 1)) * 100)}%
              <span className="block text-sm text-gray-500">
                {totals.cardio.totalMinutes > 0 && totals.strength.totalMinutes > 0 
                  ? 'Good mix of activities!' 
                  : 'Try to balance cardio and strength'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split(' / ');
  return `${month}/${day}/${year}`;
};

export default ExerciseTrackerPanelWeekly;