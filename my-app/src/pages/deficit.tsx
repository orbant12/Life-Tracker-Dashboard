import React, { useState, useEffect, useRef } from 'react';
import BasicPie from '../components/pie';
import NoFoodIcon from '@mui/icons-material/NoFood';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// Define types
type ViewOption = 'today' | 'weekly' | 'both';
type Week = string;

interface DeficitData {
  dailyDeficit: number;
  weeklyDeficit: number;
}

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
      label: 'Deficit',
      value: 500,
      color: 'cyan'
    },
    {
      label: 'Over-Intake',
      value: 0,
      color: 'red'
    },
  ]);

  const [calorieData, setCalorieData] = useState<any[]>([
    {
      label: 'Calories',
      value: 500,
    },
    {
      label: 'Over-Intake',
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
        const res = await fetch('/api/deficits');
        const data = await res.json();
        setDailyDeficit(data.dailyDeficit);
        setDeficitData([
          {
            label: 'Deficit',
            value: data.dailyDeficit,
            color: 'cyan'
          },
          {
            label: 'Over-Intake',
            value: dailyTargetDeficit - data.dailyDeficit,
            color: 'red'
          },
        ]);
        console.log('Daily Deficit:', data.dailyDeficit);
      } catch (err) {
        console.error('Error fetching daily deficit:', err);
      }
    };

    const fetchCalorieData = async () => {
      try {
        const res = await fetch('/api/calories');
        const data = await res.json();
        setCalorieData([
          {
            label: 'Calories',
            value: data.dailyCal,
            color: 'cyan'
          },
          {
            label: 'Avalible Intake',
            value: dailyTargetCal - data.dailyCal,
            color:'green'
          },
          {
            label: 'Over Intake',
            value: -1 * (dailyTargetCal- data.dailyCal),
            color: 'red'
          },
        ]);
        console.log('Calorie Data:', data.calories);
      } catch (err) {
        console.error('Error fetching calorie data:', err);
      }
    };

    fetchCalorieData();
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
        <div className='flex flex-wrap items-center justify-evenly w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
              <Widget 
                  dailyDeficit={deficitData[0].value}
                  title={"Daily Deficit"}
                  notionData={deficitData}
              />

              <Widget 
                  dailyDeficit={calorieData[0].value}
                  title={"Today Intake"}
                  notionData={calorieData}
              />
        </div>      
      }

      { activeIcon == "macro" &&
        <div className='flex flex-wrap items-center justify-evenly w-[100%] self-center overflow-y-scroll bg-white rounded-lg'>
              <Widget 
                  dailyDeficit={deficitData[0].value}
                  title={"Overall Macros"}
                  notionData={deficitData}
              />

              <Widget 
                  dailyDeficit={deficitData[0].value}
                  title={"Protein"}
                  notionData={deficitData}
              />

              <Widget 
                  dailyDeficit={calorieData[0].value}
                  title={"Carbs"}
                  notionData={calorieData}
              />

              <Widget 
                  dailyDeficit={calorieData[0].value}
                  title={"Fats"}
                  notionData={calorieData}
              />
        </div>      
      }

      { activeIcon == "exercise" &&
        <div className='flex flex-wrap items-center justify-evenly w-[100%] self-center overflow-y-scroll bg-white rounded-lg'>
              <Widget 
                  dailyDeficit={deficitData[0].value}
                  title={"Steps Count"}
                  notionData={deficitData}
              />

              <Widget 
                  dailyDeficit={calorieData[0].value}
                  title={"Calorie Burn From Movement"}
                  notionData={calorieData}
              />

              <Widget_2
                //Exercise Minute
                //Exercise Type
                //State
                  dailyDeficit={deficitData[0].value}
                  title={"Exercise Stats"}
                  notionData={deficitData}
              />

        </div>      
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

const Widget_2 = ({ dailyDeficit, title, notionData}) => {

  return(
      <div className="flex justify-center opacity-100 w-full">        
        <div className="md:w-1/2 m-5 min-w-[80%] w-full min-h-[500px]">
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



import AssessmentIcon from '@mui/icons-material/Assessment';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import HotelIcon from '@mui/icons-material/Hotel';

// Define types
type IconType = 'deficit' | 'macro' | 'exercise' | 'weigth' | 'imaging' | 'mood' | 'sleep';

interface IconOption {
  id: IconType;
  component: React.ElementType;
  label: string;
}

const BottomContainer = ({activeIcon, setActiveIcon}) => {
  
  // Icon options
  const iconOptions: IconOption[] = [
    { id: 'deficit', component: NoFoodIcon, label: 'Deficit' },
    { id: 'macro', component: MenuBookIcon, label: 'Macros' },
    { id: 'exercise', component: DirectionsRunIcon, label: 'Exercise' },
    { id: 'weigth', component: AssessmentIcon, label: 'Weight' },
    { id: 'mood', component: AddReactionIcon, label: 'Mood' },
    { id: 'sleep', component: HotelIcon, label: 'Sleep' },
    { id: 'imaging', component: PermMediaIcon, label: '' },
  ];

  // Handle icon click
  const handleIconClick = (iconId: IconType) => {
    setActiveIcon(iconId);
    // Here you could add additional logic like fetching data based on selected icon
  };

  return (
    <div className="flex justify-center items-center space-x-8 mb-3 bg-white p-4 rounded-b-lg opacity-90 border border-gray-200 border-t-1 shadow-md">
      {iconOptions.map((icon, index) => (
        <React.Fragment key={icon.id}>
          {index > 0 && <div className="h-8 border-r border-gray-300" />}
          <div 
            className={`
              cursor-pointer 
              transition-all duration-300 ease-in-out
              p-2 rounded-lg
              ${activeIcon === icon.id 
                ? 'bg-blue-50 scale-110 shadow-sm' 
                : 'hover:bg-gray-50 hover:scale-105'
              }
            `}
            onClick={() => handleIconClick(icon.id)}
          >
            <icon.component 
              style={{
                opacity: activeIcon === icon.id ? 1 : 0.6,
                color: activeIcon === icon.id ? '#3b82f6' : '#6b7280',
                transition: 'all 0.2s ease',
                fontSize: 23
              }}
              className="hover:opacity-90"
            />
            <span className={`
              block text-xs mt-1 text-center
              ${activeIcon === icon.id 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-500'
              }
            `}>
              {icon.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};


interface ViewToggleProps {
  viewOption: ViewOption;
  onChange: (option: ViewOption) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewOption, onChange }) => {
  // Options for the toggle
  const options: { value: ViewOption; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'both', label: 'Both' }
  ];

  // Handle option change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as ViewOption);
  };

  return (
    <div className="flex flex-row justify-between bg-white p-4 rounded-t-lg opacity-90 border border-gray-200 border-b-0 shadow-sm">
      <div className="inline-flex p-2 rounded-full bg-gray-100">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              relative inline-flex items-center justify-center px-9 py-2 cursor-pointer
              transition-all duration-200 ease-in-out
              rounded-full mx-1
              ${viewOption === option.value
                ? 'bg-white shadow-sm text-blue-600 font-[700]'
                : 'text-gray-600 hover:bg-gray-50 font-[500]'
              }
            `}
          >
            <input
              type="radio"
              name="viewOption"
              value={option.value}
              checked={viewOption === option.value}
              onChange={handleChange}
              className="absolute opacity-0 w-0 h-0" // Hide the actual radio button
            />
            <span className="flex items-center text-[13px]">
              {viewOption === option.value && (
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              )}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

