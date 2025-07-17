import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, MapPin, Dumbbell, Bike, 
  AlertCircle, Calendar, CalculatorIcon, HeartIcon, Target, Award, Calendar as CalendarIcon } from 'lucide-react';
import { GiOpenedFoodCan, GiRunningShoe } from 'react-icons/gi';
import { WorkoutDataModal } from './exerciseStatic';

// Enhanced Pie Chart Component (reused from weekly)
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

// Stat Card Component (reused from weekly)
const StatCard = ({ icon, title, value, unit, color, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <div className="flex items-center space-x-4 mb-2">
        <div className={`bg-${color || 'blue'}-100 p-3 rounded-full`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value} <span className="text-gray-500 text-sm">{unit}</span></p>
        </div>
      </div>
      {trend && (
        <div className={`text-sm mt-1 ${trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : ''}
          {' '}
          {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
};

// Widget Component (reused from weekly)
const Widget = ({ title, children, icon, className, action }) => {
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
          {action ? (
            action
          ) : (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">Monthly</span>
          )}
        </div>
      </div>
      
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

// Activity Distribution Chart (modified from weekly for monthly view)
const ActivityDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No activity data available for this month</p>
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

// Monthly Steps Chart
const MonthlyStepsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No step data available for these months</p>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(month => ({
    name: month.month.substring(0, 3),
    steps: month.avgDailySteps || 0,
    target: 10000 // Daily step target
  })).reverse();
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Avg Daily Steps', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          formatter={(value, name) => [
            value.toLocaleString(), 
            name === 'steps' ? 'Avg Daily Steps' : 'Target'
          ]}
          labelFormatter={(month) => `${month}'s Average`}
        />
        <Legend />
        <Bar dataKey="steps" name="Avg Daily Steps">
          {chartData.map((entry, index) => {
            // Color based on step count compared to target
            let color = entry.steps >= 10000 ? '#4caf50' : // Green for exceeding target
                        entry.steps >= 7500 ? '#ffeb3b' :  // Yellow for close to target
                        entry.steps >= 5000 ? '#ff9800' :  // Orange for moderate
                        entry.steps > 0 ? '#f44336' :      // Red for low
                        '#d3d3d3';                         // Gray for no data
            
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
        <Line 
          type="monotone" 
          dataKey="target" 
          stroke="#ff5252" 
          strokeWidth={2} 
          dot={false}
          name="Target (10,000)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Active Minutes Trend Chart
const ActiveMinutesTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No activity data available for these months</p>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(month => {
    const totalActiveMinutes = (month.zone2?.totalMinutes || 0) + 
                               (month.cycling?.totalMinutes || 0) + 
                               (month.gym?.totalMinutes || 0);
    
    return {
      name: month.month.substring(0, 3),
      zone2: month.zone2?.totalMinutes || 0,
      cycling: month.cycling?.totalMinutes || 0,
      strength: month.gym?.totalMinutes || 0,
      total: totalActiveMinutes,
      target: 600 // ~150 minutes per week * 4 weeks
    };
  }).reverse();
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          formatter={(value, name) => [
            name === 'target' ? `${value} min` : `${value.toLocaleString()} min`, 
            name.charAt(0).toUpperCase() + name.slice(1)
          ]}
          labelFormatter={(month) => `${month}'s Activity`}
        />
        <Legend />
        <Bar dataKey="zone2" stackId="a" name="Zone 2" fill="#4caf50" /> {/* Green */}
        <Bar dataKey="cycling" stackId="a" name="Cycling" fill="#2196f3" /> {/* Blue */}
        <Bar dataKey="strength" stackId="a" name="Strength" fill="#9c27b0" /> {/* Purple */}
        <Line 
          type="monotone" 
          dataKey="target" 
          stroke="#ff5252" 
          strokeWidth={2} 
          dot={false}
          name="Monthly Target"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// VO2Max Trend Chart
const VO2MaxTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No VO2Max data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip formatter={(value) => [`${value} ml/kg/min`, 'VO2Max']} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="VO2Max"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Monthly Exercise Score Display
const ExerciseScoreDisplay = ({ data }) => {
  if (!data || !data.summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>Not enough data to calculate score</p>
      </div>
    );
  }
  
  // Calculate a monthly exercise score based on:
  // - Steps vs target (10k/day)
  // - Active minutes vs recommended (150 min/week * 4 weeks = 600 min/month)
  // - Strength sessions vs recommended (2/week * 4 weeks = 8/month)
  const summary = data.summary;
  const stepsScore = Math.min(100, Math.round((summary.avgDailySteps / 10000) * 100));
  const activeMinutesScore = Math.min(100, Math.round(((summary.totalZone2Minutes + summary.totalCyclingMinutes + summary.totalGymMinutes) / 600) * 100));
  const strengthScore = Math.min(100, Math.round((summary.totalGymSessions / 8) * 100));
  
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
  
  // Calculate trend compared to previous month
  let trendIndicator = null;
  if (data.months && data.months.length >= 2) {
    // Get the two most recent months with data
    const recentMonths = data.months
      .filter(month => month.daysTracked > 0)
      .slice(0, 2);
    
    if (recentMonths.length === 2) {
      const current = recentMonths[0];
      const previous = recentMonths[1];
      
      // Calculate scores for each month
      const calculateMonthScore = (month) => {
        const monthStepsScore = Math.min(100, Math.round((month.avgDailySteps / 10000) * 100));
        const monthActiveMinutesScore = Math.min(100, Math.round(((month.zone2.totalMinutes + month.cycling.totalMinutes + month.gym.totalMinutes) / 600) * 100));
        const monthStrengthScore = Math.min(100, Math.round((month.gym.sessionsCount / 8) * 100));
        return Math.round((monthStepsScore * 0.4) + (monthActiveMinutesScore * 0.4) + (monthStrengthScore * 0.2));
      };
      
      const currentScore = calculateMonthScore(current);
      const previousScore = calculateMonthScore(previous);
      const difference = currentScore - previousScore;
      
      if (difference !== 0) {
        trendIndicator = {
          direction: difference > 0 ? 'increase' : 'decrease',
          value: Math.abs(difference),
          percentage: Math.round((Math.abs(difference) / previousScore) * 100)
        };
      }
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={`w-48 h-48 ${getScoreColor(overallScore)} rounded-full flex items-center justify-center mb-4 text-white relative`}>
        <div className="text-center">
          <p className="text-5xl font-bold">{overallScore}</p>
          <p className="text-sm mt-1">of 100</p>
        </div>
        
        {trendIndicator && (
          <div className={`absolute -top-2 -right-2 rounded-full px-2 py-1 text-xs font-bold ${
            trendIndicator.direction === 'increase' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
          }`}>
            {trendIndicator.direction === 'increase' ? '↑' : '↓'} {trendIndicator.value}
          </div>
        )}
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

// Month Selection Component
const MonthSelector = ({ months, selectedMonth, onSelectMonth }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {months.map((month) => (
        <div
          key={month.monthKey}
          onClick={() => onSelectMonth(month)}
          className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
            selectedMonth?.monthKey === month.monthKey
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {month.month} {month.year}
        </div>
      ))}
    </div>
  );
};

// Monthly Activity Details
const MonthlyActivityDetails = ({ month }) => {
  if (!month) return null;
  
  // Format functions
  const formatMinutes = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{month.month} {month.year} Details</h2>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Days Tracked</span>
                <span className="font-semibold">{month.daysTracked} days</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Active Days</span>
                <span className="font-semibold">{month.activeDays} days ({month.activeDaysPercentage}%)</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Rest Days</span>
                <span className="font-semibold">{month.restDays} days</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total Steps</span>
                <span className="font-semibold">{month.totalSteps.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Daily Average</span>
                <span className="font-semibold">{month.avgDailySteps.toLocaleString()} steps</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Calories Burned</span>
                <span className="font-semibold">{month.totalKcalBurned.toLocaleString()} kcal</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Exercise Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Zone 2 Training</span>
                <span className="font-semibold">
                  {formatMinutes(month.zone2.totalMinutes)} ({month.zone2.sessionsCount} sessions)
                </span>
              </div>
              {month.zone2.totalDistance > 0 && (
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Zone 2 Distance</span>
                  <span className="font-semibold">
                    {month.zone2.totalDistance.toFixed(1)} km
                    {month.zone2.avgPace && ` (${month.zone2.avgPace} min/km avg pace)`}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Cycling</span>
                <span className="font-semibold">
                  {formatMinutes(month.cycling.totalMinutes)} ({month.cycling.sessionsCount} sessions)
                </span>
              </div>
              {month.cycling.totalDistance > 0 && (
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Cycling Distance</span>
                  <span className="font-semibold">
                    {month.cycling.totalDistance.toFixed(1)} km
                    {month.cycling.avgSpeed && ` (${month.cycling.avgSpeed} km/h avg speed)`}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Strength Training</span>
                <span className="font-semibold">
                  {formatMinutes(month.gym.totalMinutes)} ({month.gym.sessionsCount} sessions)
                </span>
              </div>
              {month.gym.mostCommonWorkout && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Most Common Workout</span>
                  <span className="font-semibold">{month.gym.mostCommonWorkout}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Month-over-Month Comparison Component
const MonthlyComparison = ({ currentMonth, previousMonth }) => {
  if (!currentMonth || !previousMonth) return null;
  
  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, percentage: 0 };
    const change = current - previous;
    const percentage = Math.round((change / previous) * 100);
    return { value: change, percentage };
  };
  
  // Generate comparison metrics
  const metrics = [
    {
      label: "Avg Daily Steps",
      current: currentMonth.avgDailySteps,
      previous: previousMonth.avgDailySteps,
      change: calculateChange(currentMonth.avgDailySteps, previousMonth.avgDailySteps),
      format: value => value.toLocaleString(),
      unit: "steps"
    },
    {
      label: "Total Kcal Burned",
      current: currentMonth.totalKcalBurned,
      previous: previousMonth.totalKcalBurned,
      change: calculateChange(currentMonth.totalKcalBurned, previousMonth.totalKcalBurned),
      format: value => value.toLocaleString(),
      unit: "kcal"
    },
    {
      label: "Active Minutes",
      current: (currentMonth.zone2.totalMinutes + currentMonth.cycling.totalMinutes + currentMonth.gym.totalMinutes),
      previous: (previousMonth.zone2.totalMinutes + previousMonth.cycling.totalMinutes + previousMonth.gym.totalMinutes),
      change: calculateChange(
        (currentMonth.zone2.totalMinutes + currentMonth.cycling.totalMinutes + currentMonth.gym.totalMinutes),
        (previousMonth.zone2.totalMinutes + previousMonth.cycling.totalMinutes + previousMonth.gym.totalMinutes)
      ),
      format: value => value.toLocaleString(),
      unit: "min"
    },
    {
      label: "Strength Sessions",
      current: currentMonth.gym.sessionsCount,
      previous: previousMonth.gym.sessionsCount,
      change: calculateChange(currentMonth.gym.sessionsCount, previousMonth.gym.sessionsCount),
      format: value => value,
      unit: ""
    },
    {
      label: "Active Days %",
      current: currentMonth.activeDaysPercentage,
      previous: previousMonth.activeDaysPercentage,
      change: calculateChange(currentMonth.activeDaysPercentage, previousMonth.activeDaysPercentage),
      format: value => `${value}%`,
      unit: ""
    }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Month-over-Month Comparison</h2>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-4 gap-3 mb-4 text-sm font-medium text-gray-600">
          <div>Metric</div>
          <div className="text-center">{previousMonth.month}</div>
          <div className="text-center">{currentMonth.month}</div>
          <div className="text-center">Change</div>
        </div>
        
        {metrics.map((metric, index) => (
          <div key={index} className="grid grid-cols-4 gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="text-gray-700">{metric.label}</div>
            <div className="text-center text-gray-600">{metric.format(metric.previous)} {metric.unit}</div>
            <div className="text-center font-medium">{metric.format(metric.current)} {metric.unit}</div>
            <div className={`text-center font-medium ${
              metric.change.percentage > 0 ? 'text-green-600' : 
              metric.change.percentage < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {metric.change.percentage > 0 ? '↑' : metric.change.percentage < 0 ? '↓' : ''}
              {' '}
              {Math.abs(metric.change.percentage)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Exercise Panel Monthly Component
const ExercisePanelMonthly = () => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [previousMonth, setPreviousMonth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityDistribution, setActivityDistribution] = useState([]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch('/api/exercise/monthly');
        
        if (!res.ok) {
          throw new Error('Failed to fetch monthly data');
        }
        
        const data = await res.json();
        setMonthlyData(data);
        
        // Set the most recent month as selected by default
        if (data.months && data.months.length > 0) {
          setSelectedMonth(data.months[0]);
          
          // Set previous month if available
          if (data.months.length > 1) {
            setPreviousMonth(data.months[1]);
          }
        }
        
        // Calculate activity distribution for the selected month
        if (data.months && data.months.length > 0) {
          calculateActivityDistribution(data.months[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching monthly exercise data:', err);
        setError(err.message || 'An unexpected error occurred');
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  // Handle month selection
  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
    calculateActivityDistribution(month);
    
    // Find the previous month based on month key
    if (monthlyData && monthlyData.months) {
      const currentIndex = monthlyData.months.findIndex(m => m.monthKey === month.monthKey);
      if (currentIndex !== -1 && currentIndex + 1 < monthlyData.months.length) {
        setPreviousMonth(monthlyData.months[currentIndex + 1]);
      } else {
        setPreviousMonth(null);
      }
    }
  };

  // Calculate activity distribution
  const calculateActivityDistribution = (month) => {
    if (!month) return;
    
    const distribution = [
      {
        name: 'Zone 2 Training',
        minutes: month.zone2?.totalMinutes || 0,
        color: '#4caf50' // Green
      },
      {
        name: 'Cycling',
        minutes: month.cycling?.totalMinutes || 0,
        color: '#2196f3' // Blue
      },
      {
        name: 'Strength Training',
        minutes: month.gym?.totalMinutes || 0,
        color: '#9c27b0' // Purple
      }
    ];
    
    // Filter out zero values
    const filteredDistribution = distribution.filter(item => item.minutes > 0);
    setActivityDistribution(filteredDistribution);
  };

  // Format functions
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
      <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading monthly exercise data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
        <div className="bg-red-100 p-4 rounded-xl mb-4 w-full max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-red-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading monthly data</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
        <div className="bg-yellow-100 p-4 rounded-xl mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-yellow-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No Data Available</h3>
              <p className="mt-1 text-sm text-yellow-700">No monthly exercise data was found. Start tracking your activities to see monthly trends.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract data
  const summary = monthlyData.summary;
  
  // Calculate trends for stat cards
  const getTrend = (metric) => {
    if (!summary.trends || !summary.trends[metric]) return null;
    
    return {
      value: summary.trends[metric].percentage,
      label: 'vs last month'
    };
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-auto h-full">
      {/* Month selector */}
      <div className="mb-6">
        <MonthSelector 
          months={monthlyData.months} 
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
        />
      </div>

      {/* Stats at a glance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Activity className="h-5 w-5 text-blue-600" />} 
          title="Avg Daily Steps" 
          value={summary.avgDailySteps} 
          unit="steps"
          color="blue"
          trend={getTrend('steps')}
        />
        <StatCard 
          icon={<Clock className="h-5 w-5 text-green-600" />} 
          title="Total Active Minutes" 
          value={formatMinutes(summary.totalZone2Minutes + summary.totalCyclingMinutes + summary.totalGymMinutes)} 
          unit=""
          color="green"
          trend={getTrend('activeDays')}
        />
        <StatCard 
          icon={<Dumbbell className="h-5 w-5 text-purple-600" />} 
          title="Total Strength Sessions" 
          value={summary.totalGymSessions} 
          unit="sessions"
          color="purple"
        />
        <StatCard 
          icon={<CalculatorIcon className="h-5 w-5 text-red-600" />} 
          title="Total Calories Burned" 
          value={summary.totalKcalBurned} 
          unit="kcal"
          color="red"
          trend={getTrend('kcalBurned')}
        />
      </div>
      
      {/* Main charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Monthly Steps Trend" 
          icon={<Activity className="h-5 w-5 text-blue-600" />}
        >
          <MonthlyStepsChart data={monthlyData.months} />
        </Widget>
        
        <Widget 
          title="Monthly Activity Trend" 
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        >
          <ActiveMinutesTrendChart data={monthlyData.months} />
        </Widget>
      </div>
      
      {/* VO2Max & Activity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {summary.vo2MaxTrend && summary.vo2MaxTrend.length > 0 ? (
          <Widget 
            title="VO2Max Trend" 
            icon={<HeartIcon className="h-5 w-5 text-red-600" />}
          >
            <VO2MaxTrendChart data={summary.vo2MaxTrend} />
          </Widget>
        ) : (
          <Widget 
            title="Monthly Exercise Score" 
            icon={<Target className="h-5 w-5 text-red-600" />}
          >
            <ExerciseScoreDisplay data={monthlyData} />
          </Widget>
        )}
        
        <Widget 
          title={`Activity Distribution - ${selectedMonth ? `${selectedMonth.month} ${selectedMonth.year}` : 'Current Month'}`} 
          icon={<PieChart className="h-5 w-5 text-green-600" />}
        >
          <ActivityDistributionChart data={activityDistribution} />
        </Widget>
      </div>
      
      {/* Selected month details */}
      {selectedMonth && (
        <div className="mb-6">
          <MonthlyActivityDetails month={selectedMonth} />
        </div>
      )}
      
      {/* Month-over-month comparison if available */}
      {selectedMonth && previousMonth && (
        <div className="mb-6">
          <MonthlyComparison 
            currentMonth={selectedMonth} 
            previousMonth={previousMonth} 
          />
        </div>
      )}
      
      {/* Monthly highlights */}
      <div className="bg-white rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">6-Month Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full mr-2">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Most Active Month</h3>
            </div>
            {monthlyData.months && monthlyData.months.length > 0 ? (
              (() => {
                // Find month with highest activity minutes
                const mostActiveMonth = [...monthlyData.months].sort((a, b) => {
                  const aMinutes = (a.zone2?.totalMinutes || 0) + (a.cycling?.totalMinutes || 0) + (a.gym?.totalMinutes || 0);
                  const bMinutes = (b.zone2?.totalMinutes || 0) + (b.cycling?.totalMinutes || 0) + (b.gym?.totalMinutes || 0);
                  return bMinutes - aMinutes;
                })[0];
                
                const activeMinutes = (mostActiveMonth.zone2?.totalMinutes || 0) + 
                                     (mostActiveMonth.cycling?.totalMinutes || 0) + 
                                     (mostActiveMonth.gym?.totalMinutes || 0);
                
                return (
                  <p className="text-gray-700">
                    {mostActiveMonth.month} {mostActiveMonth.year}
                    <span className="block text-sm text-gray-500">
                      {formatMinutes(activeMinutes)} of activity
                    </span>
                  </p>
                );
              })()
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-green-100 rounded-full mr-2">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium">Active Days</h3>
            </div>
            <p className="text-gray-700">
              {summary.activeDayPercentage}% of days
              <span className="block text-sm text-gray-500">
                {summary.totalActiveDays} active days out of {summary.totalDaysTracked} tracked
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
              {Math.round((summary.totalZone2Minutes + summary.totalCyclingMinutes) / 
                (summary.totalZone2Minutes + summary.totalCyclingMinutes + summary.totalGymMinutes || 1) * 100)}% / 
              {Math.round(summary.totalGymMinutes / 
                (summary.totalZone2Minutes + summary.totalCyclingMinutes + summary.totalGymMinutes || 1) * 100)}%
              <span className="block text-sm text-gray-500">
                {summary.totalGymSessions} strength sessions in 6 months
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePanelMonthly;