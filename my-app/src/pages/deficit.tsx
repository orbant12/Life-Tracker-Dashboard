import React, { useState, useEffect, useRef } from 'react';
import BasicPie from '../components/pie';
import { BottomContainer, ViewToggle } from '../trackers/topbar';
import MacrosTrackerPanel from '../trackers/macros';
import ExerciseTrackerPanel from '../trackers/exercise';
import ExerciseTrackerPanel2 from '../trackers/exerciseStatic';
import FoodTrackerPanel2 from '../trackers/macrosStatic';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Clock, MapPin, Dumbbell, Bike } from 'lucide-react';
import WeightTrackerPanel from '../trackers/weight';
import SleepTrackPanel from '../trackers/sleep';
import ImageGallery from '../trackers/gallery';

// Define types
type ViewOption = 'today' | 'weekly' | 'both';
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
  const [weeklyDeficit, setWeeklyDeficit] = useState<number>(0);
  const [activeIcon, setActiveIcon] = useState<IconType>('deficit');
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


  // Constants
  const dailyTargetDeficit = 500;
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
      try {
        const res = await fetch('/api/tracker');
        const data = await res.json();
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
      

      } catch (err) {
        console.error('Error fetching daily deficit:', err);
      }
    };

    
    fetchDailyDeficit();
  }, []);

  // Fetch weekly deficit when a week is selected
  useEffect(() => {
    if (!selectedWeek) {
      setWeeklyDeficit(0);
      return;
    }

    const fetchWeeklyDeficit = async () => {
      try {
        const res = await fetch(`/api/deficits?week=${encodeURIComponent(selectedWeek)}`);
        const data = await res.json();
        setWeeklyDeficit(data.weeklyDeficit);
      } catch (err) {
        console.error('Error fetching weekly deficit:', err);
      }
    };

    fetchWeeklyDeficit();
  }, [selectedWeek]);

  return (
    // make it to be on the top of the page
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
          <ActivitySummary data={[]} />
        </div>
      </div>
    </div>
      }

      { activeIcon == "macro" &&
          <FoodTrackerPanel2 />
      }

      { activeIcon == "exercise" &&
          <ExerciseTrackerPanel2 />
      }

      { activeIcon == "weigth" &&
          <WeightTrackerPanel />
      }

      {activeIcon == "sleep" &&
        <SleepTrackPanel />
      }

      {activeIcon == "imaging" &&
        <ImageGallery />
      }

    </div>
  );
};

export default DeficitStats;


const Widget = ({ dailyDeficit, title, notionData}) => {

    return(
        <div className="flex justify-center opacity-100">        
          <div className="md:w-1/2 m-5 min-w-[500px] w-full min-h-[500px]">
            <div className="bg-gray-100 rounded-lg shadow-md p-6 border-2 border-gray-300 ">
              <h2 className="text-[30px] font-[800] mb-4 p-0 opacity-100">{title}</h2>
              <div className="chart-container mb-4 p-4 rounded-lg flex flex-col justify-center items-middle
                bg-gradient-to-b from-gray-900 to-gray-100
                shadow-xl
                relative overflow-hidden
                border border-gray-400 h-[80%] " >
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-10 pointer-events-none"></div>
                {/* Highlight effect at the top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-30"></div>
                {/* Main content */}
                <BasicPie chartData={notionData} />
              </div>
              <p className="text-center text-gray-700 font-semi opacity-50 text-[25px]">
                Total: <span className="text-center text-gray-700 font-bold opacity-90 text-[25px]">{dailyDeficit}</span>
              </p>
            </div>
          </div>
        
      </div>
    )
}

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
        ))}
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
