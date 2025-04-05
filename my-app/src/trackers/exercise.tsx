import BasicPie from '../components/pie';
import React, { useEffect, useState } from 'react';

const ExerciseTrackerPanel = () => {

      const [steps, setSteps] = useState<any[]>([
        {
          label: 'Calories',
          value: 500,
        },
        {
          label: 'Over-Intake',
          value: 0,
        },
      ]);

        const [burnFromMovement, setBurnFromMovement] = useState<any[]>([
          {
            label: 'Bike',
            value: 0,
          },
          {
            label: 'Cardio',
            value: 0,
          },
          {
            label: 'Steps',
            value: 0,
          },
          {
            label: 'Gym',
            value: 0,
          },
        ]);

          const [deficitData, setDeficitData] = useState<any[]>([
            {
              label: 'Deficit',
              value: 500,
              color: 'cyan'
            },
            {
              label: 'Over-Intake',
              value: 0,
              color: 'red'
            },
          ]);

       const [movementCalSum, setMovementCalSum] = useState(0)



        // Fetch daily deficit on load
        useEffect(() => {
          const fetchDailyDeficit = async () => {
            try {
              const res = await fetch('/api/tracker');
              const data = await res.json();
              
              setSteps([
                {
                  label: 'Today Steps',
                  value: data.result.steps,
                  color: 'cyan'
                },
                {
                  label: 'Goal',
                  value: 10000 - data.result.steps,
                  color: 'brown'
                },
              ]);
              //Bike
              const caloriesPerMin = 8
              const kmPerBurn = 28
              const total_2 = caloriesPerMin * data.result.cycleDur
              const total_1 = kmPerBurn * data.result.cycleDist
      
              //Exercise
              const caloriesPerMin_2 = 11
              const kmPerBurn_2 = 75
              const total_1_2 = caloriesPerMin_2 * data.result.zone2Dur;
              const total_2_2 = kmPerBurn_2 * data.result.zone2Distance
      
              //Gym
              const caloriesPerMin_3 = data.result.workType == 'fullbody' ? 9 : 7
              const total = caloriesPerMin_3 * data.result.workDur;
              let sum = 0
              sum += total_2 >= total_1 ? total_2 : total_1
              sum += total_2_2 >= total_1_2 ? total_2_2 : total_1_2
              sum += Math.round(data.result.steps * 0.04)
              sum += total;
      
              setMovementCalSum(sum);
              setBurnFromMovement([
                {
                  label: 'Bike',
                  value: total_2 >= total_1 ? total_2 : total_1,
                },
                {
                  label: 'Cardio',
                  value: total_2_2 >= total_1_2 ? total_2_2 : total_1_2,
                },
                {
                  label: 'Steps',
                  value: Math.round(data.result.steps * 0.04),
                },
                {
                  label: 'Gym',
                  value: total,
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
                  <Widget 
                      dailyDeficit={`${Math.round(steps[0].value * 0.04)} Cal`}
                      title={"Steps Count"}
                      notionData={steps}
                  />
    
                  <Widget 
                      dailyDeficit={movementCalSum}
                      title={"Calorie Burn From Movement"}
                      notionData={burnFromMovement}
                  />
    
                  //New Widget
                    //Exercise Minute
                    //Exercise Type
                    //State
               
    
            </div>      
          
    )
}

export default ExerciseTrackerPanel

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

const Widget_2 = ({ dailyDeficit, title, notionData}) => {

  return(
      <div className="flex justify-center opacity-100 w-full">        
        <div className="md:w-1/2 m-5 min-w-[80%] w-full min-h-[500px]">
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