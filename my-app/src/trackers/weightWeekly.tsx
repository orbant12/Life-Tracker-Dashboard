import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, ReferenceLine, Cell } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, Calendar, Scale, ChevronRight, CircleAlert, ArrowUp, ArrowDown, Droplet, Activity, Timer, Moon, Zap } from 'lucide-react';

// Custom Tooltip Component for Line Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600 font-semibold">{payload[0].value} kg</p>
        {payload[0].payload.dayChange && (
          <p className={`text-sm ${payload[0].payload.dayChange > 0 ? 'text-red-500' : payload[0].payload.dayChange < 0 ? 'text-green-500' : 'text-gray-500'}`}>
            {payload[0].payload.dayChange > 0 ? `+${payload[0].payload.dayChange}` : payload[0].payload.dayChange} kg from previous day
          </p>
        )}
        {Object.entries(payload[0].payload.conditions || {}).some(([key, value]) => value) && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Conditions:</p>
            <div className="space-y-1">
              {payload[0].payload.conditions.bloated && (
                <p className="text-xs flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-1"></span> Bloated
                </p>
              )}
              {payload[0].payload.conditions.poop && (
                <p className="text-xs flex items-center">
                  <span className="w-2 h-2 bg-brown-400 rounded-full mr-1"></span> Bowel Movement
                </p>
              )}
              {payload[0].payload.conditions.watery && (
                <p className="text-xs flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span> Water Retention
                </p>
              )}
              {payload[0].payload.conditions.badSleep && (
                <p className="text-xs flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span> Poor Sleep
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Weight Line Chart Component
const WeightLineChart = ({ data, domain }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No weight data available for this week</p>
      </div>
    );
  }
  
  // Filter out days with no weight data
  const filteredData = data.filter(day => day.hasWeightData);
  
  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No weight data available for this week</p>
      </div>
    );
  }
  
  // Find min and max for domain if not provided
  const weights = filteredData.map(day => day.weight);
  const minWeight = domain ? domain[0] : Math.min(...weights) - 0.5;
  const maxWeight = domain ? domain[1] : Math.max(...weights) + 0.5;
  
  // Days of week abbreviations
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Process data to include day abbreviations
  const chartData = data.map((day, index) => ({
    ...day,
    name: dayAbbreviations[index],
  }));

  // Calculate average weight line value
  const avgWeight = filteredData.reduce((sum, day) => sum + day.weight, 0) / filteredData.length;
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis 
          domain={[minWeight, maxWeight]} 
          tickCount={5}
          tickFormatter={(value) => `${value.toFixed(1)} kg`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine y={avgWeight} stroke="#8884d8" strokeDasharray="3 3" label={{ value: 'Average', position: 'left' }} />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#16a34a" 
          strokeWidth={2}
          activeDot={{ r: 8 }}
          connectNulls={true}
          name="Weight (kg)"
        />
        {filteredData.length >= 3 && (
          <Line 
            type="monotone" 
            dataKey="movingAvg" 
            stroke="#9333ea" 
            strokeWidth={2}
            strokeDasharray="5 5"
            connectNulls={true}
            name="3-Day Average"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Daily Weight Change Bar Chart
const DailyWeightChangeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No weight change data available</p>
      </div>
    );
  }
  
  // Filter for days with day-to-day changes
  const changesData = data.filter(day => day.dayChange !== null);
  
  if (changesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No weight change data available</p>
      </div>
    );
  }
  
  // Days of week abbreviations
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Process data for the chart
  const chartData = data.map((day, index) => ({
    ...day,
    name: dayAbbreviations[index],
  })).filter(day => day.dayChange !== null);
  
  // Find min and max for domain
  const changes = chartData.map(day => day.dayChange);
  const absMax = Math.max(Math.abs(Math.min(...changes)), Math.abs(Math.max(...changes)));
  const domain = [-Math.max(absMax, 0.5), Math.max(absMax, 0.5)];
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis 
          domain={domain} 
          tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(1)} kg`}
        />
        <Tooltip 
          formatter={(value) => [`${value > 0 ? '+' : ''}${value.toFixed(1)} kg`, 'Daily Change']}
          labelFormatter={(day) => `${day}'s Weight Change`}
        />
        <Legend />
        <ReferenceLine y={0} stroke="#000" />
        <Bar dataKey="dayChange" name="Daily Change">
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.dayChange > 0 ? '#ef4444' : entry.dayChange < 0 ? '#16a34a' : '#94a3b8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, trend, trendValue, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-2">
        <div className={`bg-${color || 'blue'}-100 p-2 rounded-full`}>
          {icon}
        </div>
        <p className="text-gray-500 text-sm">{title}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {trend && (
        <div className={`mt-1 flex items-center text-sm ${trendValue > 0 ? 'text-red-500' : trendValue < 0 ? 'text-green-500' : 'text-gray-500'}`}>
          {trendValue > 0 ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : trendValue < 0 ? (
            <ArrowDown className="h-4 w-4 mr-1" />
          ) : (
            <div className="h-4 w-4 mr-1"></div>
          )}
          <span>{trend}</span>
        </div>
      )}
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

