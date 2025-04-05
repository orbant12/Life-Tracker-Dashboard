import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, MapPin, Dumbbell, Bike } from 'lucide-react';

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
          <h2 className="text-lg font-semibold text-gray-800">Activity Summary</h2>
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
const ExerciseTrackerPanel2 = () => {
  // Dummy data
      const [steps, setSteps] = useState<any[]>([
         {
           name: 'Calories',
           value: 500,
         },
         {
           name: 'Over-Intake',
           value: 0,
         },
       ]);
 
         const [burnFromMovement, setBurnFromMovement] = useState<any[]>([
           {
             name: 'Bike',
             value: 0,
           },
           {
             name: 'Cardio',
             value: 0,
           },
           {
             name: 'Steps',
             value: 0,
           },
           {
             name: 'Gym',
             value: 0,
           },
         ]);
 
        const [movementCalSum, setMovementCalSum] = useState(0)
 
        const [activitySummary, setActivitySummary] = useState([
            {
              name: 'Zone 2 Training',
              value: '32 min',
              description: '5.2 km • 320 calories',
              icon: <TrendingUp className="h-5 w-5 text-white" />,
              bgColor: '#8B5CF6'
            },
            {
              name: 'Gym Workout',
              value: '45 min',
              description: 'Full Body • 180 calories',
              icon: <Dumbbell className="h-5 w-5 text-white" />,
              bgColor: '#F59E0B'
            },
            {
              name: 'Bike Ride',
              value: '30 min',
              description: '8.5 km • 240 calories',
              icon: <Bike className="h-5 w-5 text-white" />,
              bgColor: '#EC4899'
            },
            {
              name: 'Steps',
              value: '7,580',
              description: '303 calories',
              icon: <Activity className="h-5 w-5 text-white" />,
              bgColor: '#10B981'
            }
          ]);
 
         // Fetch daily deficit on load
         useEffect(() => {
           const fetchDailyDeficit = async () => {
             try {
               const res = await fetch('/api/tracker');
               const data = await res.json();
               
               setSteps([
                 {
                   name: 'Today Steps',
                   value: data.result.steps,
                   color: 'cyan'
                 },
                 {
                   name: 'Goal',
                   value: 10000 - data.result.steps,
                   color: 'brown'
                 },
               ]);
               //Bike
               const caloriesPerMin = 8
               const kmPerBurn = 28
               const total_2 = caloriesPerMin * data.result.cycleDur
               const total_1 = kmPerBurn * data.result.cycleDist
       
               //Exercise
               const caloriesPerMin_2 = 11
               const kmPerBurn_2 = 75
               const total_1_2 = caloriesPerMin_2 * data.result.zone2Dur;
               const total_2_2 = kmPerBurn_2 * data.result.zone2Distance
       
               //Gym
               const caloriesPerMin_3 = data.result.workType == 'fullbody' ? 9 : 7
               const total = caloriesPerMin_3 * data.result.workDur;
               let sum = 0
               sum += total_2 >= total_1 ? total_2 : total_1
               sum += total_2_2 >= total_1_2 ? total_2_2 : total_1_2
               sum += Math.round(data.result.steps * 0.04)
               sum += total;
       
               setMovementCalSum(sum);
               setBurnFromMovement([
                 {
                   name: 'Bike',
                   value: total_2 >= total_1 ? total_2 : total_1,
                 },
                 {
                   name: 'Cardio',
                   value: total_2_2 >= total_1_2 ? total_2_2 : total_1_2,
                 },
                 {
                   name: 'Steps',
                   value: Math.round(data.result.steps * 0.04),
                 },
                 {
                   name: 'Gym',
                   value: total,
                 },
               ]);

               setActivitySummary([
                 {
                   name: 'Zone 2 Training',
                   value: `${data.result.zone2Dur} min`,
                   description: `${data.result.zone2Distance} km • ${total_2_2 >= total_1_2 ? total_2_2 : total_1_2} calories`,
                   icon: <TrendingUp className="h-5 w-5 text-white" />,
                   bgColor: '#8B5CF6'
                 },
                    {
                     name: 'Gym Workout',
                        value: `${data.result.workDur} min`,
                        description: `${data.result.workType} • ${total} calories`,
                        icon: <Dumbbell className="h-5 w-5 text-white" />,
                        bgColor: '#F59E0B'
                    },
                    {
                        name: 'Bike Ride',
                        value: `${data.result.cycleDur} min`,
                        description: `${data.result.cycleDist} km • ${total_2 >= total_1 ? total_2 : total_1} calories`,
                        icon: <Bike className="h-5 w-5 text-white" />,
                        bgColor: '#EC4899'
                    },
                    {
                        name: 'Steps',
                        value: `${data.result.steps}`,
                        description: `${Math.round(data.result.steps * 0.04)} calories`,
                        icon: <Activity className="h-5 w-5 text-white" />,
                        bgColor: '#10B981'
                    }
               ]);
        
             } catch (err) {
               console.error('Error fetching daily deficit:', err);
             }
           };
       
           
           fetchDailyDeficit();
         }, []);

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">

      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Clock className="h-5 w-5 text-blue-600" />} 
          title="Zone 2 Time" 
          value={activitySummary[0].value} 
          unit=""
        />
        <StatCard 
          icon={<MapPin className="h-5 w-5 text-blue-600" />} 
          title="Bike Time" 
          value={activitySummary[2].value}
          unit=""
        />
        <StatCard 
          icon={<Clock className="h-5 w-5 text-blue-600" />} 
          title="Gym Time" 
          value={activitySummary[1].value}
          unit=""
        />
        <StatCard 
          icon={<MapPin className="h-5 w-5 text-blue-600" />} 
          title="Activity Type" 
          value={steps[0].value >= 10000 ? "Active" : steps[0].value < 5000 ? "Low" : "Medium"} 
          unit=""
        />
      </div>
      
      {/* Main widgets */}
      <div className='flex flex-col items-center justify-center w-full'>
        <div className="flex flex-row justify-around w-[100%] mt-5 mb-5">
            <Widget 
                title="Steps" 
                chartData={steps} 
                total={`${steps[0].value.toLocaleString()} / 10,000`}
                icon={<Activity className="h-5 w-5 text-blue-600" />}
            />
            {movementCalSum > 0 &&
            <Widget 
            title="Calories Burned" 
            chartData={burnFromMovement} 
            total={`${movementCalSum} calories`}
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
            />
    } 
        </div>
        
        <div className="mt-5 mb-5 w-[90%]">
          <ActivitySummary data={activitySummary} />
        </div>
      </div>
    </div>
  );
};

export default ExerciseTrackerPanel2;