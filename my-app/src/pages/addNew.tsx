
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

const LogNew = () => {
  // State
  
    const [modalToggle, setModalToggle] = useState(false);    
    
    const [activeIcon, setActiveIcon] = useState<IconType>('meets');
  
    const meetsData = [
        {
        amount: '1',
        food: '🍳 Egg',
        calories: 70,
        protein: 6,
        fats: 5,
        carbs: 1
        },
        {
        amount: '100g',
        food: '🥩 Lean Steak',
        calories: 210,
        protein: 30,
        fats: 9,
        carbs: 0
        },
        {
        amount: '100g',
        food: '🐠 Salmon',
        calories: 206,
        protein: 22,
        fats: 12,
        carbs: 0
        },
        {
        amount: '100g',
        food: '🐔 Chicken Breast',
        calories: 165,
        protein: 31,
        fats: 4,
        carbs: 0
        },
        {
        amount: '100g',
        food: '🐟 Tuna',
        calories: 130,
        protein: 29,
        fats: 1,
        carbs: 0
        },
        {
        amount: '100g',
        food: '🥩 Fatty Steak',
        calories: 165,
        protein: 23,
        fats: 8,
        carbs: 0
        }
    ];

    const veggiesData = [
        {
        amount: '100g ',
        food: '🥦 Broccoli',
        calories: 35,
        carbs: 7,
        protein: 2,
        fats: 0
        },
        {
        amount: '100g',
        food: '🥬 Green Leaf',
        calories: 15,
        carbs: 3,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🥬 Spinach',
        calories: 23,
        carbs: 4,
        protein: 3,
        fats: 0
        },
        {
        amount: '100g',
        food: '❤️ Beetroot',
        calories: 43,
        carbs: 10,
        protein: 2,
        fats: 0
        },
        {
        amount: '100g',
        food: '🍅 Cherry Tomatoes',
        calories: 18,
        carbs: 4,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🍅 Tomatoes',
        calories: 18,
        carbs: 4,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🥒 Cucumber',
        calories: 15,
        carbs: 4,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🧅 Onions',
        calories: 40,
        carbs: 9,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🥒 Pickle',
        calories: 46,
        carbs: 10,
        protein: 0,
        fats: 0
        }
    ];

    const fruitsData = [
        {
        amount: '100g',
        food: '🫐 Blueberries',
        calories: 57,
        carbs: 14,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🍓 Rasberries',
        calories: 52,
        carbs: 12,
        protein: 1,
        fats: 1
        },
        {
        amount: '100g',
        food: '🍓 Strawberries',
        calories: 32,
        carbs: 8,
        protein: 1,
        fats: 0
        },
        {
        amount: '1',
        food: '🍏 Apple',
        calories: 100,
        carbs: 25,
        protein: 1,
        fats: 0
        },
        {
        amount: '1',
        food: '🍌 Banana',
        calories: 100,
        carbs: 27,
        protein: 1,
        fats: 0
        },
        {
        amount: '1',
        food: '🍐 Pear',
        calories: 101,
        carbs: 27,
        protein: 1,
        fats: 0
        }
    ];

    const handleLogAmmount = (data) => {
        setModalToggle(!modalToggle)
    }

  return (
    // make it to be on the top of the page
    <div className="flex flex-col mx-auto px-0 py-4 rounded shadow-lg bg-gray-100 px-12 h-[100%] mt-[-30px] ">
      
      {/* Toggle View Options */}

      {/* Bottom container with rounded bottom corners only */}
      <BottomContainer 
        activeIcon={activeIcon}
        setActiveIcon={setActiveIcon}
      />

      { activeIcon == "meets" &&
        <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
  
              <FoodList 
                foodData={meetsData}
                handleLogAmmount={handleLogAmmount}
                setModalToggle={setModalToggle}
                modalToggle={modalToggle}
              />

        </div>      
      }

    { activeIcon == "veggies" &&
        <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
  
              <FoodList 
                foodData={veggiesData}
                handleLogAmmount={handleLogAmmount}
                modalToggle={modalToggle}
                setModalToggle={setModalToggle}
              />

        </div>      
      }

    { activeIcon == "fruits" &&
        <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
  
              <FoodList 
                foodData={fruitsData}
                handleLogAmmount={handleLogAmmount}
                modalToggle={modalToggle}
                setModalToggle={setModalToggle}
              />

        </div>      
      }

    </div>
  );
};

export default LogNew;

const FoodList = ({ foodData, handleLogAmmount, modalToggle,setModalToggle }) => {
    // Sample data if none is provided
  
    return (
      <div className="w-full overflow-hidden border-2 border-gray-200 rounded-lg overflow-y-scroll">
        {/* Table Header */}
        <div className="bg-gray-50">
          <div className="grid grid-cols-7 border-b-2 border-gray-200">
            <div className="p-4 font-semibold">Amount</div>
            <div className="p-4 font-semibold">Food</div>
            <div className="p-4 font-semibold">Calories</div>
            <div className="p-4 font-semibold">Protein</div>
            <div className="p-4 font-semibold">Fats</div>
            <div className="p-4 font-semibold">Carbs</div>
            <div className="p-4 font-semibold"></div>
          </div>
        </div>
        
        {/* Table Body */}
        <BasicModal handleLogAmmount={handleLogAmmount} foodData={foodData} />

      </div>
    );
  };
  

import { LuMilk } from "react-icons/lu";
import { GiTomato } from "react-icons/gi";
import { TbAppleFilled } from "react-icons/tb";
import { GiMeatCleaver } from "react-icons/gi";
import { BiSolidBowlRice } from "react-icons/bi";
import { GiChocolateBar } from "react-icons/gi";
import BasicModal from '../components/modal';

// Define types
type IconType = 'meets' | 'fruits' | 'veggies' | 'dairy' | 'carbs' | 'treats';

interface IconOption {
  id: IconType;
  component: React.ElementType;
  label: string;
}

const BottomContainer = ({activeIcon, setActiveIcon}) => {
  
  // Icon options
  const iconOptions: IconOption[] = [
    { id: 'meets', component: GiMeatCleaver, label: 'Meets' },
    { id: 'fruits', component: TbAppleFilled, label: 'Fruits' },
    { id: 'veggies', component: GiTomato, label: 'Veggies' },
    { id: 'dairy', component: LuMilk, label: 'Dairy' },
    { id: 'carbs', component: BiSolidBowlRice, label: 'Carbs' },
    { id: 'treats', component: GiChocolateBar, label: 'Treats' },
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
                marginLeft: 3,
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

