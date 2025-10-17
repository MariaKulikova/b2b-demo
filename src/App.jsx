import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CarsProvider } from './context/CarsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import VoiceAssistant from './components/VoiceAssistant';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { browserControlWS } from './services/browserControlWebSocket';
import appConfig from './config/browserControlConfig';
import { useCommands } from './hooks/useCommands';
import './App.css';

function AppContent() {
  // Автоматически генерируем и обновляем высокоуровневые команды
  useCommands();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/car/:id" element={<CarDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
      <VoiceAssistant />
    </div>
  );
}

function App() {
  // Инициализируем конфигурацию приложения для browser control при монтировании
  useEffect(() => {
    browserControlWS.setAppConfig(appConfig);
    console.log('[App] Browser control app config initialized');
  }, []);

  return (
    <Router>
      <CarsProvider>
        <AppContent />
      </CarsProvider>
    </Router>
  );
}

export default App;

