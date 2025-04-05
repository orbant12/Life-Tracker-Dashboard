import AssessmentIcon from '@mui/icons-material/Assessment';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import HotelIcon from '@mui/icons-material/Hotel';
import ExerciseTrackerPanel from '../trackers/exercise';
import MacrosTrackerPanel from '../trackers/macros';
import NoFoodIcon from '@mui/icons-material/NoFood';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import React, { useEffect, useState } from 'react';


// Define types
type IconType = 'deficit' | 'macro' | 'exercise' | 'weigth' | 'imaging'  | 'sleep';

interface IconOption {
  id: IconType;
  component: React.ElementType;
  label: string;
}

export const BottomContainer = ({activeIcon, setActiveIcon}) => {
  
  // Icon options
  const iconOptions: IconOption[] = [
    { id: 'deficit', component: NoFoodIcon, label: 'Deficit' },
    { id: 'macro', component: MenuBookIcon, label: 'Macros' },
    { id: 'exercise', component: DirectionsRunIcon, label: 'Exercise' },
    { id: 'weigth', component: AssessmentIcon, label: 'Weight' },
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

type ViewOption = 'today' | 'weekly' | 'both';

interface ViewToggleProps {
  viewOption: ViewOption;
  onChange: (option: ViewOption) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewOption, onChange }) => {
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

