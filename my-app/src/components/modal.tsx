import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useScatterChartProps } from '@mui/x-charts/internals';
import { getBox } from './boxCondition';

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
  const [isPiece, setIsPiece] = React.useState(false)

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

      handleClose()
  }

  const [currBox, setCurrBox] = React.useState([{title:"2 Eggs",multiplier:2},{title:"3 Eggs",multiplier:3},{title:"4 Eggs",multiplier:4}])

  const handleBoxes = (item) => {
    setAddedCal(0)
    setAddedCarbs(0)
    setAddedFats(0)
    setAddedProtein(0)
    const response: any = getBox(item.food);
    setIsPiece(response.isPiece)
    setCurrBox(response.options)
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
            <SelectAble 
                boxes={currBox}
                handlePress={(n) => {
                    setAddedCal(Math.round(n * cal));
                    setAddedCarbs(Math.round(n * carbs));
                    setAddedFats(Math.round(n * fats));
                    setAddedProtein(Math.round(n * protein));
                }}
                active={addedCal}
                cal={cal}
            
            />
            <h2 className='font-[700] text-xl opacity-50 text-center m-10'>Or</h2>
            <InputCalories 
                title={nameTitle}
                handleAdd={handleAddNew}
                setValue={(n) => {
                    if (isPiece) {
                        setAddedCal(Math.round(n * cal));
                        setAddedCarbs(Math.round(n * carbs));
                        setAddedFats(Math.round(n * fats));
                        setAddedProtein(Math.round(n * protein));
                    } else {
                        setAddedCal(Math.round(n* (cal / 100)));
                        setAddedCarbs(Math.round(n * (carbs / 100)));
                        setAddedFats(Math.round(n * (fats / 100)));
                        setAddedProtein(Math.round(n * (protein / 100)));
                    }
                }}
                
            />
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
                    Number of {title}:
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
                    />
                </div>
            </div>
  
        </div>
        <div onClick={() => handleAdd()}
                className=" flex flex-col justify-center mr-10 w-[150px] h-[50px] text-center align-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg 
                            shadow-inset hover:from-blue-600 hover:to-purple-600 hover:opacity-100 opacity-70 hover:shadow-lg hover:-translate-y-1
                            cursor-pointer transition-all duration-200 ease-in-out"
                >
                   + Done
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