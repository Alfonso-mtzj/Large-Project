import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Veify'}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard>} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="*" element={<Navigate to="/login" />} />
        
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
