"use client"; 

import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import {Doughnut} from 'react-chartjs-2'; //Specific chart type import

ChartJS.register(ArcElement, Tooltip, Legend);

const doughnutChart = ({accounts}: DoughnutChartProps) => {
    //{acccounts} is the attribute from props, {} allows for easy access 
    const accountNames = accounts.map(account => account.name); 
    const balances = accounts.map(account => account.currentBalance);

    const data = { 
        datasets: [
            {
                label: 'Banks', 
                data: balances,
                backgroundColor: [
                    '#0747b6', 
                    '#2265d8', 
                    '#2f91fa', 
                ]  
            }
        ],
        labels: accountNames, 
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