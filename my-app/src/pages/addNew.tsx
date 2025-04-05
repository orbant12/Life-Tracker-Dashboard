
import React, { useState } from 'react';
import ExercisePanel from '../../addNews/exerciseLog';
import SleepPanel from '../../addNews/sleepLog';
import { FoodPanel } from '../../addNews/foodLog';
import { WeightPanel } from '../../addNews/weightLog';


// Define types
type ViewOption = 'food' | 'weight' | 'exercise' | 'sleep';


const LogNew = () => {
  
    const [viewOption, setViewOption] = useState<ViewOption>('food');
   
return (
// make it to be on the top of the page
    <div className="flex flex-col mx-auto px-0 py-4 rounded shadow-lg bg-gray-100 px-12 h-[100%] mt-[-30px] ">
      
        {/* Toggle View Options */}
        <ViewToggle 
        viewOption={viewOption}
        onChange={setViewOption}
        />
        

        { viewOption == 'food' &&
            <FoodPanel />
        }

        { viewOption == 'weight' &&
            <WeightPanel />
        }

        { viewOption == 'exercise' &&
            <ExercisePanel />
        }

        { viewOption == 'sleep' &&
            <SleepPanel />
        }


    </div>
  );
};

export default LogNew;

  

interface ViewToggleProps {
  viewOption: ViewOption;
  onChange: (option: ViewOption) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewOption, onChange }) => {
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

