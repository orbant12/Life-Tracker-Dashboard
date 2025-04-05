import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, MapPin, Dumbbell, Bike, TrendingDown, Target, Weight, Bed } from 'lucide-react';

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
          formatter={(value) => [`${value} calories`, 'Value']}
          labelFormatter={(name) => `Category: ${name}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, unit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
      <div className="bg-blue-100 p-3 rounded-full">
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
const Widget = ({ title, chartData, total, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-full w-[40%]">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              {icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">Today</span>
        </div>
      </div>
      
      <div className="p-5">
        <EnhancedPieChart data={chartData} />
        <div className="mt-3 text-center">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
        </div>
      </div>
    </div>
  );
};

// Activity Summary Card
const ActivitySummary = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Sleep Details</h2>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        
        {data.map((item, index) => (
            item.value !== "0 min" && item.name !== "Steps" &&
          <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: item.bgColor }}>
                {item.icon}
              </div>
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center">
              <p className="font-semibold">{item.value}</p>
              <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
            </div>
          </div>
        ))
  
      }
      </div>
    </div>
  );
};

// Main Exercise Tracker Panel
const SleepTrackPanel = () => {

    const [sleepWindow, setSleepWindow] = useState({
        start: '01:01',
        end: '01:01'
    });
     const [activitySummary, setActivitySummary] = useState([
            {
                name: 'Todays Sleep',
                value: '32 min',
                description: '5.2 km • 320 calories',
                icon: <TrendingUp className="h-5 w-5 text-white" />,
                bgColor: '#8B5CF6'
            },
                {
                  name: 'Quality',
                  value: '32 min',
                  description: '5.2 km • 320 calories',
                  icon: <TrendingUp className="h-5 w-5 text-white" />,
                  bgColor: '#8B5CF6'
                },
               
              ]);
  
 
         // Fetch daily deficit on load
         useEffect(() => {
           const fetchDailyDeficit = async () => {
             try {
               const res = await fetch('/api/tracker');
               const data = await res.json();

               setActivitySummary([
                {
                    name: 'Todays Sleep',
                    value: data.result.sleepHours,
                    description: '',
                    icon: <Bed className="h-5 w-5 text-white" />,
                    bgColor: '#8B5CF6'
                },
                    {
                      name: 'Quality',
                      value: data.result.sleepQuality,
                      description: '',
                      icon: <TrendingUp className="h-5 w-5 text-white" />,
                      bgColor: '#8B5CF6'
                    },
                   
                  ]);

                  setSleepWindow({
                    start: data.result.bedTime,
                    end: data.result.wakeTime
                  });
      
               
             } catch (error) {
               console.error('Error fetching daily deficit:', error);
             }
           };
       
           
           fetchDailyDeficit();
         }, []);

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">

        {/* Progress Indicators */}
        <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <TrendingDown size={18} className="text-green-500" />
                <span className="font-medium text-gray-700">Sleep Window</span>
            </div>
            <span className="text-lg font-bold text-green-500">{sleepWindow.start} - {sleepWindow.end}</span>
            </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Target size={18} className="text-indigo-500" />
                <span className="font-medium text-gray-700">Sleep Dept</span>
            </div>
            <span className="text-lg font-bold text-indigo-500">72 kg</span>
            </div>
        </div>
        </div>
            
      {/* Main widgets */}
      <div className='flex flex-col items-center justify-center w-full'>
        <div className="flex flex-row justify-around w-[100%] mt-5 mb-5">
            <Widget 
                title="Sleep" 
                chartData={[
                    { name: 'Sleep', value: 6, color: '#0088FE' },
                    { name: 'Goal', value: 8, color: '#00C49F' },]} 
                total={`${activitySummary[0].value} h`}
                icon={<Activity className="h-5 w-5 text-blue-600" />}
            />
            
        </div>
        
        <div className="mt-5 mb-5 w-[90%]">
          <ActivitySummary data={activitySummary} />
        </div>
      </div>
    </div>
  );
};

export default SleepTrackPanel;