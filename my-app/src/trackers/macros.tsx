
import BasicPie from '../components/pie';
import React, { useEffect, useState } from 'react';

const MacrosTrackerPanel = () => {

     const [overall,setOverall] = useState<any[]>([
        {
          label: 'Protein',
          value: 500,
          color: 'cyan'
        },
        {
          label: 'Fat',
          value: 0,
          color: 'brown'
        },
        {
          label: 'Carbs',
          value: 0,
          color: 'yellow'
        },
      ]);

        useEffect(() => {
          const fetchDailyDeficit = async () => {
            try {
              const res = await fetch('/api/tracker');
              const data = await res.json();
              
              setOverall([
                {
                  label: 'Protein',
                  value: data.result.protein,
                  color: 'cyan'
                },
                {
                  label: 'Fat',
                  value: data.result.fat,
                  color: 'brown'
                },
                {
                  label: 'Carbs',
                  value: data.result.carbs,
                  color: 'yellow'
                },
              ]);
                  
       
            } catch (err) {
              console.error('Error fetching daily deficit:', err);
            }
          };
      
          
          fetchDailyDeficit();
        }, []);

    return(
        <div className='flex flex-wrap items-center justify-evenly w-[100%] self-center overflow-y-scroll bg-white rounded-lg'>
        <MacrosWidget 
            notionData={overall}
        />
        
        <Widget 
            dailyDeficit={overall.reduce((acc, item) => acc + item.value, 0)}
            title={"Overall Macros"}
            notionData={overall}
        />


  </div> 
    )
}

export default MacrosTrackerPanel;


const MacrosWidget = ({ notionData}) => {

    const sumGrams = notionData.reduce((acc, item) => acc + item.value, 0);
   
  
    const Box = ({title,notionData,sumGrams }) => {
      return(
        <div className='border p-4 rounded-lg w-[150px] bg-white shadow-md flex flex-col items-center justify-center border-gray-300'>
        <h2 className='text-xl font-[600] '>{title}</h2>
        <h2 className='font-[300] mt-2'>{notionData} g</h2>
        <hr style={{color:"gray",height:1, width:"100%", marginTop:10, marginBottom:10, opacity:0.2}} />
        <h2 className='font-[500]'>{ Math.round((notionData / sumGrams ) * 100)} %</h2>
      </div>
      )
    }
  
    return(
        <div className='flex flex-row justify-around w-full border-2 border-gray-200 p-4 m-5 rounded-lg bg-gray-100' >
          {notionData.map((item, index) => (
                <Box 
                  title={item.label}
                  notionData={item.value}
                  key={index}
                  sumGrams={sumGrams}
                />
          ))}
  
        </div>
    )
  }

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