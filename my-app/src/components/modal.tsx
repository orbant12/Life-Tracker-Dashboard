import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useScatterChartProps } from '@mui/x-charts/internals';
import { getBox, getSaladBox } from './boxCondition';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '5px solid gray',
  borderRadius: 3,
  boxShadow: 24,
  p: 0,
};

export default function BasicModal({foodData, handleLogAmmount}) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(0)
  const [nameTitle, setNameTitle] = React.useState(0)
  const [cal, setCal] = React.useState(0)
  const [protein, setProtein] = React.useState(0)
  const [fats, setFats] = React.useState(0)
  const [carbs, setCarbs] = React.useState(0)
  const [addedCal, setAddedCal] = React.useState(0)
  const [addedFats, setAddedFats] = React.useState(0)
  const [addedProtein, setAddedProtein] = React.useState(0)
  const [addedCarbs, setAddedCarbs] = React.useState(0)
  const [isPiece, setIsPiece] = React.useState<boolean | null>(false)
  const [isLoading, setIsLoading] = React.useState(false); // New loading state

  const handleOpen = (item) => {
    setOpen(true)
    setNameTitle(item.food)
    setCal(item.calories)
    setAmount(item.amount)
    setProtein(item.protein)
    setCarbs(item.carbs)
    setFats(item.fats)
  }
  const handleClose = () => setOpen(false);

  const handleAddNew = async () => {
    setIsLoading(true); // Start loading state
    
    try {
      const serving = isPiece ? "piece" : "g"

      const response = await fetch('/api/foods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nameTitle,
            calories: addedCal,
            protein: addedProtein,
            carbs: addedCarbs,
            fats: addedFats,
            servingSize: amount,
            servingUnit: serving
          }),
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save nutrition data');
      }
      
      // Success - close modal
      handleClose();
    } catch (error) {
      console.error('Error saving food:', error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false); // End loading regardless of outcome
    }
  }

  interface Box {
    title: string;
    multiplier: any;
    isPiece: boolean;
  }

  const [currBox, setCurrBox] = React.useState<Box[]>([{title:"2 Eggs",multiplier:2,isPiece:true},{title:"3 Eggs",multiplier:3,isPiece:true},{title:"4 Eggs",multiplier:4,isPiece:true}])
  const [activeCal, setActiveCal] = React.useState(0)
  const handleBoxes = (item) => {
    setAddedCal(0)
    setAddedCarbs(0)
    setAddedFats(0)
    setAddedProtein(0)
    //If item.food incule 🥗
    if(item.food.includes("🥗")) {
      const response: any = getSaladBox(item.food);
      setIsPiece(null)
      setCurrBox(response.options)
      return
    }else{
      const response: any = getBox(item.food);
      setIsPiece(response.isPiece)
      setCurrBox(response.options)
    }
  }

  return (
    <div>
        <div>
          {foodData.map((item, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-7 items-center ${
                index < foodData.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <div className="p-4 font-medium">{item.amount}</div>
              <div className="p-4 text-start">{item.food}</div>
              <div className="p-4">{item.calories}</div>
              <div className="p-4">{item.protein}</div>
              <div className="p-4">{item.fats}</div>
              <div className="p-4">{item.carbs}</div>
              <div className="p-4">
              
                <div onClick={() => {handleOpen(item),handleBoxes(item)}}
                className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg 
                            shadow-inset hover:from-blue-600 hover:to-purple-600 hover:opacity-100 opacity-70 hover:shadow-lg hover:-translate-y-1
                            cursor-pointer transition-all duration-200 ease-in-out"
                >
                    + Add
                </div>
            
              </div>
            </div>
          ))}
        </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
            <div className='flex border-2 border-gray-500 justify-center font-[700] w-[100%] p-5 rounded-t-lg bg-gray-200'>
                {nameTitle} - {cal} cal / {amount}
            </div>
          <Typography id="modal-modal-description" sx={{ mt: 2, alignItems:"center", justifyContent:"center" }}>
            <div className='flex flex-row w-full justify-evenly items-center m-5'>
                <div className='flex flex-col  items-center '>
                    <h2 className='font-[500] text-xl opacity-50 text-center'>Calories</h2>
                    <span className='font-[700] text-xl text-center'>{addedCal}</span>
                </div>
                <div className='flex flex-col justify-center items-center '>
                    <h2 className='font-[500] text-xl opacity-50 text-center'>Protein</h2>
                    <span className='font-[700] text-xl text-center'>{addedProtein}</span>
                </div>
                <div className='flex flex-col justify-center items-center '>
                    <h2 className='font-[500] text-xl opacity-50 text-center'>Fats</h2>
                    <span className='font-[700] text-xl text-center'>{addedFats}</span>
                </div>
                <div className='flex flex-col justify-center items-center '>
                    <h2 className='font-[500] text-xl opacity-50 text-center'>Carbs</h2>
                    <span className='font-[700] text-xl text-center'>{addedCarbs}</span>
                </div>
            </div>  
            {isPiece != null ? (
            <SelectAble 
                boxes={currBox}
                handlePress={(n) => {
                    setActiveCal(n * cal);
                    setAddedCal(Math.round(n * cal));
                    setAddedCarbs(Math.round(n * carbs));
                    setAddedFats(Math.round(n * fats));
                    setAddedProtein(Math.round(n * protein));
                }}
                active={activeCal}
                cal={cal}
            
            /> ) : (
              <SelectAbleSalad 
                boxes={currBox}
                handlePress={(n) => {
                    setActiveCal(n.calories);
                    setAddedCal(n.calories);
                    setAddedCarbs(n.carbs);
                    setAddedFats(n.fats);
                    setAddedProtein(n.protein);
                }}
                active={activeCal}
                cal={cal}
              />
            )
              }
            { isPiece != null && <h2 className='font-[700] text-xl opacity-50 text-center m-10'>Or</h2>}
            {isPiece != null &&
              <InputCalories 
                  title={nameTitle}
                  isPiece={isPiece}
                  handleAdd={handleAddNew}
                  setValue={(n) => {
                      if (isPiece) {
                          setActiveCal(n * cal);
                          setAddedCal(Math.round(n * cal));
                          setAddedCarbs(Math.round(n * carbs));
                          setAddedFats(Math.round(n * fats));
                          setAddedProtein(Math.round(n * protein));
                      } else {
                          setActiveCal(n* (cal / 100));
                          setAddedCal(Math.round(n* (cal / 100)));
                          setAddedCarbs(Math.round(n * (carbs / 100)));
                          setAddedFats(Math.round(n * (fats / 100)));
                          setAddedProtein(Math.round(n * (protein / 100)));
                      }
                  }}
                  isLoading={isLoading}
              />
              }
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

export const InputCalories = ({
    title,
    setValue,
    handleAdd,
    isLoading,
    isPiece
}) => {

    const [val, setVal] = React.useState(0)
    
    const handleChange = (e) => {
        setValue(e.target.value);
        setVal(e.target.value)
    };

    return (
        <div className='flex flex-row w-[100%] justify-between items-center'>
        <div className="w-[60%] p-4 flex flex-col justify-center border border-gray-200" style={{borderBottomLeftRadius:10, borderTopRightRadius:10}}>
            <div className="mb-2">
                <label 
                    htmlFor="egg-input" 
                    className="block text-sm font-bold opacity-70 text-gray-700"
                >
                    {isPiece ? "Number" : "Grams"} of {title}:
                </label>
            </div>
            <div className="flex flex-row items-center mb-3">
                <div className="relative w-full">
                    <input
                        id="egg-input"
                        type="number"
                        min="0"
                        value={val}
                        onChange={handleChange}
                        className="w-full p-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                        aria-label="Enter number of eggs"
                        disabled={isLoading}
                    />
                </div>
            </div>
  
        </div>
        <div 
          onClick={!isLoading ? handleAdd : undefined}
          className={`flex flex-col justify-center mr-10 w-[150px] h-[50px] text-center align-center 
                    bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg 
                    shadow-inset ${!isLoading ? 'hover:from-blue-600 hover:to-purple-600 hover:opacity-100 hover:shadow-lg hover:-translate-y-1 cursor-pointer' : 'opacity-70 cursor-not-allowed'}
                    transition-all duration-200 ease-in-out`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Adding...</span>
            </div>
          ) : (
            "+ Done"
          )}
        </div>
      </div>
    );
};


export const SelectAble = ({
    boxes,
    handlePress,
    active,
    cal
}) => {

    return(
        <div className='w-full p-4 flex flex-row justify-center'>
            {boxes.map((data) => 
                selectBox({title:data.title, handlePress:handlePress,multiplier:data.multiplier,active:active / cal})
            )}
          
        </div>
    )
}

export const SelectAbleSalad = ({
  boxes,
  handlePress,
  active,
  cal
}) => {

  return(
      <div className='w-full p-4 flex flex-row justify-center mb-5'>
          {boxes.map((data) => 
              selectBox({title:data.title, handlePress:handlePress,multiplier:data.multiplier,active:active / cal})
          )}
        
      </div>
  )
}

const selectBox = ({title,handlePress, multiplier,active}) => {

    return(
        active == multiplier ?
            (
            <div onClick={() => handlePress(multiplier)} className='w-[150px] h-[150px] bg-gray-200 border border-gray-300 shadow-lg rounded-lg mx-10 flex flex-col justify-center text-center cursor-pointer'>
                <h3 className='font-[600] opacity-70'>{title}</h3>
            </div>
            )
            :
            (
                <div onClick={() => handlePress(multiplier)} className='w-[150px] h-[150px] hover:bg-gray-200 border border-gray-300 shadow-lg rounded-lg mx-10 flex flex-col justify-center text-center cursor-pointer'>
                    <h3 className='font-[600] opacity-70'>{title}</h3>
                </div>
            )
        
    )
}