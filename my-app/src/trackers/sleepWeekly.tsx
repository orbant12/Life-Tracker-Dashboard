import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, Moon, Dumbbell, Bike, TrendingDown, Target, Weight, Bed, Sun, AlertCircle } from 'lucide-react';

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
          formatter={(value) => [`${value} hours`, 'Value']}
          labelFormatter={(name) => `${name}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Sleep Duration Bar Chart Component
const SleepDurationChart = ({ data }) => {
  // Days of week abbreviations
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Process data to include day abbreviations and convert minutes to hours
  const chartData = data.map((day, index) => ({
    name: dayAbbreviations[index],
    hours: day.durationMinutes ? +(day.durationMinutes / 60).toFixed(1) : 0,
    quality: day.quality || 'Not Rated'
  }));

  // Add ideal sleep range
  const idealMin = 7;
  const idealMax = 9;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} domain={[0, 12]} />
        <Tooltip 
          formatter={(value, name) => [value + ' hours', 'Sleep Duration']}
          labelFormatter={(day) => `${day}'s Sleep`}
        />
        <Legend />
        <Bar dataKey="hours" fill="#8884d8" name="Hours Slept">
          {chartData.map((entry, index) => {
            // Color the bar based on sleep duration
            let color = '#8884d8'; // Default purple
            
            if (entry.hours === 0) {
              color = '#d3d3d3'; // Gray for no data
            } else if (entry.hours < 6) {
              color = '#ff5252'; // Red for too little
            } else if (entry.hours >= idealMin && entry.hours <= idealMax) {
              color = '#4caf50'; // Green for ideal range
            } else if (entry.hours > idealMax) {
              color = '#ff9800'; // Orange for too much
            } else {
              color = '#ffeb3b'; // Yellow for slightly low
            }
            
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Sleep Time Consistency Chart
const SleepTimeChart = ({ data }) => {
  // Days of week abbreviations
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Process bedtime and wake time data (convert HH:MM to decimal hours)
  const chartData = data.map((day, index) => {
    // Convert HH:MM to decimal hours for bedtime
    let bedTimeHours = null;
    if (day.bedTime) {
      const [bedHours, bedMinutes] = day.bedTime.split(':').map(Number);
      bedTimeHours = bedHours + bedMinutes / 60;
      // If bedtime is before 12, it's PM (add 12 hours)
      if (bedTimeHours < 12) {
        bedTimeHours += 12;
      }
    }
    
    // Convert HH:MM to decimal hours for wake time
    let wakeTimeHours = null;
    if (day.wakeTime) {
      const [wakeHours, wakeMinutes] = day.wakeTime.split(':').map(Number);
      wakeTimeHours = wakeHours + wakeMinutes / 60;
    }
    
    return {
      name: dayAbbreviations[index],
      bedTime: bedTimeHours,
      wakeTime: wakeTimeHours,
      date: day.date
    };
  });
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis 
          domain={[0, 24]} 
          ticks={[0, 6, 12, 18, 24]}
          tickFormatter={(time) => {
            if (time === 0 || time === 24) return '12am';
            if (time === 12) return '12pm';
            return time < 12 ? `${time}am` : `${time-12}pm`;
          }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (!value) return ['No data', name];
            
            // Convert decimal hours back to HH:MM format
            const hours = Math.floor(value);
            const minutes = Math.round((value - hours) * 60);
            const period = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
            
            return [`${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`, name === 'bedTime' ? 'Bed Time' : 'Wake Time'];
          }}
          labelFormatter={(day) => `${day}'s Sleep Times`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="bedTime" 
          stroke="#8884d8" 
          name="Bed Time" 
          strokeWidth={2}
          connectNulls={true}
          dot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="wakeTime" 
          stroke="#82ca9d" 
          name="Wake Time" 
          strokeWidth={2}
          connectNulls={true}
          dot={{ r: 6 }}
        />
      </LineChart>
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
        <p className="text-xl font-bold">{value} <span className="text-gray-500 text-sm">{unit}</span></p>
      </div>
    </div>
  );
};

// Main Widget Component
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

// Sleep Quality Component
const SleepQualityDisplay = ({ data }) => {
  const qualities = Object.entries(data || {}).map(([quality, count]) => ({
    name: quality,
    value: count,
    color: quality === 'Excellent' ? '#4caf50' : 
          quality === 'Good' ? '#8bc34a' : 
          quality === 'Fair' ? '#ffc107' : 
          '#f44336' // Poor
  }));
  
  if (qualities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No sleep quality data available for this week</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={qualities}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {qualities.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} nights`, 'Count']}
          labelFormatter={(name) => `${name} Sleep`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Sleep Score Component
const SleepScoreDisplay = ({ score }) => {
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Determine message based on score
  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent Sleep Health';
    if (score >= 60) return 'Good Sleep Health';
    if (score >= 40) return 'Fair Sleep Health';
    return 'Poor Sleep Health';
  };
  
  if (!score) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>Not enough data to calculate sleep score</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={`w-48 h-48 ${getScoreColor(score)} rounded-full flex items-center justify-center mb-4 text-white`}>
        <div className="text-center">
          <p className="text-5xl font-bold">{score}</p>
          <p className="text-sm mt-1">of 100</p>
        </div>
      </div>
      <p className="text-xl font-medium text-gray-700">{getScoreMessage(score)}</p>
    </div>
  );
};

// Sleep Recommendations Component
const SleepRecommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No recommendations available</p>
      </div>
    );
  }
  
  return (
    <div className="p-2">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Sleep Recommendations</h3>
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

// Activity Summary Card for Sleep
const SleepSummary = ({ data }) => {
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
  const isValidData = Array.isArray(data) && data.length >= 7;
  
  // Get the selected day's data
  const selectedDayData = isValidData && selectedDay < data.length ? data[selectedDay] : null;
  
  // Format date from YYYY / MM / DD to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split(' / ');
    return `${month}/${day}/${year}`;
  };
  
  // Get date for the selected day
  const selectedDate = selectedDayData ? formatDate(selectedDayData.date) : '';
  
  // Format minutes as hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes) return 'No data';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };
  
  // Generate sleep data items for the selected day
  const generateSleepItems = () => {
    if (!selectedDayData) return [];
    
    const sleepItems:any = [];
    const color = getDayColor(selectedDay);
    
    // Add sleep duration
    if (selectedDayData.durationMinutes) {
      sleepItems.push({
        name: "Sleep Duration",
        value: formatDuration(selectedDayData.durationMinutes),
        description: selectedDayData.sleepDebt ? 
                    (selectedDayData.sleepDebt > 0 ? 
                     `${formatDuration(selectedDayData.sleepDebt)} less than recommended` : 
                     `${formatDuration(Math.abs(selectedDayData.sleepDebt))} more than recommended`) : 
                    "",
        icon: <Bed className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    // Add bed time
    if (selectedDayData.bedTime) {
      sleepItems.push({
        name: "Bed Time",
        value: selectedDayData.bedTime,
        description: selectedDayData.bedTimeDeviation ? 
                     `${Math.round(selectedDayData.bedTimeDeviation)} min from average` : 
                     "",
        icon: <Moon className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    // Add wake time
    if (selectedDayData.wakeTime) {
      sleepItems.push({
        name: "Wake Time",
        value: selectedDayData.wakeTime,
        description: "",
        icon: <Sun className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    // Add sleep quality
    if (selectedDayData.quality) {
      sleepItems.push({
        name: "Sleep Quality",
        value: selectedDayData.quality,
        description: selectedDayData.isBadSleep ? "Marked as bad sleep" : "",
        icon: <Activity className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    return sleepItems;
  };
  
  const sleepItems = generateSleepItems();
  const hasSleepData = selectedDayData && selectedDayData.hasSleepData;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bed className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Daily Sleep Summary</h2>
          </div>
          
          {/* Show date for selected day */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{selectedDate}</p>
            {hasSleepData && selectedDayData.durationMinutes && (
              <p className="text-lg font-bold text-blue-600">
                {formatDuration(selectedDayData.durationMinutes)}
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
        {hasSleepData ? (
          sleepItems.map((item, index) => (
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
                <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="flex flex-col items-center">
              <AlertCircle className="h-10 w-10 text-gray-300 mb-3" />
              <p>No sleep data recorded for {daysOfWeek[selectedDay].name}</p>
              <p className="text-sm mt-1">Try tracking your sleep for better insights!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Sleep Tracker Panel (Weekly View)
const WeeklySleepTrackPanel = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch weekly sleep data
  useEffect(() => {
    const fetchWeeklySleepData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/weekly/sleep');
        if (!response.ok) {
          throw new Error('Failed to fetch weekly sleep data');
        }
        const data = await response.json();
        setWeeklyData(data);
      } catch (err) {
        console.error('Error fetching sleep data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklySleepData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weekly sleep data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error loading sleep data: {error}</p>
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

  if (!weeklyData) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No sleep data available for the week</p>
        </div>
      </div>
    );
  }

  // For readability - extract metrics from the data
  const metrics = weeklyData.metrics;
  
  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-auto h-full">
      <div className="mb-6">
        <p className="text-gray-600 font-[700] p-3 bg-white w-[30%] rounded">
          {weeklyData.weekStart} to {weeklyData.weekEnd}
        </p>
      </div>

      {/* Stats at a glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          icon={<Clock className="h-5 w-5 text-blue-600" />} 
          title="Avg. Sleep Duration" 
          value={metrics.avgSleepDurationFormatted || 'N/A'} 
          unit=""
          color={"blue"}
        />
        <StatCard 
          icon={<Bed className="h-5 w-5 text-purple-600" />} 
          title="Avg. Bedtime" 
          value={metrics.avgBedTime || 'N/A'} 
          unit=""
          color={"blue"}
        />
        <StatCard 
          icon={<Sun className="h-5 w-5 text-yellow-600" />} 
          title="Avg. Wake Time" 
          value={metrics.avgWakeTime || 'N/A'} 
          unit=""
          color={"blue"}
        />
      </div>
      
      {/* Main charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Sleep Duration" 
          icon={<Clock className="h-5 w-5 text-blue-600" />}
        >
          <SleepDurationChart data={weeklyData.dailyData} />
        </Widget>
        
        <Widget 
          title="Sleep Times" 
          icon={<Moon className="h-5 w-5 text-indigo-600" />}
        >
          <SleepTimeChart data={weeklyData.dailyData} />
        </Widget>
      </div>
      
      {/* Sleep quality & score section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Sleep Quality" 
          icon={<Activity className="h-5 w-5 text-green-600" />}
        >
          <SleepQualityDisplay data={metrics.sleepQualityDistribution} />
        </Widget>
        
        <Widget 
          title="Sleep Score" 
          icon={<Target className="h-5 w-5 text-red-600" />}
        >
          <SleepScoreDisplay score={metrics.sleepScore} />
        </Widget>
      </div>
      
      {/* Recommendations and daily breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Widget 
          title="Recommendations" 
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        >
          <SleepRecommendations recommendations={metrics.recommendations} />
        </Widget>
        
        <div>
          <SleepSummary data={weeklyData.dailyData} />
        </div>
      </div>
    </div>
  );
};

export default WeeklySleepTrackPanel;