import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

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
  
  const handleOpen = (item) => {
    setOpen(true)
    setNameTitle(item.food)
    setCal(item.calories)
    setAmount(item.amount)
  }
  const handleClose = () => setOpen(false);

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
              
                <div onClick={() => handleOpen(item)}
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
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {amount}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}