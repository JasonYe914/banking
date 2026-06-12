"use client"; 

import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import {Doughnut} from 'react-chartjs-2'; //Specific chart type import

ChartJS.register(ArcElement, Tooltip, Legend);

const doughnutChart = ({accounts}: DoughnutChartProps) => {
    //{acccounts} is the attribute from props, {} allows for easy access 
    const data = { 
        datasets: [
            {
                label: 'Banks', 
                data: [1250, 2500, 3750],
                backgroundColor: [
                    '#0747b6', 
                    '#2265d8', 
                    '#2f91fa', 
                ]  
            }
        ],
        labels: ['Bank A', 'Bank B', 'Bank C'], 
    }
    return (
        <Doughnut 
            data={data}
            options={{
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false, 
                    }
                }
            }}
         />
    )
}

export default doughnutChart;