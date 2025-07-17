import React, { useState, useEffect, useRef } from 'react';
import BasicPie from '../components/pie';
import { BottomContainer, ViewToggle } from '../trackers/topbar';
import MacrosTrackerPanel from '../trackers/macrosWeekly';
import ExerciseTrackerPanel2 from '../trackers/exerciseStatic';
import FoodTrackerPanel2 from '../trackers/macrosStatic';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, MapPin, Dumbbell, Bike, CalculatorIcon } from 'lucide-react';
import WeightTrackerPanel from '../trackers/weight';
import SleepTrackPanel from '../trackers/sleep';
import ImageGallery from '../trackers/gallery';
import { BiFoodMenu } from 'react-icons/bi';
import { TbNumber0 } from 'react-icons/tb';
import { GiOpenedFoodCan } from 'react-icons/gi';
import FoodTrackerPanelWeekly from '../trackers/macrosWeekly';
import ExerciseTrackerPanelWeekly from '../trackers/exerciseWeekly';
import WeeklySleepTrackPanel from '../trackers/sleepWeekly';
import WeeklyWeightTrackPanel from '../trackers/weightWeekly';
import DeficitPanelMonthly from './deficitMonthly';
import MacroPanelMonthly from '../trackers/macroMonthly';
import ExercisePanelMonthly from '../trackers/exerciseMonthly';
import WeightPanelMonthly from '../trackers/weightMonthly';
import SleepPanelMonthly from '../trackers/sleepMonthly';

// Define types
type ViewOption = 'today' | 'weekly' | 'monthly';
type Week = string;

interface DeficitData {
  dailyDeficit: number;
  weeklyDeficit: number;
}

type IconType = 'deficit' | 'macro' | 'exercise' | 'weigth' | 'imaging' |  'sleep';

