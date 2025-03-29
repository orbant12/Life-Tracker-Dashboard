import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { desktopOS, valueFormatter } from './webUsageStats';

export default function PieArcLabel({chartData}) {
  return (
    <PieChart
      rightAxis={null}
      series={[
        {
          data: chartData,
          highlightScope: { fade: 'global', highlight: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
          valueFormatter,
          // Add these properties for labels
          arcLabel: (item) => `${valueFormatter({value:item.value})}`,
          arcLabelMinAngle: 45,
          // Position labels at the bottom
          innerRadius: 40,  // Create some space in the middle
          outerRadius: 140, // Adjust pie size
          paddingAngle: 0,  // Small gaps between sectors
          cornerRadius: 0,  // Rounded corners
          startAngle: -90,  // Start from top
          endAngle: 280,    // End at top
          cx: 130,          // Center X position
          cy: 170,          // Center Y position (move up to make room for labels)
        },
      ]}
      margin={{ top: 0, bottom: 0, left: 75, right: 0 }} // Add more bottom margin for labels
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fontWeight: 'bold',
          fontSize: 20,
          transform: 'translateY(70px)', 
          textAnchor: 'middle',
         
        },
      }}
      {...size}
      slotProps={{
        legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'middle' },
            padding: 0,
            hidden: false,
            
        },
      }}
    />
  );
}

const size = {
  width: 380,
  height: 380,
};