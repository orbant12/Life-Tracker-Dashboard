import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, Moon, Dumbbell, Bike, TrendingDown, Target, Weight, Bed, Sun, AlertCircle, Calendar } from 'lucide-react';

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
          formatter={(value) => [`${value}%`, 'Value']}
          labelFormatter={(name) => `${name}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Monthly Sleep Duration Chart
const MonthlySleepDurationChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No sleep data available for these months</p>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(month => ({
    name: month.month.substring(0, 3),
    duration: month.avgSleepDuration ? Math.round(month.avgSleepDuration / 60 * 10) / 10 : null, // Convert to hours with 1 decimal
    recommended: 8 // Recommended sleep hours
  })).reverse();
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} domain={[0, 12]} />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'duration') return [value ? `${value} hours` : 'No data', 'Avg Sleep Duration'];
            if (name === 'recommended') return [`${value} hours`, 'Recommended'];
            return [value, name];
          }}
          labelFormatter={(month) => `${month}'s Average`}
        />
        <Legend />
        <Bar dataKey="duration" name="Sleep Duration">
          {chartData.map((entry, index) => {
            // Color based on sleep duration
            let color = '#8884d8'; // Default
            
            if (entry.duration === null) {
              color = '#d3d3d3'; // Gray for no data
            } else if (entry.duration < 6) {
              color = '#f44336'; // Red for too little
            } else if (entry.duration >= 7 && entry.duration <= 9) {
              color = '#4caf50'; // Green for ideal range
            } else if (entry.duration > 9) {
              color = '#ff9800'; // Orange for too much
            } else {
              color = '#ffeb3b'; // Yellow for slightly low
            }
            
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
        <Line 
          type="monotone" 
          dataKey="recommended" 
          stroke="#ff5252" 
          strokeWidth={2} 
          dot={false}
          name="Recommended"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Monthly Sleep Consistency Chart
const SleepConsistencyChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No consistency data available for these months</p>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(month => ({
    name: month.month.substring(0, 3),
    bedTimeDeviation: month.bedTimeDeviation ? Math.round(month.bedTimeDeviation) : null, // In minutes
    wakeTimeDeviation: month.wakeTimeDeviation ? Math.round(month.wakeTimeDeviation) : null, // In minutes
    target: 30 // Target: less than 30 minutes deviation
  })).reverse();
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'bedTimeDeviation') return [value ? `${value} min` : 'No data', 'Bedtime Variation'];
            if (name === 'wakeTimeDeviation') return [value ? `${value} min` : 'No data', 'Wake Time Variation'];
            if (name === 'target') return [`${value} min`, 'Target'];
            return [value, name];
          }}
          labelFormatter={(month) => `${month}'s Schedule Consistency`}
        />
        <Legend />
        <Bar dataKey="bedTimeDeviation" fill="#8884d8" name="Bedtime Variation" />
        <Bar dataKey="wakeTimeDeviation" fill="#82ca9d" name="Wake Time Variation" />
        <Line 
          type="monotone" 
          dataKey="target" 
          stroke="#ff5252" 
          strokeWidth={2} 
          dot={false}
          name="Target"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Sleep Quality Trend Chart
const SleepQualityTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No sleep quality data available for these months</p>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(month => {
    // Skip months with no quality data
    if (!month.qualityDistribution) return null;
    
    return {
      name: month.month.substring(0, 3),
      excellent: month.qualityDistribution.excellent || 0,
      good: month.qualityDistribution.good || 0,
      fair: month.qualityDistribution.fair || 0,
      poor: month.qualityDistribution.poor || 0,
      score: month.avgSleepScore || null
    };
  }).filter(Boolean).reverse();
  
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No sleep quality data available for these months</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" label={{ value: '%', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
        <YAxis yAxisId="right" orientation="right" label={{ value: 'Score', angle: 90, position: 'insideRight' }} domain={[0, 100]} />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'score') return [`${value}`, 'Sleep Score'];
            return [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)];
          }}
          labelFormatter={(month) => `${month}'s Sleep Quality`}
        />
        <Legend />
        <Area yAxisId="left" dataKey="excellent" stackId="1" fill="#4caf50" stroke="#4caf50" name="Excellent" />
        <Area yAxisId="left" dataKey="good" stackId="1" fill="#8bc34a" stroke="#8bc34a" name="Good" />
        <Area yAxisId="left" dataKey="fair" stackId="1" fill="#ffc107" stroke="#ffc107" name="Fair" />
        <Area yAxisId="left" dataKey="poor" stackId="1" fill="#f44336" stroke="#f44336" name="Poor" />
        <Line yAxisId="right" type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} name="Sleep Score" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, unit, color, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <div className="flex items-center space-x-4 mb-2">
        <div className={`bg-${color || 'blue'}-100 p-3 rounded-full`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-xl font-bold">{value} <span className="text-gray-500 text-sm">{unit}</span></p>
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

// Widget Component
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

// Sleep Score Display
const SleepScoreDisplay = ({ score, trend }) => {
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
      <div className={`w-48 h-48 ${getScoreColor(score)} rounded-full flex items-center justify-center mb-4 text-white relative`}>
        <div className="text-center">
          <p className="text-5xl font-bold">{score}</p>
          <p className="text-sm mt-1">of 100</p>
        </div>
        
        {trend && (
          <div className={`absolute -top-2 -right-2 rounded-full px-2 py-1 text-xs font-bold ${
            trend.value > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
          }`}>
            {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}
          </div>
        )}
      </div>
      <p className="text-xl font-medium text-gray-700">{getScoreMessage(score)}</p>
      
      {/* Component scores */}
      <div className="mt-4 grid grid-cols-3 gap-4 w-full">
        <div className="text-center">
          <p className="text-xs text-gray-500">Duration</p>
          <p className="text-sm font-bold text-blue-600">40%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Consistency</p>
          <p className="text-sm font-bold text-purple-600">30%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Quality</p>
          <p className="text-sm font-bold text-green-600">30%</p>
        </div>
      </div>
    </div>
  );
};

