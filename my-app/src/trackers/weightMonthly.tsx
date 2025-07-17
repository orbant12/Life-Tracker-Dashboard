import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, AlertCircle, TrendingUp, Scale, Calendar, Droplet, Moon, CalculatorIcon, Utensils } from 'lucide-react';
import { GiMedicalPack, GiWeightScale } from 'react-icons/gi';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

// Helper components
const StatCard = ({ icon, title, value, unit, color, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <div className="flex items-center space-x-4 mb-2">
        <div className={`bg-${color || 'blue'}-100 p-3 rounded-full`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-xl font-bold">{typeof value === 'number' ? value?.toLocaleString() : value} <span className="text-gray-500 text-sm">{unit}</span></p>
        </div>
      </div>
      {trend && (
        <div className={`text-sm mt-1 ${trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {trend.value > 0 ? (
            <FaArrowUp className="inline mr-1" />
          ) : trend.value < 0 ? (
            <FaArrowDown className="inline mr-1" />
          ) : null}
          {' '}
          {Math.abs(trend.value)}{trend.unit} {trend.label}
        </div>
      )}
    </div>
  );
};

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

// Monthly Weight Trend Chart
const MonthlyWeightTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No weight data available for these months</p>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(month => ({
    name: month.month.substring(0, 3),
    avgWeight: month.avgWeight || null,
    minWeight: month.minWeight || null,
    maxWeight: month.maxWeight || null
  })).reverse();
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
        <Tooltip 
          formatter={(value, name) => [
            value ? `${value} kg` : 'No data', 
            name === 'avgWeight' ? 'Average Weight' : 
            name === 'minWeight' ? 'Minimum Weight' : 
            'Maximum Weight'
          ]}
          labelFormatter={(month) => `${month}'s Weight`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="avgWeight" 
          stroke="#3B82F6" 
          strokeWidth={2}
          name="Average Weight"
          connectNulls
        />
        <Line 
          type="monotone" 
          dataKey="minWeight" 
          stroke="#10B981" 
          strokeWidth={1}
          name="Minimum Weight"
          connectNulls
          strokeDasharray="3 3"
        />
        <Line 
          type="monotone" 
          dataKey="maxWeight" 
          stroke="#F59E0B" 
          strokeWidth={1}
          name="Maximum Weight"
          connectNulls
          strokeDasharray="3 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Weight vs. Calories Chart
const WeightCaloriesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No data available for correlation analysis</p>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(month => ({
    name: month.month.substring(0, 3),
    avgWeight: month.avgWeight || null,
    avgCalories: month.nutrition?.avgDailyCalories || null,
    weightChange: month.weightChange?.absolute || null
  })).reverse();
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" domain={['dataMin - 1', 'dataMax + 1']} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 500']} />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'avgWeight') return [`${value} kg`, 'Average Weight'];
            if (name === 'avgCalories') return [`${value} cal`, 'Avg Daily Calories'];
            if (name === 'weightChange') {
              const prefix = value > 0 ? '+' : '';
              return [`${prefix}${value} kg`, 'Weight Change'];
            }
            return [value, name];
          }}
          labelFormatter={(month) => `${month}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          yAxisId="left"
          dataKey="avgWeight" 
          stroke="#3B82F6" 
          strokeWidth={2}
          name="Average Weight"
          connectNulls
        />
        <Line 
          type="monotone" 
          yAxisId="right"
          dataKey="avgCalories" 
          stroke="#F97316" 
          strokeWidth={2}
          name="Avg Daily Calories"
          connectNulls
        />
        <Line 
          type="monotone" 
          yAxisId="left"
          dataKey="weightChange" 
          stroke="#8884d8" 
          strokeWidth={1}
          name="Weight Change"
          connectNulls
          strokeDasharray="3 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Weight Condition Correlation Chart
const WeightConditionChart = ({ month }) => {
  if (!month || !month.conditionCorrelations) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>No condition correlation data available</p>
      </div>
    );
  }

  // Create data for the chart
  const chartData = [];
  const conditions = ['bloated', 'poop', 'watery', 'badSleep'];
  const conditionLabels = {
    bloated: 'Bloated',
    poop: 'Bowel Movement',
    watery: 'Water Retention',
    badSleep: 'Poor Sleep'
  };
  
  conditions.forEach(condition => {
    if (month.conditionCorrelations[condition]) {
      chartData.push({
        name: conditionLabels[condition],
        withCondition: month.conditionCorrelations[condition].avgWithCondition,
        withoutCondition: month.conditionCorrelations[condition].avgWithoutCondition,
        difference: Math.abs(month.conditionCorrelations[condition].difference),
        impact: month.conditionCorrelations[condition].difference > 0 ? 'Increases Weight' : 'Decreases Weight'
      });
    }
  });
  
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>Not enough data to establish correlations</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={['dataMin - 0.5', 'dataMax + 0.5']} />
        <YAxis dataKey="name" type="category" width={120} />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'withCondition') return [`${value} kg`, 'With Condition'];
            if (name === 'withoutCondition') return [`${value} kg`, 'Without Condition'];
            if (name === 'difference') return [`${value} kg`, 'Difference'];
            return [value, name];
          }}
        />
        <Legend />
        <Bar dataKey="withCondition" fill="#3B82F6" name="With Condition" />
        <Bar dataKey="withoutCondition" fill="#9CA3AF" name="Without Condition" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Health Condition Impact Component
const HealthConditionImpact = ({ summary }) => {
  if (!summary || !summary.conditionImpacts || Object.keys(summary.conditionImpacts).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-gray-500">
        <p>Not enough data to determine condition impacts</p>
      </div>
    );
  }
  
  const conditionLabels = {
    bloated: 'Bloating',
    poop: 'Bowel Movement',
    watery: 'Water Retention',
    badSleep: 'Poor Sleep'
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-800 mb-2">Health Condition Impact on Weight</h3>
      
      {Object.entries(summary.conditionImpacts).map(([condition, impact]) => (
        <div key={condition} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              impact.averageDifference > 0 ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <GiMedicalPack className={`h-4 w-4 ${
                impact.averageDifference > 0 ? 'text-red-500' : 'text-green-500'
              }`} />
            </div>
            <span className="text-gray-700">{conditionLabels[condition]}</span>
          </div>
          
          <div className="flex items-center">
            <span className={`font-medium ${
              impact.averageDifference > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {impact.averageDifference > 0 ? '+' : ''}
              {impact.averageDifference} kg
            </span>
            {impact.consistentDirection && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Consistent
              </span>
            )}
          </div>
        </div>
      ))}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Values show the average weight difference when the condition is present versus absent.</p>
      </div>
    </div>
  );
};

