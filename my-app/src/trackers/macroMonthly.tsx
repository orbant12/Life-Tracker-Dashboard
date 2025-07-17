import React, { useState, useEffect } from 'react';
import { Utensils, TrendingUp, ChevronRight, Calendar, BarChart3, PieChart as PieChartIcon, Droplet, Beef } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { GiBread } from 'react-icons/gi';

const MacroPanelMonthly = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState({
    avgDailyProtein: 0,
    avgDailyCarbs: 0,
    avgDailyFat: 0,
    avgDailyCalories: 0,
    proteinPercentage: 0,
    carbsPercentage: 0,
    fatPercentage: 0,
    totalDaysTracked: 0,
    daysWithCompleteMacros: 0,
    macroAdherenceRate: 0,
    uniqueFoodsAcrossMonths: 0,
    totalWeightChange: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedChart, setSelectedChart] = useState('macroRatio'); // 'macroRatio', 'macroTrend', 'calorieIntake'

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch('/api/macro/monthly');
        
        if (!res.ok) {
          throw new Error('Failed to fetch monthly data');
        }
        
        const data = await res.json();
        setMonthlyData(data.months);
        setSummary(data.summary);
        
        // Set the most recent month as selected by default
        if (data.months && data.months.length > 0) {
          setSelectedMonth(data.months[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching monthly macro data:', err);
        setError(err.message || 'An unexpected error occurred');
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading monthly macro data...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading macro data</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Retry
        </div>
      </div>
    );
  }

  // Prepare chart data for macro ratio trend (6 months)
  const macroRatioData = monthlyData.slice().reverse().map(month => ({
    name: month.month.substring(0, 3),
    protein: month.proteinPercentage || 0,
    carbs: month.carbsPercentage || 0,
    fat: month.fatPercentage || 0
  }));

  // Prepare chart data for macro consumption trend (6 months)
  const macroTrendData = monthlyData.slice().reverse().map(month => ({
    name: month.month.substring(0, 3),
    protein: month.avgDailyProtein || 0,
    carbs: month.avgDailyCarbs || 0,
    fat: month.avgDailyFat || 0
  }));

  // Prepare chart data for calorie intake trend (6 months)
  const calorieTrendData = monthlyData.slice().reverse().map(month => ({
    name: month.month.substring(0, 3),
    calories: month.avgDailyCalories || 0
  }));

  // Prepare chart data for current macro ratio (pie chart)
  const currentRatioData = [
    { name: 'Protein', value: summary.proteinPercentage || 0, color: '#10B981' }, // Green
    { name: 'Carbs', value: summary.carbsPercentage || 0, color: '#3B82F6' },     // Blue
    { name: 'Fat', value: summary.fatPercentage || 0, color: '#F59E0B' }          // Amber
  ];

  // Selected month's macro ratio for pie chart
  const selectedMonthRatioData = selectedMonth ? [
    { name: 'Protein', value: selectedMonth.proteinPercentage || 0, color: '#10B981' }, 
    { name: 'Carbs', value: selectedMonth.carbsPercentage || 0, color: '#3B82F6' }, 
    { name: 'Fat', value: selectedMonth.fatPercentage || 0, color: '#F59E0B' }
  ] : [];

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">
      <div className="flex flex-col items-center justify-center w-full">
        
        {/* Summary Stats */}
        <div className="w-full grid grid-cols-4 gap-4 mb-8">
          <SummaryCard 
            title="Avg Daily Protein" 
            value={`${summary.avgDailyProtein}g`} 
            percentage={`${summary.proteinPercentage || 0}%`}
            icon={<Beef className="h-5 w-5 text-emerald-600" />}
            color="bg-emerald-50"
          />
          <SummaryCard 
            title="Avg Daily Carbs" 
            value={`${summary.avgDailyCarbs}g`} 
            percentage={`${summary.carbsPercentage || 0}%`}
            icon={<GiBread className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <SummaryCard 
            title="Avg Daily Fat" 
            value={`${summary.avgDailyFat}g`} 
            percentage={`${summary.fatPercentage || 0}%`}
            icon={<Droplet className="h-5 w-5 text-amber-600" />}
            color="bg-amber-50"
          />
          <SummaryCard 
            title="Avg Daily Calories" 
            value={`${summary.avgDailyCalories}`} 
            percentage={(summary.totalWeightChange && summary.totalWeightChange.change) 
              ? `${summary.totalWeightChange.change < 0 ? '-' : '+'}${Math.abs(summary.totalWeightChange.change)}kg`
              : ''}
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            color="bg-purple-50"
          />
        </div>
        
        {/* Chart Selection divs */}
        <div className="w-full flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm p-1 bg-white">
            <div
              type="div"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                selectedChart === 'macroRatio'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedChart('macroRatio')}
            >
              Macro Ratio Trend
            </div>
            <div
              type="div"
              className={`px-4 py-2 text-sm font-medium ${
                selectedChart === 'macroTrend'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedChart('macroTrend')}
            >
              Macro Grams
            </div>
            <div
              type="div"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                selectedChart === 'calorieIntake'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedChart('calorieIntake')}
            >
              Calorie Trend
            </div>
          </div>
        </div>
        
        {/* Main Chart */}
        <div className="w-full bg-white rounded-xl shadow-lg p-5 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              {selectedChart === 'macroRatio' ? (
                <PieChartIcon className="h-5 w-5 text-blue-600" />
              ) : selectedChart === 'macroTrend' ? (
                <BarChart3 className="h-5 w-5 text-blue-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedChart === 'macroRatio' ? 'Macro Ratio Trend' : 
               selectedChart === 'macroTrend' ? 'Monthly Macro Consumption' :
               'Monthly Calorie Trend'}
            </h2>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChart === 'macroRatio' ? (
                <BarChart data={macroRatioData} stackOffset="norm">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="protein" name="Protein" stackId="a" fill="#10B981" />
                  <Bar dataKey="carbs" name="Carbs" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="fat" name="Fat" stackId="a" fill="#F59E0B" />
                </BarChart>
              ) : selectedChart === 'macroTrend' ? (
                <BarChart data={macroTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`${value}g`, name.charAt(0).toUpperCase() + name.slice(1)]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="protein" name="Protein" fill="#10B981" />
                  <Bar dataKey="carbs" name="Carbs" fill="#3B82F6" />
                  <Bar dataKey="fat" name="Fat" fill="#F59E0B" />
                </BarChart>
              ) : (
                <LineChart data={calorieTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} calories`, 'Daily Average']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="calories" name="Calories" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Monthly Comparison Section */}
        <div className="w-full grid grid-cols-2 gap-6 mb-8">
          {/* 6-Month Macro Summary */}
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">6-Month Macro Distribution</h2>
            </div>
            
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentRatioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentRatioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentage']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center">
                <p className="text-xs text-gray-500">Protein</p>
                <p className="font-semibold text-emerald-600">{summary.proteinPercentage || 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Carbs</p>
                <p className="font-semibold text-blue-600">{summary.carbsPercentage || 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Fat</p>
                <p className="font-semibold text-amber-600">{summary.fatPercentage || 0}%</p>
              </div>
            </div>
          </div>
          
          {/* Selected Month Macro Summary */}
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedMonth ? `${selectedMonth.month} ${selectedMonth.year}` : 'Select Month'}
              </h2>
            </div>
            
            {selectedMonth ? (
              <>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={selectedMonthRatioData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {selectedMonthRatioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Protein</p>
                    <p className="font-semibold text-emerald-600">{selectedMonth.proteinPercentage || 0}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Carbs</p>
                    <p className="font-semibold text-blue-600">{selectedMonth.carbsPercentage || 0}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Fat</p>
                    <p className="font-semibold text-amber-600">{selectedMonth.fatPercentage || 0}%</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <p className="text-gray-500">Select a month to view details</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Monthly Details Selector */}
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Monthly Details</h2>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            {/* Month selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {monthlyData.map((month) => (
                <div
                  key={month.monthKey}
                  onClick={() => setSelectedMonth(month)}
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
            
            {selectedMonth && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DetailItem 
                    label="Avg Daily Protein" 
                    value={`${selectedMonth.avgDailyProtein}g`}
                    color="text-emerald-600"
                  />
                  <DetailItem 
                    label="Avg Daily Carbs" 
                    value={`${selectedMonth.avgDailyCarbs}g`}
                    color="text-blue-600"
                  />
                  <DetailItem 
                    label="Avg Daily Fat" 
                    value={`${selectedMonth.avgDailyFat}g`}
                    color="text-amber-600"
                  />
                  <DetailItem 
                    label="Avg Daily Calories" 
                    value={`${selectedMonth.avgDailyCalories}`}
                    color="text-purple-600"
                  />
                  <DetailItem 
                    label="Days Tracked" 
                    value={selectedMonth.daysTracked}
                    color="text-gray-600"
                  />
                </div>
                
                <div className="space-y-4">
                  <DetailItem 
                    label="Days With Complete Macros" 
                    value={`${selectedMonth.daysWithCompleteMacros} (${Math.round((selectedMonth.daysWithCompleteMacros / selectedMonth.daysTracked) * 100)}%)`}
                    color="text-blue-600"
                  />
                  <DetailItem 
                    label="Unique Foods" 
                    value={selectedMonth.uniqueFoodCount || 0}
                    color="text-emerald-600"
                  />
                  
                  {selectedMonth.weightChange && (
                    <DetailItem 
                      label="Weight Change" 
                      value={`${selectedMonth.weightChange.change} kg (${selectedMonth.weightChange.percentChange}%)`}
                      color={selectedMonth.weightChange.change < 0 ? "text-emerald-600" : "text-red-600"}
                    />
                  )}
                  
                  {selectedMonth.startWeight && selectedMonth.endWeight && (
                    <>
                      <DetailItem 
                        label="Start Weight" 
                        value={`${selectedMonth.startWeight.toFixed(1)} kg`}
                        color="text-gray-600"
                      />
                      <DetailItem 
                        label="End Weight" 
                        value={`${selectedMonth.endWeight.toFixed(1)} kg`}
                        color="text-gray-600"
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Top Foods Section */}
        {selectedMonth && selectedMonth.topFoods && selectedMonth.topFoods.length > 0 && (
          <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Utensils className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Top Foods for {selectedMonth.month}</h2>
              </div>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                {selectedMonth.topFoods.slice(0, 5).map((food, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <span className="font-semibold text-emerald-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{food.name}</p>
                        <p className="text-xs text-gray-500">
                          {food.count} times • {food.totalCalories} total calories • {food.totalProtein}g protein
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, percentage, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center space-x-2 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      {percentage && <p className="text-sm text-gray-500 mt-1">{percentage}</p>}
    </div>
  );
};

const DetailItem = ({ label, value, color, tooltip }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
      <div className="flex items-center space-x-1">
        <p className="font-medium text-gray-700">{label}</p>
        {tooltip && (
          <div className="group relative">
            <div className="cursor-help rounded-full bg-gray-200 px-1 text-xs text-gray-600">?</div>
            <div className="absolute z-10 w-48 px-2 py-1 mt-2 text-xs text-white bg-gray-800 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <p className={`font-semibold ${color}`}>{value}</p>
    </div>
  );
};

export default MacroPanelMonthly;