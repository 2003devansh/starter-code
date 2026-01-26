import { useState, useEffect } from 'react';

function ActivityList({ items, filter, onItemSelect }) {
    const [filteredItems, setFilteredItems] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        const filtered = items.filter(item => {
            if (filter.status && item.status !== filter.status) return false;
            if (filter.type && item.type !== filter.type) return false;
            return true;
        });
        setFilteredItems(filtered);
    }, [items, filter]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdate(new Date());
        }, 30000);
    }, []);

    const handleItemClick = (item) => {
        onItemSelect?.(item);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Recent Activity</h3>
                <span className="text-xs text-gray-400">
                    Updated: {lastUpdate.toLocaleTimeString()}
                </span>
            </div>
            <ul className="divide-y">
                {filteredItems.map((item) => (
                    <li 
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                    >
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                    </li>
                ))}
                {filteredItems.length === 0 && (
                    <li className="p-4 text-center text-gray-500">No activity</li>
                )}
            </ul>
        </div>
    );
}

export default ActivityList;
