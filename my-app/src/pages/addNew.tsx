
import React, { useState, useEffect, useRef } from 'react';

// Define types
type ViewOption = 'food' | 'weight' | 'exercise' | 'sleep';
type Week = string;

interface DeficitData {
  dailyDeficit: number;
  weeklyDeficit: number;
}

const LogNew = () => {
  // State
  
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


const FoodPanel = ({
    
}) => {
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

    const [modalToggle, setModalToggle] = useState(false); 
    const [activeIcon, setActiveIcon] = useState<IconType>('meets');   

    const handleLogAmmount = (data) => {
        setModalToggle(!modalToggle)
    }

    return(
        <>
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
          </>
    )
}


import { TrendingUp, TrendingDown, Scale, Target, ArrowRight, Zap } from 'lucide-react';
import ExercisePanel from '../components/exercisePanel';
import SleepPanel from '../components/sleepPanel';

const WeightPanel = () => {
  const [weight, setWeight] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isPoop, setIsPoop] = useState(false)
  const [isBloated, setIsBloated] = useState(false)
  const [isWatery, setIsWatery] = useState(false)
  const [isBadSleep, setIsBadSleep] = useState(false)
  
  const feelings = [
    { emoji: '💩', label: 'Poop', color: 'bg-amber-50 border-amber-200' },
    { emoji: '💨', label: 'Bloated', color: 'bg-red-50 border-gray-200' },
    { emoji: '🌊', label: 'Watery', color: 'bg-blue-50 border-blue-200' },
    { emoji: '😴', label: 'Bad Sleep', color: 'bg-purple-50 border-purple-200' }
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (weight !== null) {
      setSubmitted(true);

      fetch('/api/weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight: parseFloat(weight),
          bloated: isBloated,
          poop:isPoop,
          watery: isWatery,
          isBadSleep: isBadSleep
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Weight saved successfully:', data);
      })
      .catch(error => {
        console.error('Error saving weight:', error);
      })
      .finally(() => {
        setTimeout(() => {
          setSubmitted(false);
          setWeight('');
          
        }, 3000);
      });
    }
  };
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleToggle = (name) => {
    if(name == "Poop"){
        setIsPoop(!isPoop)
    } else if (name == "Bad Sleep"){
        setIsBadSleep(!isBadSleep)
    } else if (name == "Watery"){
        setIsWatery(!isWatery)
    } else if (name == "Bloated"){
        setIsBloated(!isBloated)
    }
  }

  return (
    <div className="w-full bg-white to-indigo-50 p-6 rounded-xl shadow-lg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800"></h1>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
            <Scale size={18} className="text-indigo-600" />
            <span className="font-semibold text-gray-700">{today}</span>
          </div>
        </div>
        
        {/* Feelings Icons */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {feelings.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                item.label == "Poop" && setIsPoop(true)
                item.label == "Bloated" && setIsBloated(true)
                item.label == "Watery" && setIsWatery(true)
                item.label == "Bad Sleep" && setIsBadSleep(true)
                handleToggle(item.label)
            }}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                item.label === "Poop" && isPoop || item.label === "Bad Sleep" && isBadSleep || item.label === "Bloated" && isBloated || item.label === "Watery" && isWatery
                  ? 'border-indigo-500 shadow-md transform scale-105' 
                  : `border-gray-200 ${item.color}`
              }`}
            >
              <span className="text-4xl mb-2">{item.emoji}</span>
              <span className="font-medium text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
        
        {/* Weight Input */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="flex flex-col">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your weight"
                className="w-full p-4 text-2xl font-bold text-center text-indigo-600 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                kg
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            
            <div
              className={`flex w-[100%] items-center space-x-2 py-3 px-6 rounded-lg font-semibold text-white ${
                weight === ''
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              onClick={handleSubmit}
            >
              <span className='text-center' >Log Weight</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </form>
        
        {/* Confirmation Message */}
        {submitted && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg animate-pulse">
            <div className="flex items-center">
              <Zap size={24} className="text-green-500 mr-3" />
              <p className="text-green-700">
                Weight logged successfully! Keep up the great work.
              </p>
            </div>
          </div>
        )}
        
        {/* Progress Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown size={18} className="text-green-500" />
                <span className="font-medium text-gray-700">Weekly Change</span>
              </div>
              <span className="text-lg font-bold text-green-500">-1 kg</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target size={18} className="text-indigo-500" />
                <span className="font-medium text-gray-700">Goal Distance</span>
              </div>
              <span className="text-lg font-bold text-indigo-500">72 kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




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

