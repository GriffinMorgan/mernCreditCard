import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import LoginErrorPage from './pages/LoginErrorPage';
import DashboardPage from './pages/DashboardPage';
import SpendSignalLogo from './components/SpendSignalLogo';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#090E1A] text-slate-100">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login-error" element={<LoginErrorPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-[#1A2540] bg-[#090E1A] py-6 px-8">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between text-xs text-slate-500">
              <SpendSignalLogo size="sm" uppercase={true} />
              <div>SpendSignal Credit Card Analytics · COP 4331 MERN Stack</div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
