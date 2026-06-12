'use client';
import CountUp from 'react-countup';

const animatedCounter = ({amount}: {amount: number}) => { 
    return ( 
        <div className="w-full">
            <CountUp 
            prefix="$" 
            end={amount} 
            decimals={2}
            /> 
        </div>
    )
}

export default animatedCounter; 