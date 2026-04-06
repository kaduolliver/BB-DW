import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Home from './pages/Home';
import Market from './pages/Market';
import Login from './pages/Login';
import About from './pages/About';
//import User from './pages/User';
import CreditCard from './pages/CreditCard';
import Client from './components/ClientComponents/Client';
import Employee from './components/EmployeeComponents/Employee';
import ProtectedRoute from './components/GlobalComponents/ProtectedRoute';
import ScrollToTop from './components/EffectsComponents/ScrollToTop';
import SplashScreen from './components/EffectsComponents/SplashScreen';
import Footer from './components/GlobalComponents/Footer';
import { useAuth } from './context/authContext';
import NavbarSwitcher from './components/EffectsComponents/NavBarSwitcher';
import PublicRoute from './components/GlobalComponents/PublicRoute';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  const { carregando } = useAuth();

  const ocultarFooter = [];
  const ocultarNavbar = ['/creditcard'];

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && !carregando && (
        <div className="main-container">
          {/* Header */}
          {!ocultarNavbar.includes(location.pathname) && (
            <header className="header-content">
              <NavbarSwitcher />
            </header>
          )}

          <ScrollToTop />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/market" element={<Market />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/about" element={<About />} />
              {/* <Route path="/user" element={<ProtectedRoute><User /></ProtectedRoute>} /> */}
              <Route path="/user/client" element={<ProtectedRoute tipoPermitido="cliente"><Client /></ProtectedRoute>} />
              <Route path="/user/employee" element={<ProtectedRoute tipoPermitido="funcionario"><Employee /></ProtectedRoute>} />
              <Route path="/creditcard" element={<CreditCard />} />
            </Routes>
          </main>

          {!ocultarFooter.includes(location.pathname) && (
            <footer className="footer-content">
              <Footer />
            </footer>
          )}
        </div>
      )}
    </>
  );
}
