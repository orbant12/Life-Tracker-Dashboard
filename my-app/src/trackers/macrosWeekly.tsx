import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, MapPin, Dumbbell, Bike, FolderOpenDotIcon, CalculatorIcon } from 'lucide-react';
import { GiOpenedFoodCan } from 'react-icons/gi';

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
          label={({ name, value }) => `${name}: ${value} g`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} g`, 'Value']}
          labelFormatter={(name) => `Category: ${name}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};


// Stat Card Component
const StatCard = ({ icon, title, value, unit,percent }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap justify-around items-center space-x-4 w-[25%]">
      <div className="bg-blue-100 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-bold">{value} <span className="text-gray-500 text-sm">{unit}</span></p>
      </div>
      <div className='w-[1px] h-[50px] bg-gray-200'></div>
      <div>
        <p className="text-xl font-bold">{percent} %</p>
      </div>
    </div>
  );
};

// Main Widget Component
const Widget = ({ title, chartData, total, icon,chartTitle }) => {
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
          <p className="text-gray-500 text-sm">{chartTitle}</p>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
        </div>
      </div>
    </div>
  );
};



// Activity Summary Card
const ActivitySummaryWeekly = ({ data }) => {
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
  const isValidData = Array.isArray(data) && data.length > 0;
  
  // Get the selected day's data
  const selectedDayData = isValidData && selectedDay < data.length ? data[selectedDay] : null;
  
  // Get date for the selected day
  const selectedDate = selectedDayData ? selectedDayData.date : '';
  
  // Get nutrition data for the selected day
  const nutritionData = selectedDayData && selectedDayData.nutrition ? selectedDayData.nutrition : { calories: 0, deficit: 0 };
  
  // Get food items for the selected day
  const foodItems = selectedDayData && Array.isArray(selectedDayData.foods) ? selectedDayData.foods : [];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Intake Summary</h2>
          </div>
          
          {/* Show date and calories for selected day */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{selectedDate}</p>
            <p className="text-lg font-bold text-blue-600">{nutritionData.calories} cal</p>
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
        {foodItems.length > 0 ? (
          foodItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: getDayColor(selectedDay) }}>
                  {(item.protein !== null || item.carbs !== null || item.fats !== null) ? <GiOpenedFoodCan className="h-4 w-4 text-white" /> :<CalculatorIcon className="h-4 w-4 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-left">{item.name}</p>
                  {(item.protein !== null || item.carbs !== null || item.fats !== null) && (
                    <p className="text-xs text-gray-500 mt-1 text-left">
                      {item.servingSize && item.servingUnit && (
                        <span className='font-bold'>{item.servingSize}{item.servingUnit}</span>
                      )}
                      {item.protein !== undefined && ` • Protein: ${item.protein}g`}
                      {item.carbs !== undefined && ` • Carbs: ${item.carbs}g`}
                      {item.fats !== undefined && ` • Fats: ${item.fats}g`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <p className="font-semibold">{item.calories || 0} cal</p>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No food entries for {daysOfWeek[selectedDay].name}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Exercise Tracker Panel
const FoodTrackerPanelWeekly = () => {
  const [currWeight, setCurrWeight] = useState(0);
  const [foodList, setFoodList] = useState([])
   const [overall,setOverall] = useState<any[]>([
          {
            name: 'Protein',
            value: 500,
            color: 'cyan'
          },
          {
            name: 'Fat',
            value: 0,
            color: 'brown'
          },
          {
            name: 'Carbs',
            value: 0,
            color: 'black'
          },
        ]);
  
          useEffect(() => {
            const fetchDailyDeficit = async () => {
              try {
                const res = await fetch('/api/tracker/weekly/macro');
                const data = await res.json();
                
                setOverall([
                  {
                    name: 'Protein',
                    value: data.result.weeklyAverages.nutrition.totalProtein,
                    color: 'cyan'
                  },
                  {
                    name: 'Fat',
                    value: data.result.weeklyAverages.nutrition.totalFat,
                    color: 'brown'
                  },
                  {
                    name: 'Carbs',
                    value: data.result.weeklyAverages.nutrition.totalCarbs,
                    color: 'orange'
                  },
                ]);

                setCurrWeight(data.result.dailyData[0].nutrition.weight);
                setFoodList(data.result.dailyData)    
         
              } catch (err) {
                console.error('Error fetching daily deficit:', err);
              }
            };
        
            
            fetchDailyDeficit();
          }, []);
  

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">

    {overall.reduce((acc, item) => acc + item.value, 0) > 0 ? ( 
    <>
      
      {/* Main widgets */}
            <div className="flex flex-row justify-around w-full mb-5">
              <StatCard 
                icon={<Clock className="h-5 w-5 text-blue-600" />} 
                title="Protein" 
                  value={overall[0].value}
                  percent={Math.round((overall[0].value / overall.reduce((acc, item) => acc + item.value, 0)) * 100)}
                unit="g"
              />
              <StatCard 
                icon={<MapPin className="h-5 w-5 text-blue-600" />} 
                title="Fat" 
                  value={overall[1].value}
                  percent={Math.round(overall[1].value / overall.reduce((acc, item) => acc + item.value, 0) * 100)}
                unit="g"
              />
              <StatCard 
                icon={<Clock className="h-5 w-5 text-blue-600" />} 
                title="Carbs" 
                  value={overall[2].value}
                  percent={Math.round(overall[2].value / overall.reduce((acc, item) => acc + item.value, 0)  * 100)}
                unit="g"
              />
            </div>
     
      <div className='flex flex-col items-center justify-center w-full'>
        <div className="flex flex-row justify-around w-[100%] mt-5 mb-5">
            <Widget 
                title="Weekly Overall Macros" 
                chartData={overall} 
                total={`${overall.reduce((acc, item) => acc + item.value, 0)} g`}
                icon={<Activity className="h-5 w-5 text-blue-600" />}
                chartTitle={'Total'}
            />

            <Widget
                title="Weekly Protein Goal" 
                chartData={[overall[0], {name: 'Goal', value: Math.round(((currWeight * 1.6) * 7) - overall[0].value), color: 'green'}]}
                total={`${Math.round(currWeight * 1.6) * 7} g`}
                icon={<Activity className="h-5 w-5 text-blue-600" />}
                chartTitle={'Goal'}
            />
            
     
        </div>
        
        <div className="mt-5 mb-5 w-[90%]">
          <ActivitySummaryWeekly data={foodList} />
        </div>
      </div>
      </>
  ):(
      <div className='flex flex-col items-center justify-center w-full h-full'>
        <div className='flex flex-col items-center justify-center'>
          <FolderOpenDotIcon className='h-10 w-10 text-gray-400' />
          <p className='text-gray-500 text-sm font-[600] mt-2'>No data available</p>
        </div>
      </div>
  )
    }
    </div>
  );
};

export default FoodTrackerPanelWeekly;