const DeficitStats: React.FC = () => {
  // State
  const [viewOption, setViewOption] = useState<ViewOption>('today');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week>('');
  const [dailyDeficit, setDailyDeficit] = useState<number>(0);
  const [weeklyIntake, setWeeklyIntake] = useState<number>(0);
  const [activeIcon, setActiveIcon] = useState<IconType>('deficit');
  const [foodList, setFoodList] = useState([]);
  const [weeklyFoodList, setWeeklyFoodList] = useState([]);
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState<boolean>(true);
  const [errorWeekly, setErrorWeekly] = useState<Error | null>(null);

  const [deficitData, setDeficitData] = useState<any[]>([
    {
      name: 'Deficit',
      value: 500,
      color: 'cyan'
    },
    {
      name: 'Over-Intake',
      value: 0,
      color: 'red'
    },
  ]);

  const [weeklyDeficitData, setWeeklyDeficitData] = useState<any[]>([
    {
      name: 'Deficit',
      value: 500,
      color: 'cyan'
    },
    {
      name: 'Over-Intake',
      value: 0,
      color: 'red'
    },
  ]);

  const [calorieData, setCalorieData] = useState<any[]>([
    {
      name: 'Calories',
      value: 500,
    },
    {
      name: 'Over-Intake',
      value: 0,
    },
  ]);

  const [weeklyCalorieData, setWeeklyCalorieData] = useState<any[]>([
    {
      name: 'Calories',
      value: 500,
    },
    {
      name: 'Over-Intake',
      value: 0,
    },
  ]);

  // Constants
  const dailyTargetDeficit = 500;
  const weeklyTargetDeficit = 3500;
  const dailyTargetCal = 2000;
  const weeklyTarget = 500;

  // Fetch weeks for dropdown
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const res = await fetch('/api/weeks');
        const data = await res.json();
        setWeeks(data.weeks);
      } catch (err) {
        console.error('Error fetching weeks:', err);
      }
    };

    fetchWeeks();
  }, []);

  // Fetch daily deficit on load
  useEffect(() => {
    const fetchDailyDeficit = async () => {
      // Reset error states and set loading to true
      setIsLoading(true);
      setError(null);
      setIsLoadingWeekly(true);
      setErrorWeekly(null);
      
      try {
        const res = await fetch('/api/tracker');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Error fetching daily data');
        }
        
        setDailyDeficit(data.result.dailyDeficit);

        setDeficitData([
          {
            name: 'Deficit',
            value: data.result.deficit,
            color: 'cyan'
          },
          {
            name: 'Over-Intake',
            value: dailyTargetDeficit - data.result.deficit,
            color: 'red'
          },
        ]);

        setFoodList(data.result.foodList);

        setCalorieData([
          {
            name: 'Calories',
            value: data.result.calories,
            color: 'cyan'
          },
          {
            name: 'Avalible Intake',
            value: dailyTargetCal - data.result.calories,
            color:'green'
          },
          {
            name: 'Over Intake',
            value: -1 * (dailyTargetCal- data.result.calories),
            color: 'red'
          },
        ]);
        
        // Daily data loaded successfully
        setIsLoading(false);

        // Now fetch weekly data
        try {
          const res_2 = await fetch('/api/tracker/weekly/deficit');
          const weeklyData = await res_2.json();
          
          if (!res_2.ok) {
            throw new Error(weeklyData.message || 'Error fetching weekly data');
          }

          setWeeklyIntake(weeklyData.result.weeklyAverages.nutrition.totalCalories);

          setWeeklyCalorieData([
            {
              name: 'Calories',
              value: weeklyData.result.weeklyAverages.nutrition.totalCalories,
              color: 'green'
            },
            {
              name: 'Over-Intake',
              value: weeklyData.result.weeklyAverages.nutrition.totalCalories - 14000,
              color: 'red'
            },
            {
              name: 'Free Intake',
              value: 14000 - weeklyData.result.weeklyAverages.nutrition.totalCalories,
              color: 'cyan'
            },
          ]);
          
          setWeeklyDeficitData([
            {
              name: 'Deficit',
              value: weeklyData.result.weeklyAverages.nutrition.totalDeficit,
              color: 'cyan'
            },
            {
              name: 'End-Week-Goal',
              value: weeklyTargetDeficit - weeklyData.result.weeklyAverages.nutrition.totalDeficit,
              color: 'red'
            },
          ]);

          setWeeklyFoodList(weeklyData.result.dailyData);
          setIsLoadingWeekly(false);
        } catch (weeklyErr) {
          console.error('Error fetching weekly deficit:', weeklyErr);
          setErrorWeekly(weeklyErr instanceof Error ? weeklyErr : new Error('Unknown error with weekly data'));
          setIsLoadingWeekly(false);
        }
      } catch (err) {
        console.error('Error fetching daily deficit:', err);
        setError(err instanceof Error ? err : new Error('Unknown error with daily data'));
        setIsLoading(false);
      }
    };

    fetchDailyDeficit();
  }, []);

  // Add a refresh function that can be called from error states
  const refreshData = () => {
    setIsLoading(true);
    setIsLoadingWeekly(true);
    setError(null);
    setErrorWeekly(null);
    
    // Re-fetch data
    const fetchData = async () => {
      try {
        const res = await fetch('/api/tracker');
        // ... same fetch logic as above
        // This is simplified for brevity
      } catch (err) {
        console.error('Error refreshing data:', err);
        setError(err instanceof Error ? err : new Error('Failed to refresh data'));
      }
    };
    
    fetchData();
  };

  return (
    <div className="flex flex-col mx-auto px-0 py-4 rounded shadow-lg bg-gray-100 px-12 h-[100%] mt-[-30px] ">
      
      {/* Toggle View Options */}
      <ViewToggle 
        viewOption={viewOption}
        onChange={setViewOption}
      />

      {/* Bottom container with rounded bottom corners only */}
      <BottomContainer
        activeIcon={activeIcon}
        setActiveIcon={setActiveIcon}
      />

      { activeIcon == "deficit" && 
        viewOption == "today" ? (
            <DeficitPanelToday
                deficitData={deficitData}
                foodList={foodList}
                calorieData={calorieData}
                isLoading={isLoading}
                error={error}
            />
          ) : (viewOption == "weekly" && activeIcon == "deficit") ? (
            <DeficitPanelWeekly
              deficitData={weeklyDeficitData}
              weeklyFoodList={weeklyFoodList}
              calorieData={weeklyCalorieData}
              isLoading={isLoadingWeekly}
              error={errorWeekly}
            />
          ) : (viewOption == "monthly" && activeIcon == "deficit") && (
            <DeficitPanelMonthly />
          )
      }

      { activeIcon == "macro" &&
          viewOption == "today" ? (
            <FoodTrackerPanel2 />
          ) : (viewOption == "weekly" && activeIcon == "macro") ? (
              <FoodTrackerPanelWeekly />
          ) : (viewOption == "monthly" && activeIcon == "macro") && (
              <MacroPanelMonthly />
          )
      }

      { activeIcon == "exercise" &&
          viewOption == "today" ? (
            <ExerciseTrackerPanel2 />
          ) : (viewOption == "weekly" && activeIcon == "exercise") ? (
              <ExerciseTrackerPanelWeekly />
          ) : (viewOption == "monthly" && activeIcon == "exercise") && (
              <ExercisePanelMonthly />
          )
      }

      { activeIcon == "weigth" &&
          viewOption == "today" ? (
            <WeightTrackerPanel />
          ) : (viewOption == "weekly" && activeIcon == "weigth") ? (
              <WeeklyWeightTrackPanel />
          ) : (viewOption == "monthly" && activeIcon == "weigth") && (
              <WeightPanelMonthly />
          )
      }

      { activeIcon == "sleep" &&
          viewOption == "today" ? (
            <SleepTrackPanel />
          ) : (viewOption == "weekly" && activeIcon == "sleep") ? (
              <WeeklySleepTrackPanel />
          ) : (viewOption == "monthly" && activeIcon == "sleep") && (
              <SleepPanelMonthly />
          )
      }

      {activeIcon == "imaging" &&
        <ImageGallery />
      }

    </div>
  );
};

