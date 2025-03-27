import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Define types
type ViewOption = 'today' | 'weekly' | 'both';
type Week = string;

interface DeficitData {
  dailyDeficit: number;
  weeklyDeficit: number;
}

const DeficitStats: React.FC = () => {
  // State
  const [viewOption, setViewOption] = useState<ViewOption>('today');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week>('');
  const [dailyDeficit, setDailyDeficit] = useState<number>(0);
  const [weeklyDeficit, setWeeklyDeficit] = useState<number>(0);

  // Refs for charts
  const dailyChartRef = useRef<HTMLCanvasElement>(null);
  const weeklyChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances
  const dailyChartInstance = useRef<Chart | null>(null);
  const weeklyChartInstance = useRef<Chart | null>(null);

  // Constants
  const dailyTarget = 100;
  const weeklyTarget = 500;

  // Fetch weeks for dropdown
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const res = await fetch('/api/weeks');
        const data = await res.json();
        setWeeks(data.weeks);
      } catch (err) {
        console.error('Error fetching weeks:', err);
      }
    };

    fetchWeeks();
  }, []);

  // Fetch daily deficit on load
  useEffect(() => {
    const fetchDailyDeficit = async () => {
      try {
        const res = await fetch('/api/deficits');
        const data = await res.json();
        setDailyDeficit(data.dailyDeficit);
      } catch (err) {
        console.error('Error fetching daily deficit:', err);
      }
    };

    fetchDailyDeficit();
  }, []);

  // Fetch weekly deficit when a week is selected
  useEffect(() => {
    if (!selectedWeek) {
      setWeeklyDeficit(0);
      return;
    }

    const fetchWeeklyDeficit = async () => {
      try {
        const res = await fetch(`/api/deficits?week=${encodeURIComponent(selectedWeek)}`);
        const data = await res.json();
        setWeeklyDeficit(data.weeklyDeficit);
      } catch (err) {
        console.error('Error fetching weekly deficit:', err);
      }
    };

    fetchWeeklyDeficit();
  }, [selectedWeek]);

  // Render daily chart
  useEffect(() => {
    if (!dailyChartRef.current) return;

    const dailyRemaining = Math.max(dailyTarget - dailyDeficit, 0);
    
    // Destroy previous chart if it exists
    if (dailyChartInstance.current) {
      dailyChartInstance.current.destroy();
    }

    const ctx = dailyChartRef.current.getContext('2d');
    if (ctx) {
      dailyChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Deficit', 'Remaining'],
          datasets: [
            {
              data: [dailyDeficit, dailyRemaining],
              backgroundColor: ['#FF6384', '#36A2EB'],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
    }
  }, [dailyDeficit]);

  // Render weekly chart
  useEffect(() => {
    if (!weeklyChartRef.current) return;

    const weeklyRemaining = Math.max(weeklyTarget - weeklyDeficit, 0);
    
    // Destroy previous chart if it exists
    if (weeklyChartInstance.current) {
      weeklyChartInstance.current.destroy();
    }

    const ctx = weeklyChartRef.current.getContext('2d');
    if (ctx) {
      weeklyChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Deficit', 'Remaining'],
          datasets: [
            {
              data: [weeklyDeficit, weeklyRemaining],
              backgroundColor: ['#FFCE56', '#4BC0C0'],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
    }
  }, [weeklyDeficit]);

  // Handle view option change
  const handleViewOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewOption(e.target.value as ViewOption);
  };

  // Handle week selection
  const handleWeekSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(e.target.value);
  };

  return (
    <div className="container mx-auto px-0 py-8 rounded">
      
      {/* Toggle View Options */}
      <div className="flex justify-center space-x-29 mb-7 bg-white p-4 rounded-lg opacity-90 border border-gray-400">
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="viewOption"
            value="today"
            checked={viewOption === 'today'}
            onChange={handleViewOptionChange}
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Today</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="viewOption"
            value="weekly"
            checked={viewOption === 'weekly'}
            onChange={handleViewOptionChange}
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Weekly</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="viewOption"
            value="both"
            checked={viewOption === 'both'}
            onChange={handleViewOptionChange}
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Both</span>
        </label>
      </div>

      <div className='flex flex-row items-center'>
        <Widget 
                viewOption={viewOption}
                selectedWeek={selectedWeek}
                dailyDeficit={dailyDeficit}
                dailyChartRef={dailyChartRef}
                handleWeekSelect={handleWeekSelect}
                weeks={weeks}
                weeklyChartRef={weeklyChartRef}
                weeklyDeficit={weeklyDeficit}
            />

            <Widget 
                viewOption={viewOption}
                selectedWeek={selectedWeek}
                dailyDeficit={dailyDeficit}
                dailyChartRef={dailyChartRef}
                handleWeekSelect={handleWeekSelect}
                weeks={weeks}
                weeklyChartRef={weeklyChartRef}
                weeklyDeficit={weeklyDeficit}
            />
      </div>      

    </div>
  );
};

export default DeficitStats;


const Widget = ({viewOption, selectedWeek, dailyDeficit, dailyChartRef, handleWeekSelect,weeks, weeklyChartRef, weeklyDeficit}) => {

    return(
        <div className="flex justify-center opacity-90">
        {/* Daily Panel */}
        {(viewOption === 'today' || viewOption === 'both') && (
          <div className="w-full md:w-1/2 mr-7 min-w-[400px] min-h-[400px]">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Today</h2>
              <div className="chart-container h-64 mb-4">
                <canvas ref={dailyChartRef}></canvas>
              </div>
              <p className="text-center text-gray-700">
                Total Deficit: {dailyDeficit}
              </p>
            </div>
          </div>
        )}

        {/* Weekly Panel */}
        {(viewOption === 'weekly' || viewOption === 'both') && (
          <div className="w-full md:w-1/2 px-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Weekly</h2>
              
              {/* Week Selector */}
              <div className="mb-4">
                <label 
                  htmlFor="weekSelect" 
                  className="block text-gray-700 mb-2"
                >
                  Choose a week:
                </label>
                <select
                  id="weekSelect"
                  value={selectedWeek}
                  onChange={handleWeekSelect}
                  className="form-select block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="">Select a week</option>
                  {weeks.map((week) => (
                    <option key={week} value={week}>
                      {week}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="chart-container h-64 mb-4">
                <canvas ref={weeklyChartRef}></canvas>
              </div>
              <p className="text-center text-gray-700">
                Total Deficit: {weeklyDeficit}
              </p>
            </div>
          </div>
        )}
      </div>
    )
}