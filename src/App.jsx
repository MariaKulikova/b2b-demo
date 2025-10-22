import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CarsProvider } from './context/CarsContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import Header from './components/Header';
import Footer from './components/Footer';
import VoiceAssistant from './components/VoiceAssistant';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BookTestDrivePage from './pages/BookTestDrivePage';
import { browserControlWS } from './services/browserControlWebSocket';
import { generateAppConfig } from './config/browserControlConfig';
import { useCommands } from './hooks/useCommands';
import { useCars } from './context/CarsContext';
import './App.css';

function AppContent() {
  const { getAllCars } = useCars();

  // Обновляем app config с данными об автомобилях
  useEffect(() => {
    const cars = getAllCars();
    const config = generateAppConfig(cars);
    browserControlWS.setAppConfig(config);
    console.log('[App] Browser control app config initialized with', config.metadata.totalCars, 'cars');
  }, [getAllCars]);

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
          <Route path="/book-test-drive" element={<BookTestDrivePage />} />
        </Routes>
      </main>
      <Footer />
      <VoiceAssistant />
    </div>
  );
}

function App() {
  return (
    <Router>
      <CarsProvider>
        <VoiceAssistantProvider>
          <AppContent />
        </VoiceAssistantProvider>
      </CarsProvider>
    </Router>
  );
}

export default App;

