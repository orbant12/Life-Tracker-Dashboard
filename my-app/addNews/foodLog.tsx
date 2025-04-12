import React, { useState } from 'react';

import { LuMilk } from "react-icons/lu";
import { GiTomato } from "react-icons/gi";
import { TbAppleFilled } from "react-icons/tb";
import { GiMeatCleaver } from "react-icons/gi";
import { BiSolidBowlRice } from "react-icons/bi";
import { GiChocolateBar } from "react-icons/gi";
import BasicModal  from '../src/components/modal';
import { getFoodData } from './foodsList';
import { LucideComputer, WorkflowIcon } from 'lucide-react';

type IconType = 'meets' | 'fruits' | 'veggies' | 'dairy' | 'carbs' | 'treats' | 'work';

interface IconOption {
    id: IconType;
    component: React.ElementType;
    label: string;
  }

export const FoodList = ({ foodData, handleLogAmmount, modalToggle,setModalToggle,selectedData }) => {
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
        <BasicModal selectedData={selectedData} handleLogAmmount={handleLogAmmount} foodData={foodData} />

      </div>
    );
  };



export const FoodPanel = ({
  selectedData
  }) => {
      
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
                      foodData={getFoodData("meetsData")}
                      handleLogAmmount={handleLogAmmount}
                      setModalToggle={setModalToggle}
                      modalToggle={modalToggle}
                      selectedData={selectedData}
                    />
      
              </div>      
            }
      
          { activeIcon == "veggies" &&
              <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
        
                    <FoodList 
                      foodData={getFoodData("veggiesData")}
                      handleLogAmmount={handleLogAmmount}
                      modalToggle={modalToggle}
                      setModalToggle={setModalToggle}
                      selectedData={selectedData}
                    />
      
              </div>      
            }
      
          { activeIcon == "fruits" &&
              <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
        
                    <FoodList 
                      foodData={getFoodData("fruitsData")}
                      handleLogAmmount={handleLogAmmount}
                      modalToggle={modalToggle}
                      setModalToggle={setModalToggle}
                      selectedData={selectedData}
                    />
      
              </div>      
            }

          { activeIcon == "dairy" &&
              <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
        
                    <FoodList 
                      foodData={getFoodData("dairyData")}
                      handleLogAmmount={handleLogAmmount}
                      modalToggle={modalToggle}
                      setModalToggle={setModalToggle}
                      selectedData={selectedData}
                    />
      
              </div>      
            }

            { activeIcon == "treats" &&
              <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
        
                    <FoodList 
                      foodData={getFoodData("snacksData")}
                      handleLogAmmount={handleLogAmmount}
                      modalToggle={modalToggle}
                      setModalToggle={setModalToggle}
                      selectedData={selectedData}
                    />
      
              </div>      
            }

        { activeIcon == "carbs" &&
              <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
        
                    <FoodList 
                      foodData={getFoodData("carbsData")}
                      handleLogAmmount={handleLogAmmount}
                      modalToggle={modalToggle}
                      setModalToggle={setModalToggle}
                      selectedData={selectedData}
                    />
      
              </div>      
            }

          { activeIcon == "work" &&
              <div className='flex flex-col items-center w-[100%] overflow-y-scroll bg-white rounded-lg h-[77%]'>
        
                    <FoodList 
                      foodData={getFoodData("workFood")}
                      handleLogAmmount={handleLogAmmount}
                      modalToggle={modalToggle}
                      setModalToggle={setModalToggle}
                      selectedData={selectedData}
                    />
      
              </div>      
            }
            </>
      )
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
      { id: 'work', component: LucideComputer, label: 'Work' },
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