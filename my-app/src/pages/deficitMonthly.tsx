import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, ChevronRight, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const DeficitPanelMonthly = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState({
    totalMonthsTracked: 0,
    sixMonthDeficit: 0,
    sixMonthAvgDailyDeficit: 0,
    sixMonthProjectedFatLoss: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch('/api/deficit/monthly');
        
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
        console.error('Error fetching monthly deficit data:', err);
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
        <p className="text-gray-600 font-medium">Loading monthly data...</p>
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

  // Prepare chart data
  const chartData = monthlyData.slice().reverse().map(month => ({
    name: month.month.substring(0, 3),
    deficit: month.totalDeficit,
    calories: month.totalCalories,
    avgDeficit: month.avgDailyDeficit,
    projectedLoss: month.projectedFatLoss || 0,
    actualLoss: month.weightChange ? -month.weightChange.change : null
  }));

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">
      <div className="flex flex-col items-center justify-center w-full">
        
        {/* Summary Stats */}
        <div className="w-full grid grid-cols-4 gap-4 mb-8">
          <SummaryCard 
            title="6-Month Deficit" 
            value={`${summary.sixMonthDeficit.toLocaleString()} cal`} 
            icon={<Activity className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <SummaryCard 
            title="Avg Daily Deficit" 
            value={`${summary.sixMonthAvgDailyDeficit.toLocaleString()} cal`} 
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            color="bg-emerald-50"
          />
          <SummaryCard 
            title="Projected Fat Loss" 
            value={`${summary.sixMonthProjectedFatLoss} kg`} 
            icon={<Calendar className="h-5 w-5 text-purple-600" />}
            color="bg-purple-50"
          />
          <SummaryCard 
            title="Months Tracked" 
            value={summary.totalMonthsTracked} 
            icon={<Calendar className="h-5 w-5 text-amber-600" />}
            color="bg-amber-50"
          />
        </div>
        
        {/* Monthly Deficit Chart */}
        <div className="w-full bg-white rounded-xl shadow-lg p-5 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Monthly Deficit Trend</h2>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'deficit') return [`${value.toLocaleString()} cal`, 'Total Deficit'];
                    if (name === 'calories') return [`${value.toLocaleString()} cal`, 'Total Calories'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="deficit" name="Deficit" fill="#3B82F6" />
                <Bar dataKey="calories" name="Calories" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Weight Loss Comparison */}
        <div className="w-full bg-white rounded-xl shadow-lg p-5 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Expected vs. Actual Weight Loss</h2>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'projectedLoss') return [`${value.toFixed(2)} kg`, 'Expected Loss'];
                    if (name === 'actualLoss') return [`${value ? value.toFixed(2) : 'N/A'} kg`, 'Actual Loss'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="projectedLoss" name="Expected Loss" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="actualLoss" name="Actual Loss" stroke="#6366F1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Monthly Details Selector */}
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Monthly Detail</h2>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              {/* Month selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                {monthlyData.map((month, idx) => (
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
                      label="Total Deficit" 
                      value={`${selectedMonth.totalDeficit.toLocaleString()} cal`}
                      color="text-blue-600"
                    />
                    <DetailItem 
                      label="Total Calories" 
                      value={`${selectedMonth.totalCalories.toLocaleString()} cal`}
                      color="text-orange-600"
                    />
                    <DetailItem 
                      label="Avg Daily Deficit" 
                      value={`${selectedMonth.avgDailyDeficit.toLocaleString()} cal`}
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
                      label="Projected Fat Loss" 
                      value={`${selectedMonth.projectedFatLoss?.toFixed(2) || 'N/A'} kg`}
                      color="text-emerald-600"
                    />
                    
                    {selectedMonth.weightChange && (
                      <>
                        <DetailItem 
                          label="Actual Weight Change" 
                          value={`${selectedMonth.weightChange.change.toFixed(2)} kg (${selectedMonth.weightChange.percentChange}%)`}
                          color={selectedMonth.weightChange.change < 0 ? "text-emerald-600" : "text-red-600"}
                        />
                        <DetailItem 
                          label="Starting Weight" 
                          value={`${selectedMonth.weightChange.startWeight.toFixed(1)} kg`}
                          color="text-gray-600"
                        />
                        <DetailItem 
                          label="Ending Weight" 
                          value={`${selectedMonth.weightChange.endWeight.toFixed(1)} kg`}
                          color="text-gray-600"
                        />
                      </>
                    )}
                    
                    {selectedMonth.deficitAccuracy && (
                      <DetailItem 
                        label="Deficit Accuracy" 
                        value={`${selectedMonth.deficitAccuracy.difference > 0 ? '+' : ''}${selectedMonth.deficitAccuracy.difference.toFixed(2)} kg`}
                        tooltip="Difference between expected weight loss from deficit and actual weight change"
                        color={Math.abs(selectedMonth.deficitAccuracy.difference) < 0.5 ? "text-emerald-600" : "text-amber-600"}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
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

export default DeficitPanelMonthly;