// Health Conditions Impact Component
const HealthImpactCard = ({ healthCorrelations }) => {
  if (!healthCorrelations) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>Not enough data to analyze health impacts</p>
      </div>
    );
  }
  
  const hasCorrelations = healthCorrelations.bloatedWeight || healthCorrelations.poopWeight;
  
  if (!hasCorrelations) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>Not enough data to analyze health impacts</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Health Condition Impact</h3>
      
      {/* Bloating Impact */}
      {healthCorrelations.bloatedWeight && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-orange-100 rounded-lg mr-2">
              <Droplet className="h-4 w-4 text-orange-500" />
            </div>
            <h4 className="font-medium">Bloating</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-center p-2 bg-white rounded-md">
              <p className="text-sm text-gray-500">With Bloating</p>
              <p className="font-semibold">{healthCorrelations.bloatedWeight.withCondition} kg</p>
            </div>
            <div className="text-center p-2 bg-white rounded-md">
              <p className="text-sm text-gray-500">Without Bloating</p>
              <p className="font-semibold">{healthCorrelations.bloatedWeight.withoutCondition} kg</p>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className={`text-sm font-medium ${healthCorrelations.bloatedWeight.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {healthCorrelations.bloatedWeight.difference > 0 ? '+' : ''}{healthCorrelations.bloatedWeight.difference} kg difference
            </span>
          </div>
        </div>
      )}
      
      {/* Poop Impact */}
      {healthCorrelations.poopWeight && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-amber-100 rounded-lg mr-2">
              <Droplet className="h-4 w-4 text-amber-500" />
            </div>
            <h4 className="font-medium">Bowel Movement</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-center p-2 bg-white rounded-md">
              <p className="text-sm text-gray-500">With Movement</p>
              <p className="font-semibold">{healthCorrelations.poopWeight.withCondition} kg</p>
            </div>
            <div className="text-center p-2 bg-white rounded-md">
              <p className="text-sm text-gray-500">Without Movement</p>
              <p className="font-semibold">{healthCorrelations.poopWeight.withoutCondition} kg</p>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className={`text-sm font-medium ${healthCorrelations.poopWeight.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {healthCorrelations.poopWeight.difference > 0 ? '+' : ''}{healthCorrelations.poopWeight.difference} kg difference
            </span>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 italic">
        These values show the average weight difference when each condition is present.
      </p>
    </div>
  );
};

// Weight Insights Component
const WeightInsights = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No weight insights available</p>
      </div>
    );
  }
  
  return (
    <div className="p-2">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Weight Insights</h3>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start space-x-2">
            <div className="mt-1">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 text-xs font-bold">{index + 1}</span>
              </div>
            </div>
            <p className="text-gray-700">{insight}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Daily Weight Component
const DailyWeightSummary = ({ data }) => {
  if (!data || !data.dailyData || data.dailyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No daily weight data available</p>
      </div>
    );
  }
  
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
  
  // Get the selected day's data
  const selectedDayData = data.dailyData[selectedDay];
  
  // Format date from YYYY / MM / DD to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split(' / ');
    return `${month}/${day}/${year}`;
  };
  
  // Get date for the selected day
  const selectedDate = formatDate(selectedDayData?.date || '');
  
  // Generate daily weight items
  const generateDailyItems = () => {
    if (!selectedDayData) return [];
    
    const dailyItems = [];
    const color = getDayColor(selectedDay);
    
    // Add weight item if available
    if (selectedDayData.weight) {
      const prevDayData = selectedDay > 0 ? data.dailyData[selectedDay - 1] : null;
      const weightChange = prevDayData && prevDayData.weight 
        ? (selectedDayData.weight - prevDayData.weight).toFixed(1) 
        : null;
      
      dailyItems.push({
        name: "Weight",
        value: `${selectedDayData.weight} kg`,
        description: weightChange 
          ? `${weightChange > 0 ? '+' : ''}${weightChange} kg from previous day` 
          : "No previous data for comparison",
        icon: <Scale className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    // Add health conditions if any are true
    const conditions = selectedDayData.conditions || {};
    if (conditions.bloated) {
      dailyItems.push({
        name: "Bloating",
        value: "Reported",
        description: "Water retention may affect weight",
        icon: <Droplet className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    if (conditions.poop) {
      dailyItems.push({
        name: "Bowel Movement",
        value: "Reported",
        description: "May cause weight fluctuation",
        icon: <DropletHalf className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    if (conditions.watery) {
      dailyItems.push({
        name: "Water Retention",
        value: "Reported",
        description: "Temporary weight increase possible",
        icon: <Zap className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    if (conditions.badSleep) {
      dailyItems.push({
        name: "Poor Sleep",
        value: "Reported",
        description: "May affect metabolism and water retention",
        icon: <Moon className="h-4 w-4 text-white" />,
        bgColor: color
      });
    }
    
    return dailyItems;
  };
  
  const dailyItems = generateDailyItems();
  const hasWeightData = selectedDayData?.hasWeightData;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Daily Weight Summary</h2>
          </div>
          
          {/* Show date for selected day */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{selectedDate}</p>
            {hasWeightData && (
              <p className="text-lg font-bold text-blue-600">
                {selectedDayData.weight} kg
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
        {hasWeightData ? (
          dailyItems.map((item, index) => (
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
              <Calendar className="h-10 w-10 text-gray-300 mb-3" />
              <p>No weight data recorded for {daysOfWeek[selectedDay].name}</p>
              <p className="text-sm mt-1">Consistent tracking helps identify patterns!</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Weekly Summary Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-600">
          <div>
            <span className="font-semibold">{data.analytics?.daysRecorded || 0}</span> days tracked
          </div>
          <div>
            <span className="font-semibold">{data.analytics?.averageWeight?.toFixed(1) || '?'}</span> kg avg
          </div>
          <div>
            <span className={`font-semibold ${data.analytics?.weeklyChange?.value > 0 ? 'text-red-500' : data.analytics?.weeklyChange?.value < 0 ? 'text-green-500' : 'text-gray-600'}`}>
              {data.analytics?.weeklyChange ? (data.analytics.weeklyChange.value > 0 ? '+' : '') + data.analytics.weeklyChange.value + ' kg' : 'No change'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Weekly Weight Tracking Panel
const WeeklyWeightTrackPanel = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch weekly weight data
  useEffect(() => {
    const fetchWeeklyWeightData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/weekly/weight');
        if (!response.ok) {
          throw new Error('Failed to fetch weekly weight data');
        }
        const data = await response.json();
        
        // Add moving average to the daily data
        const enhancedData = {
          ...data,
          dailyData: data.dailyData.map((day, index) => {
            // Calculate 3-day moving average if possible
            if (index >= 2 && day.hasWeightData && 
                data.dailyData[index-1].hasWeightData && 
                data.dailyData[index-2].hasWeightData) {
              const movingAvg = (
                day.weight + 
                data.dailyData[index-1].weight + 
                data.dailyData[index-2].weight
              ) / 3;
              return { ...day, movingAvg: parseFloat(movingAvg.toFixed(1)) };
            }
            return day;
          })
        };
        
        setWeeklyData(enhancedData);
      } catch (err) {
        console.error('Error fetching weight data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyWeightData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weekly weight data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error loading weight data: {error}</p>
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
          <p className="text-gray-600">No weight data available for the week</p>
        </div>
      </div>
    );
  }

  // Extract analytics from the data
  const analytics = weeklyData.analytics;
  
  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-auto h-full">
      <div className="mb-6">
        <p className="text-gray-600 font-[700] p-3 bg-white w-[30%] rounded">
          {weeklyData.weekStart} to {weeklyData.weekEnd}
        </p>
      </div>

      {/* Stats at a glance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Scale className="h-5 w-5 text-blue-600" />} 
          title="Average Weight" 
          value={`${analytics.averageWeight?.toFixed(1) || '?'} kg`}
          color="blue"
        />
        <StatCard 
          icon={<TrendingDown className="h-5 w-5 text-green-600" />} 
          title="Weekly Change" 
          value={analytics.weeklyChange ? `${analytics.weeklyChange.value > 0 ? '+' : ''}${analytics.weeklyChange.value} kg` : 'No change'}
          trend={analytics.weeklyChange ? `${Math.abs(analytics.weeklyChange.percentage).toFixed(1)}%` : ''}
          trendValue={analytics.weeklyChange ? analytics.weeklyChange.value : 0}
          color="green"
        />
        <StatCard 
          icon={<ArrowDown className="h-5 w-5 text-purple-600" />} 
          title="Lowest Weight" 
          value={`${analytics.lowestWeight?.toFixed(1) || '?'} kg`}
          color="purple"
        />
        <StatCard 
          icon={<ArrowUp className="h-5 w-5 text-red-600" />} 
          title="Highest Weight" 
          value={`${analytics.highestWeight?.toFixed(1) || '?'} kg`}
          color="red"
        />
      </div>
      
      {/* Main charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Weekly Weight Trend" 
          icon={<Activity className="h-5 w-5 text-blue-600" />}
        >
          <WeightLineChart data={weeklyData.weightAtGlance} />
        </Widget>
        
        <Widget 
          title="Daily Weight Changes" 
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        >
          <DailyWeightChangeChart data={weeklyData.weightAtGlance} />
        </Widget>
      </div>
      
      {/* Insights & health correlations section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Weight Insights" 
          icon={<Zap className="h-5 w-5 text-amber-600" />}
        >
          <WeightInsights insights={analytics.insights} />
        </Widget>
        
        <Widget 
          title="Health Conditions Impact" 
          icon={<Activity className="h-5 w-5 text-purple-600" />}
        >
          <HealthImpactCard healthCorrelations={analytics.healthCorrelations} />
        </Widget>
      </div>
      
      {/* Daily summary section */}
      <div className="mb-6">
        <DailyWeightSummary data={weeklyData} />
      </div>
      
      {/* Weekly stats highlights */}
      <div className="bg-white rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Weight Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full mr-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Tracking Consistency</h3>
            </div>
            <p className="text-gray-700">
              {analytics.daysRecorded} of 7 days tracked
              <span className="block text-sm text-gray-500">
                {analytics.daysRecorded >= 5 
                  ? 'Great consistency!' 
                  : analytics.daysRecorded >= 3 
                  ? 'Good tracking!' 
                  : 'Try to track more consistently'}
              </span>
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-green-100 rounded-full mr-2">
                <Timer className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium">Weight Fluctuation</h3>
            </div>
            <p className="text-gray-700">
              {analytics.highestWeight && analytics.lowestWeight 
                ? `${(analytics.highestWeight - analytics.lowestWeight).toFixed(1)} kg range` 
                : 'Not enough data'}
              <span className="block text-sm text-gray-500">
                {analytics.highestWeight && analytics.lowestWeight && (analytics.highestWeight - analytics.lowestWeight) < 1
                  ? 'Minimal fluctuation' 
                  : analytics.highestWeight && analytics.lowestWeight && (analytics.highestWeight - analytics.lowestWeight) < 2
                  ? 'Normal fluctuation' 
                  : analytics.highestWeight && analytics.lowestWeight
                  ? 'Significant fluctuation' 
                  : 'Track more days for insights'}
              </span>
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-purple-100 rounded-full mr-2">
                <CircleAlert className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium">Health Conditions</h3>
            </div>
            <p className="text-gray-700">
              {analytics.healthCorrelations.bloatedDays + analytics.healthCorrelations.poopDays + 
               analytics.healthCorrelations.wateryDays + analytics.healthCorrelations.badSleepDays} conditions reported
              <span className="block text-sm text-gray-500">
                {analytics.healthCorrelations.bloatedDays > 0 && `Bloated: ${analytics.healthCorrelations.bloatedDays} days`}
                {analytics.healthCorrelations.bloatedDays > 0 && analytics.healthCorrelations.poopDays > 0 && ', '}
                {analytics.healthCorrelations.poopDays > 0 && `BM: ${analytics.healthCorrelations.poopDays} days`}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyWeightTrackPanel;