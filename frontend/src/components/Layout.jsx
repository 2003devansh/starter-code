import { Outlet, Link, useLocation } from 'react-router-dom';

function Layout({ user, onLogout }) {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/checkin', label: 'Check In' },
        { path: '/history', label: 'History' }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-bold text-blue-600">Unolo Tracker</h1>
                        <nav className="flex space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        location.pathname === item.path
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            {user.name} ({user.role})
                        </span>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