// Monthly Weight Details Component
const MonthlyWeightDetails = ({ month }) => {
  if (!month) return null;
  
  // Calculate fluctuation range
  const fluctuationRange = month.maxWeight && month.minWeight ? 
    (month.maxWeight - month.minWeight).toFixed(1) : null;
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <GiWeightScale className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{month.month} {month.year} Weight Details</h2>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Weight Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Average Weight</span>
                <span className="font-semibold">{month.avgWeight ? `${month.avgWeight} kg` : 'No data'}</span>
              </div>
              
              {month.startWeight && (
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Start Weight</span>
                  <span className="font-semibold">{month.startWeight} kg</span>
                </div>
              )}
              
              {month.endWeight && (
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-600">End Weight</span>
                  <span className="font-semibold">{month.endWeight} kg</span>
                </div>
              )}
              
              {month.weightChange && (
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Weight Change</span>
                  <span className={`font-semibold ${
                    month.weightChange.absolute < 0 ? 'text-green-600' : 
                    month.weightChange.absolute > 0 ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {month.weightChange.absolute > 0 ? '+' : ''}
                    {month.weightChange.absolute} kg ({month.weightChange.percentage}%)
                  </span>
                </div>
              )}
              
              {fluctuationRange && (
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Fluctuation Range</span>
                  <span className="font-semibold">{fluctuationRange} kg</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tracking Rate</span>
                <span className="font-semibold">{month.weightTrackingRate}% of days</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Nutrition & Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Avg Daily Calories</span>
                <span className="font-semibold">{month.nutrition.avgDailyCalories} cal</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Avg Daily Protein</span>
                <span className="font-semibold">{month.nutrition.avgDailyProtein} g</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total Caloric Deficit</span>
                <span className="font-semibold">{month.nutrition.totalDeficit.toLocaleString()} cal</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Days with Bloating</span>
                <span className="font-semibold">{month.conditions.bloatedDays} days</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Days with Poor Sleep</span>
                <span className="font-semibold">{month.conditions.badSleepDays} days</span>
              </div>
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
  
  // Only show comparison if both months have weight data
  if (!currentMonth.avgWeight || !previousMonth.avgWeight) return null;
  
  // Calculate changes
  const avgWeightChange = (currentMonth.avgWeight - previousMonth.avgWeight).toFixed(1);
  const calorieChange = currentMonth.nutrition.avgDailyCalories - previousMonth.nutrition.avgDailyCalories;
  const proteinChange = currentMonth.nutrition.avgDailyProtein - previousMonth.nutrition.avgDailyProtein;
  const deficitChange = currentMonth.nutrition.totalDeficit - previousMonth.nutrition.totalDeficit;
  
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
          <div className="text-gray-700">Average Weight</div>
          <div className="text-center text-gray-600">{previousMonth.avgWeight} kg</div>
          <div className="text-center font-medium">{currentMonth.avgWeight} kg</div>
          <div className={`text-center font-medium ${
            avgWeightChange < 0 ? 'text-green-600' : 
            avgWeightChange > 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {avgWeightChange > 0 ? '+' : ''}
            {avgWeightChange} kg
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 py-3 border-b border-gray-100">
          <div className="text-gray-700">Daily Calories</div>
          <div className="text-center text-gray-600">{previousMonth.nutrition.avgDailyCalories} cal</div>
          <div className="text-center font-medium">{currentMonth.nutrition.avgDailyCalories} cal</div>
          <div className={`text-center font-medium ${
            calorieChange < 0 ? 'text-green-600' : 
            calorieChange > 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {calorieChange > 0 ? '+' : ''}
            {calorieChange} cal
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 py-3 border-b border-gray-100">
          <div className="text-gray-700">Daily Protein</div>
          <div className="text-center text-gray-600">{previousMonth.nutrition.avgDailyProtein} g</div>
          <div className="text-center font-medium">{currentMonth.nutrition.avgDailyProtein} g</div>
          <div className={`text-center font-medium ${
            proteinChange > 0 ? 'text-green-600' : 
            proteinChange < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {proteinChange > 0 ? '+' : ''}
            {proteinChange} g
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 py-3">
          <div className="text-gray-700">Total Deficit</div>
          <div className="text-center text-gray-600">{previousMonth.nutrition.totalDeficit.toLocaleString()} cal</div>
          <div className="text-center font-medium">{currentMonth.nutrition.totalDeficit.toLocaleString()} cal</div>
          <div className={`text-center font-medium ${
            deficitChange > 0 ? 'text-green-600' : 
            deficitChange < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {deficitChange > 0 ? '+' : ''}
            {deficitChange.toLocaleString()} cal
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Weight Panel Monthly Component
const WeightPanelMonthly = () => {
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
        const res = await fetch('/api/weight/monthly');
        
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
        console.error('Error fetching monthly weight data:', err);
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
        <p className="text-gray-600 font-medium">Loading monthly weight data...</p>
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
              <p className="mt-1 text-sm text-yellow-700">No monthly weight data was found. Start tracking your weight to see monthly trends.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract data
  const summary = monthlyData.summary;
  
  // Calculate summary weight change
  const weightChange = summary.totalWeightChange ? summary.totalWeightChange.change : null;
  
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
          icon={<Scale className="h-5 w-5 text-blue-600" />} 
          title="6-Month Weight Change" 
          value={weightChange ? weightChange : 'No Data'} 
          unit={weightChange ? 'kg' : ''}
          color="blue"
          trend={weightChange ? {
            value: weightChange,
            unit: '%',
            label: summary.totalWeightChange.percentage + '%'
          } : null}
        />
        <StatCard 
          icon={<CalculatorIcon className="h-5 w-5 text-green-600" />} 
          title="Avg Daily Calories" 
          value={summary.avgDailyCalories || 'No Data'} 
          unit="cal"
          color="green"
        />
        <StatCard 
          icon={<Utensils className="h-5 w-5 text-purple-600" />} 
          title="Avg Daily Protein" 
          value={summary.avgDailyProtein || 'No Data'} 
          unit="g"
          color="purple"
        />
        <StatCard 
          icon={<TrendingUp className="h-5 w-5 text-red-600" />} 
          title="Total Deficit" 
          value={summary.totalDeficit ? summary.totalDeficit.toLocaleString() : 'No Data'} 
          unit="cal"
          color="red"
          trend={summary.deficitPerKgLost ? {
            value: summary.deficitPerKgLost,
            label: 'calories per kg lost'
          } : null}
        />
      </div>
      
      {/* Main charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title="Monthly Weight Trend" 
          icon={<Scale className="h-5 w-5 text-blue-600" />}
        >
          <MonthlyWeightTrendChart data={monthlyData.months} />
        </Widget>
        
        <Widget 
          title="Weight vs. Calories" 
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        >
          <WeightCaloriesChart data={monthlyData.months} />
        </Widget>
      </div>
      
      {/* Condition correlation & health impacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Widget 
          title={`Health Conditions - ${selectedMonth ? `${selectedMonth.month} ${selectedMonth.year}` : 'Current Month'}`} 
          icon={<Droplet className="h-5 w-5 text-red-600" />}
        >
          <WeightConditionChart month={selectedMonth} />
        </Widget>
        
        <Widget 
          title="Health Condition Impact" 
          icon={<Moon className="h-5 w-5 text-purple-600" />}
        >
          <HealthConditionImpact summary={summary} />
        </Widget>
      </div>
      
      {/* Selected month details */}
      {selectedMonth && (
        <div className="mb-6">
          <MonthlyWeightDetails month={selectedMonth} />
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
      
      {/* Summary insights */}
      <div className="bg-white rounded-xl p-5 shadow-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Weight Management Insights</h2>
        <div className="space-y-4">
          {summary.totalWeightChange && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">6-Month Summary</h3>
              <p className="text-blue-700">
                {summary.totalWeightChange.change < 0 ? (
                  `You've lost ${Math.abs(summary.totalWeightChange.change)} kg (${Math.abs(summary.totalWeightChange.percentage)}%) over ${monthlyData.months.length} months, averaging ${Math.abs(summary.totalWeightChange.averageMonthlyChange)} kg per month.`
                ) : summary.totalWeightChange.change > 0 ? (
                  `You've gained ${summary.totalWeightChange.change} kg (${summary.totalWeightChange.percentage}%) over ${monthlyData.months.length} months, averaging ${summary.totalWeightChange.averageMonthlyChange} kg per month.`
                ) : (
                  `Your weight has remained stable over ${monthlyData.months.length} months.`
                )}
              </p>
            </div>
          )}
          
          {summary.deficitPerKgLost && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">Caloric Efficiency</h3>
              <p className="text-green-700">
                Your body burns approximately {summary.deficitPerKgLost.toLocaleString()} calories to lose 1 kg of weight.
                {summary.deficitPerKgLost > 7700 ? (
                  ` This is higher than the theoretical 7,700 calories per kg, suggesting factors beyond just calorie deficit are affecting your weight loss.`
                ) : summary.deficitPerKgLost < 7700 ? (
                  ` This is lower than the theoretical 7,700 calories per kg, suggesting you may be efficiently converting caloric deficit to weight loss.`
                ) : (
                  ` This is almost exactly the theoretical 7,700 calories needed per kg of fat loss.`
                )}
              </p>
            </div>
          )}
          
          {summary.surplusPerKgGained && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
              <h3 className="font-medium text-yellow-800 mb-2">Surplus Analysis</h3>
              <p className="text-yellow-700">
                Your body requires approximately {summary.surplusPerKgGained.toLocaleString()} excess calories to gain 1 kg of weight.
                {summary.surplusPerKgGained > 7700 ? (
                  ` This is higher than the theoretical 7,700 calories per kg, suggesting your body may be resistant to weight gain.`
                ) : summary.surplusPerKgGained < 7700 ? (
                  ` This is lower than the theoretical 7,700 calories per kg, suggesting your body may efficiently convert excess calories to weight.`
                ) : (
                  ` This is almost exactly the theoretical value for caloric surplus to weight gain conversion.`
                )}
              </p>
            </div>
          )}
          
          {Object.keys(summary.conditionImpacts || {}).length > 0 && (
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
              <h3 className="font-medium text-purple-800 mb-2">Health Condition Analysis</h3>
              <p className="text-purple-700">
                {(() => {
                  // Find conditions with consistent impact
                  const consistent = Object.entries(summary.conditionImpacts)
                    .filter(([_, impact]) => impact.consistentDirection)
                    .map(([condition, impact]) => ({
                      condition,
                      impact: impact.averageDifference
                    }));
                  
                  if (consistent.length > 0) {
                    const conditionLabels = {
                      bloated: 'Bloating',
                      poop: 'Bowel movements',
                      watery: 'Water retention',
                      badSleep: 'Poor sleep'
                    };
                    
                    return consistent.map(c => 
                      `${conditionLabels[c.condition]} consistently ${c.impact > 0 ? 'increases' : 'decreases'} your weight by about ${Math.abs(c.impact)} kg.`
                    ).join(' ');
                  } else {
                    return 'Your health conditions show variable effects on your weight. More consistent data may reveal clearer patterns.';
                  }
                })()}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Historical extremes */}
      <div className="bg-white rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">6-Month Milestones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            // Find lowest and highest weight months
            const monthsWithWeight = monthlyData.months.filter(month => month.avgWeight);
            
            if (monthsWithWeight.length === 0) {
              return (
                <div className="col-span-3 text-center py-6 text-gray-500">
                  <p>Not enough weight data available to determine milestones</p>
                </div>
              );
            }
            
            const lowestWeightMonth = [...monthsWithWeight].sort((a, b) => a.avgWeight - b.avgWeight)[0];
            const highestWeightMonth = [...monthsWithWeight].sort((a, b) => b.avgWeight - a.avgWeight)[0];
            
            // Find month with highest caloric deficit
            const highestDeficitMonth = [...monthlyData.months].sort((a, b) => 
              b.nutrition.totalDeficit - a.nutrition.totalDeficit
            )[0];
            
            return (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-blue-100 rounded-full mr-2">
                      <Scale className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Lowest Weight</h3>
                  </div>
                  <p className="text-gray-700">
                    {lowestWeightMonth.month} {lowestWeightMonth.year}
                    <span className="block text-sm text-gray-500">
                      {lowestWeightMonth.avgWeight} kg average
                    </span>
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-red-100 rounded-full mr-2">
                      <Scale className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-medium">Highest Weight</h3>
                  </div>
                  <p className="text-gray-700">
                    {highestWeightMonth.month} {highestWeightMonth.year}
                    <span className="block text-sm text-gray-500">
                      {highestWeightMonth.avgWeight} kg average
                    </span>
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-green-100 rounded-full mr-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-medium">Best Deficit</h3>
                  </div>
                  <p className="text-gray-700">
                    {highestDeficitMonth.month} {highestDeficitMonth.year}
                    <span className="block text-sm text-gray-500">
                      {highestDeficitMonth.nutrition.totalDeficit.toLocaleString()} calorie deficit
                    </span>
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default WeightPanelMonthly;