export default DeficitStats;


// Updated DeficitPanelToday with loading and error states
const DeficitPanelToday = ({ deficitData, calorieData, foodList, isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading today's data...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <p className="mt-1 text-sm text-red-700">{error.message || "An unexpected error occurred"}</p>
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

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">
      {/* Main widgets */}
      <div className='flex flex-col items-center justify-center w-full'>
        <div className="flex flex-row justify-around w-[100%] mt-5 mb-5">
          <Widget_new 
            title="Daily Deficit" 
            chartData={deficitData} 
            total={`${deficitData[0].value.toLocaleString()} calories`}
            icon={<Activity className="h-5 w-5 text-blue-600" />}
          />
          
          <Widget_new
            title="Today Intake" 
            chartData={calorieData} 
            total={`${calorieData[0].value} calories`}
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          />
        </div>
        
        <div className="mt-5 mb-5 w-[90%]">
          <ActivitySummary data={foodList} />
        </div>
      </div>
    </div>
  );
};

// Updated DeficitPanelWeekly with loading and error states
const DeficitPanelWeekly = ({ deficitData, calorieData, weeklyFoodList, isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading weekly data...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading weekly data</h3>
              <p className="mt-1 text-sm text-red-700">{error.message || "An unexpected error occurred"}</p>
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

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">
      {/* Main widgets */}
      <div className='flex flex-col items-center justify-center w-full'>
        <div className="flex flex-row justify-around w-[100%] mt-5 mb-5">
          <Widget_new 
            title="Weekly Deficit" 
            chartData={deficitData} 
            total={`${deficitData[0].value.toLocaleString()} calories`}
            icon={<Activity className="h-5 w-5 text-blue-600" />}
          />
          
          <Widget_new
            title="Weekly Intake" 
            chartData={calorieData} 
            total={`${calorieData[0].value} calories`}
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          />
        </div>
        
        <div className="mt-5 mb-5 w-[90%]">
          <ActivitySummaryWeekly data={weeklyFoodList} />
        </div>
      </div>
    </div>
  );
};



const ActivitySummary = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Intake Summary</h2>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: item.bgColor }}>
                {item.icon}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-left">{item.name}</p>
                {item.servingSize != null && <p className="text-xs text-gray-500 mt-3 text-left"> <span className='font-bold'>{item.servingSize}{item.servingUnit}</span> • Protein: {item.protein}g • Fats: {item.fats}g • Carbs: {item.carbs}g </p>}
              </div>
            </div>
            <div className="flex items-center">
              <p className="font-semibold">{item.calories} cal</p>
              <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

const EnhancedPieChart = ({ data }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Only display data items with positive values
  const filteredData = data.filter(item => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {filteredData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || COLORS[index % COLORS.length]} 
            />
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

const Widget_new = ({ title, chartData, total, icon }) => {
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
