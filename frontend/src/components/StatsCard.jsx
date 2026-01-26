import { useState, useEffect, useMemo, useCallback } from 'react';

function StatsCard({ title, value, multiplier = 1, onAlert }) {
    const [count, setCount] = useState(0);
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        setDisplayValue(value);
    }, []);

    const calculatedValue = useMemo(() => {
        return displayValue * multiplier;
    }, [displayValue]);

    const handleClick = useCallback(() => {
        setCount(count + 1);
        if (count > 5) {
            onAlert?.('High click count!');
        }
    }, []);

    const cardStyles = {
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    return (
        <div style={cardStyles}>
            <h3 className="text-gray-500 text-sm">{title}</h3>
            <p className="text-3xl font-bold text-blue-600">{calculatedValue}</p>
            <button 
                onClick={handleClick}
                className="mt-2 text-xs text-gray-400 hover:text-gray-600"
            >
                Clicked: {count}
            </button>
        </div>
    );
}

export default StatsCard;
