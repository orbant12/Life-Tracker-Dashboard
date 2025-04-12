
import React, { useEffect, useState } from 'react';
import ExercisePanel from '../../addNews/exerciseLog';
import SleepPanel from '../../addNews/sleepLog';
import { FoodPanel } from '../../addNews/foodLog';
import { WeightPanel } from '../../addNews/weightLog';


// Define types
type ViewOption = 'food' | 'weight' | 'exercise' | 'sleep';


const LogNew = () => {
  
    const [viewOption, setViewOption] = useState<ViewOption>('food');
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() =>{
      const today = new Date();
      const year = today.getFullYear();
      // Add 1 to month since getMonth() is 0-indexed
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`)
    },[])
   
return (
// make it to be on the top of the page
    <div className="flex flex-col mx-auto px-0 py-4 rounded shadow-lg bg-gray-100 px-12 h-[100%] mt-[-30px] ">
      
        {/* Toggle View Options */}
        <ViewToggle 
          viewOption={viewOption}
          onChange={setViewOption}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        

        { viewOption == 'food' &&
            <FoodPanel 
                selectedData={selectedDate}
            />
        }

        { viewOption == 'weight' &&
            <WeightPanel selectedDate={selectedDate} />
        }

        { viewOption == 'exercise' &&
            <ExercisePanel selectedDate={selectedDate} />
        }

        { viewOption == 'sleep' &&
            <SleepPanel selectedDate={selectedDate} />
        }


    </div>
  );
};

export default LogNew;

  

interface ViewToggleProps {
  viewOption: ViewOption;
  onChange: (option: ViewOption) => void;
  selectedDate: any;
  setSelectedDate: any;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewOption, onChange, selectedDate, setSelectedDate }) => {
  // Options for the toggle
  const options: { value: ViewOption; label: string }[] = [
    { value: 'food', label: 'Food' },
    { value: 'weight', label: 'Weight' },
    { value: 'exercise', label: 'Movement' },
    { value: 'sleep', label: 'Sleep' }
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
          className="absolute opacity-0 w-0 h-0" // Hide the actual radio div
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
  <div className="flex items-center space-x-2">
    <div className="relative">
      <input 
        type="date" 
        className="h-10 pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        onChange={(e) => {
          setSelectedDate(e.target.value);
        }}
        value={selectedDate}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  </div>
</div>
  );
};

