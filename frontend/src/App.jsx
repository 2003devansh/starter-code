import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import History from './pages/History';
import Layout from './components/Layout';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
                    } 
                />
                <Route 
                    path="/" 
                    element={
                        user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                    }
                >
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard user={user} />} />
                    <Route path="checkin" element={<CheckIn user={user} />} />
                    <Route path="history" element={<History user={user} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