// Sleep Quality Distribution Display
const SleepQualityDistribution = ({ data }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No sleep quality data available</p>
      </div>
    );
  }
  
  const qualityData = [
    { name: 'Excellent', value: data.excellent || 0, color: '#4caf50' },
    { name: 'Good', value: data.good || 0, color: '#8bc34a' },
    { name: 'Fair', value: data.fair || 0, color: '#ffc107' },
    { name: 'Poor', value: data.poor || 0, color: '#f44336' }
  ];
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={qualityData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {qualityData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Percentage']}
          labelFormatter={(name) => `${name} Sleep Quality`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Monthly Sleep Details Component
const MonthlySleepDetails = ({ month }) => {
  if (!month) return null;
  
  // Format minutes to hours and minutes
  const formatMinutes = (minutes) => {
    if (minutes === null || minutes === undefined) return 'No data';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bed className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{month.month} {month.year} Sleep Details</h2>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Sleep Duration & Quality</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Average Sleep Duration</span>
                <span className="font-semibold">{month.formattedAvgSleepDuration || 'No data'}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Sleep Score</span>
                <span className="font-semibold">{month.avgSleepScore !== null ? `${month.avgSleepScore}/100` : 'No data'}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Days with Sleep Data</span>
                <span className="font-semibold">{month.daysWithSleepData} days</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Tracking Rate</span>
                <span className="font-semibold">
                  {month.daysTracked > 0 ? `${Math.round((month.daysWithSleepData / month.daysTracked) * 100)}%` : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bad Sleep Days</span>
                <span className="font-semibold">{month.badSleepDays} days</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Sleep Schedule</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Average Bedtime</span>
                <span className="font-semibold">{month.formattedAvgBedTime || 'No data'}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Average Wake Time</span>
                <span className="font-semibold">{month.formattedAvgWakeTime || 'No data'}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Bedtime Consistency</span>
                <span className="font-semibold">
                  {month.bedTimeDeviation !== null ? `±${month.bedTimeDeviation} min` : 'No data'}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Wake Time Consistency</span>
                <span className="font-semibold">
                  {month.wakeTimeDeviation !== null ? `±${month.wakeTimeDeviation} min` : 'No data'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Days with Complete Timing</span>
                <span className="font-semibold">{month.daysWithCompleteTiming} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Month-over-Month Comparison Component
const MonthlySleepComparison = ({ currentMonth, previousMonth }) => {
  if (!currentMonth || !previousMonth) return null;
  
  // Only show comparison if both months have sleep data
  if (!currentMonth.daysWithSleepData || !previousMonth.daysWithSleepData) return null;
  
  // Calculate changes
  const durationChange = currentMonth.avgSleepDuration && previousMonth.avgSleepDuration ? 
    (currentMonth.avgSleepDuration - previousMonth.avgSleepDuration) : null;
    
  const scoreChange = currentMonth.avgSleepScore && previousMonth.avgSleepScore ? 
    (currentMonth.avgSleepScore - previousMonth.avgSleepScore) : null;
    
  const consistencyChange = currentMonth.bedTimeDeviation && previousMonth.bedTimeDeviation ? 
    (previousMonth.bedTimeDeviation - currentMonth.bedTimeDeviation) : null; // Note: lower is better for deviation
  
  // Format duration change for display
  const formatDurationChange = (minutesChange) => {
    if (minutesChange === null) return 'N/A';
    
    const absMinutes = Math.abs(minutesChange);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (mins > 0 || hours === 0) result += `${mins}m`;
    
    return (minutesChange >= 0 ? '+' : '-') + result;
  };
  
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
        
        <div className="grid grid-cols-4 gap-3 py-3 border-b border-gray-100">
          <div className="text-gray-700">Sleep Duration</div>
          <div className="text-center text-gray-600">
            {previousMonth.formattedAvgSleepDuration || 'No data'}
          </div>
          <div className="text-center font-medium">
            {currentMonth.formattedAvgSleepDuration || 'No data'}
          </div>
          <div className={`text-center font-medium ${
            durationChange > 0 ? 'text-green-600' : 
            durationChange < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {durationChange ? formatDurationChange(durationChange) : 'N/A'}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 py-3 border-b border-gray-100">
          <div className="text-gray-700">Sleep Score</div>
          <div className="text-center text-gray-600">
            {previousMonth.avgSleepScore !== null ? previousMonth.avgSleepScore : 'No data'}
          </div>
          <div className="text-center font-medium">
            {currentMonth.avgSleepScore !== null ? currentMonth.avgSleepScore : 'No data'}
          </div>
          <div className={`text-center font-medium ${
            scoreChange > 0 ? 'text-green-600' : 
            scoreChange < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {scoreChange !== null ? (scoreChange > 0 ? '+' : '') + scoreChange : 'N/A'}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 py-3">
          <div className="text-gray-700">Bedtime Consistency</div>
          <div className="text-center text-gray-600">
            {previousMonth.bedTimeDeviation !== null ? `±${previousMonth.bedTimeDeviation} min` : 'No data'}
          </div>
          <div className="text-center font-medium">
            {currentMonth.bedTimeDeviation !== null ? `±${currentMonth.bedTimeDeviation} min` : 'No data'}
          </div>
          <div className={`text-center font-medium ${
            consistencyChange > 0 ? 'text-green-600' : 
            consistencyChange < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {consistencyChange !== null ? (consistencyChange > 0 ? '+' : '') + consistencyChange + ' min' : 'N/A'}
          </div>
        </div>
      </div>
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

// Main Sleep Panel Monthly Component
const SleepPanelMonthly = () => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [previousMonth, setPreviousMonth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch('/api/sleep/monthly');
        
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
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching monthly sleep data:', err);
        setError(err.message || 'An unexpected error occurred');
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  // Handle month selection
  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
    
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

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading monthly sleep data...</p>
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
              <p className="mt-1 text-sm text-yellow-700">No monthly sleep data was found. Start tracking your sleep to see monthly trends.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract data
  const summary = monthlyData.summary;
  
  // Get sleep quality trend data
  const sleepScoreTrend = summary.trends && summary.trends.sleepScore ? summary.trends.sleepScore : null;
  
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          icon={<Clock className="h-5 w-5 text-blue-600" />} 
          title="Avg Sleep Duration" 
          value={summary.formattedAvgSleepDuration || 'No Data'} 
          unit=""
          color="blue"
          trend={summary.trends && summary.trends.sleepDuration ? {
            value: summary.trends.sleepDuration.percentage,
            label: 'vs last month'
          } : null}
        />
        <StatCard 
          icon={<Target className="h-5 w-5 text-green-600" />} 
          title="Avg Sleep Score" 
          value={summary.avgSleepScore || 'No Data'} 
          unit="/100"
          color="green"
          trend={sleepScoreTrend ? {
            value: sleepScoreTrend.percentage,
            label: 'vs last month'
          } : null}
        />
        <StatCard 
          icon={<Moon className="h-5 w-5 text-purple-600" />} 
          title="Avg Bedtime" 
          value={summary.formattedAvgBedTime || 'No Data'} 
          unit=""
          color="purple"
          trend={summary.trends && summary.trends.consistency ? {
            value: summary.trends.consistency.percentage,
            label: 'consistency'
          } : null}
        />
      </div>
      
      {/* Main charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Monthly Sleep Duration" 
          icon={<Clock className="h-5 w-5 text-blue-600" />}
        >
          <MonthlySleepDurationChart data={monthlyData.months} />
        </Widget>
        
        <Widget 
          title="Sleep Consistency" 
          icon={<Moon className="h-5 w-5 text-purple-600" />}
        >
          <SleepConsistencyChart data={monthlyData.months} />
        </Widget>
      </div>
      
      {/* Sleep quality & score section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Sleep Quality Trends" 
          icon={<Activity className="h-5 w-5 text-green-600" />}
        >
          <SleepQualityTrendChart data={monthlyData.months} />
        </Widget>
        
        <Widget 
          title="6-Month Sleep Score" 
          icon={<Target className="h-5 w-5 text-red-600" />}
        >
          <SleepScoreDisplay 
            score={summary.avgSleepScore}
            trend={sleepScoreTrend}
          />
        </Widget>
      </div>
      
      {/* Recommendations and quality breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Sleep Recommendations" 
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        >
          <SleepRecommendations recommendations={summary.recommendations} />
        </Widget>
        
        <Widget 
          title="6-Month Quality Distribution" 
          icon={<PieChart className="h-5 w-5 text-green-600" />}
        >
          <SleepQualityDistribution data={summary.qualityDistribution} />
        </Widget>
      </div>
      
      {/* Selected month details */}
      {selectedMonth && (
        <div className="mb-6">
          <MonthlySleepDetails month={selectedMonth} />
        </div>
      )}
      
      {/* Month-over-month comparison if available */}
      {selectedMonth && previousMonth && (
        <div className="mb-6">
          <MonthlySleepComparison 
            currentMonth={selectedMonth} 
            previousMonth={previousMonth} 
          />
        </div>
      )}
      
      {/* Summary insights */}
      <div className="bg-white rounded-xl p-5 shadow-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Sleep Health Insights</h2>
        <div className="space-y-4">
          {summary.avgSleepDuration && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">Sleep Duration</h3>
              <p className="text-blue-700">
                {summary.avgSleepDuration >= 420 && summary.avgSleepDuration <= 540 ? (
                  `Your average sleep duration of ${summary.formattedAvgSleepDuration} is within the recommended 7-9 hour range. This is optimal for physical and mental health.`
                ) : summary.avgSleepDuration < 420 ? (
                  `Your average sleep duration of ${summary.formattedAvgSleepDuration} is below the recommended 7-hour minimum. Aim for more sleep to improve overall health.`
                ) : (
                  `Your average sleep duration of ${summary.formattedAvgSleepDuration} exceeds the typical recommendation of 9 hours. While some people need more sleep, consider if you're spending too much time in bed.`
                )}
              </p>
            </div>
          )}
          
          {summary.avgBedTimeDeviation !== null && (
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
              <h3 className="font-medium text-purple-800 mb-2">Sleep Consistency</h3>
              <p className="text-purple-700">
                {summary.avgBedTimeDeviation <= 30 ? (
                  `Your bedtime is very consistent (varying by only about ${summary.avgBedTimeDeviation} minutes on average). This regular sleep schedule helps optimize your body's circadian rhythm.`
                ) : summary.avgBedTimeDeviation <= 60 ? (
                  `Your bedtime varies by about ${summary.avgBedTimeDeviation} minutes on average. While not bad, aiming for more consistency could improve sleep quality.`
                ) : (
                  `Your bedtime varies significantly (by ${summary.avgBedTimeDeviation} minutes on average). Try to establish a more consistent sleep schedule to improve sleep quality.`
                )}
              </p>
            </div>
          )}
          
          {summary.qualityDistribution && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">Sleep Quality</h3>
              <p className="text-green-700">
                {summary.qualityDistribution.excellent + summary.qualityDistribution.good >= 70 ? (
                  `You report good to excellent sleep quality ${summary.qualityDistribution.excellent + summary.qualityDistribution.good}% of the time. This suggests your sleep environment and habits are working well for you.`
                ) : summary.qualityDistribution.poor >= 30 ? (
                  `You report poor sleep quality ${summary.qualityDistribution.poor}% of the time. Consider evaluating your sleep environment, stress levels, and nighttime habits.`
                ) : (
                  `Your sleep quality is mixed, with ${summary.qualityDistribution.good}% good and ${summary.qualityDistribution.fair}% fair ratings. There may be room to improve your sleep quality through better sleep hygiene.`
                )}
              </p>
            </div>
          )}
          
          {summary.trackingAdherence !== null && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
              <h3 className="font-medium text-yellow-800 mb-2">Tracking Consistency</h3>
              <p className="text-yellow-700">
                {summary.trackingAdherence >= 80 ? (
                  `You're tracking your sleep consistently (${summary.trackingAdherence}% of days), which provides reliable insights into your sleep patterns.`
                ) : summary.trackingAdherence >= 50 ? (
                  `You're tracking your sleep ${summary.trackingAdherence}% of days. More consistent tracking would provide better insights into your sleep patterns.`
                ) : (
                  `You're only tracking sleep ${summary.trackingAdherence}% of days. More regular tracking would help identify patterns and areas for improvement.`
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Sleep patterns comparison */}
      <div className="bg-white rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">6-Month Sleep Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full mr-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Best Sleep Month</h3>
            </div>
            {(() => {
              // Find month with highest sleep score
              const monthsWithScore = monthlyData.months.filter(month => month.avgSleepScore !== null);
              if (monthsWithScore.length > 0) {
                const bestMonth = [...monthsWithScore].sort((a, b) => b.avgSleepScore - a.avgSleepScore)[0];
                return (
                  <p className="text-gray-700">
                    {bestMonth.month} {bestMonth.year}
                    <span className="block text-sm text-gray-500">
                      Score: {bestMonth.avgSleepScore}/100
                    </span>
                  </p>
                );
              } else {
                return <p className="text-gray-500">No data available</p>;
              }
            })()}
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-purple-100 rounded-full mr-2">
                <Moon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium">Most Consistent Month</h3>
            </div>
            {(() => {
              // Find month with lowest bedtime deviation
              const monthsWithDeviation = monthlyData.months.filter(month => month.bedTimeDeviation !== null);
              if (monthsWithDeviation.length > 0) {
                const mostConsistentMonth = [...monthsWithDeviation].sort((a, b) => a.bedTimeDeviation - b.bedTimeDeviation)[0];
                return (
                  <p className="text-gray-700">
                    {mostConsistentMonth.month} {mostConsistentMonth.year}
                    <span className="block text-sm text-gray-500">
                      ±{mostConsistentMonth.bedTimeDeviation} minutes
                    </span>
                  </p>
                );
              } else {
                return <p className="text-gray-500">No data available</p>;
              }
            })()}
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-green-100 rounded-full mr-2">
                <Bed className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium">Longest Sleep Month</h3>
            </div>
            {(() => {
              // Find month with longest average sleep duration
              const monthsWithDuration = monthlyData.months.filter(month => month.avgSleepDuration !== null);
              if (monthsWithDuration.length > 0) {
                const longestSleepMonth = [...monthsWithDuration].sort((a, b) => b.avgSleepDuration - a.avgSleepDuration)[0];
                return (
                  <p className="text-gray-700">
                    {longestSleepMonth.month} {longestSleepMonth.year}
                    <span className="block text-sm text-gray-500">
                      {longestSleepMonth.formattedAvgSleepDuration} average
                    </span>
                  </p>
                );
              } else {
                return <p className="text-gray-500">No data available</p>;
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ComposedChart = ({ children, ...props }) => {
  // Import from recharts might be missing in some environments, check for its existence
  try {
    const ComposedChartComponent = require('recharts').ComposedChart;
    return <ComposedChartComponent {...props}>{children}</ComposedChartComponent>;
  } catch (e) {
    // Fallback to LineChart if ComposedChart is not available
    return (
      <LineChart {...props}>
        {React.Children.map(children, child => {
          // Only include Line components in the fallback
          if (child && child.type && child.type.name === 'Line') {
            return child;
          }
          return null;
        })}
      </LineChart>
    );
  }
};

export default SleepPanelMonthly;