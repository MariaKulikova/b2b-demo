import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Mic, Star, Shield, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import CarCard from '../components/CarCard';
import TestDriveModal from '../components/TestDriveModal';
import { useCars } from '../context/CarsContext';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const { getHotOffers, getAllCars, loading, error } = useCars();
  const { openVoiceAssistant } = useVoiceAssistant();

  const hotOffers = getHotOffers();
  const allCars = getAllCars();

  const handleBookTestDrive = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-left" style={{ backgroundImage: 'url(/assets/Body.jpg)' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-24 text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-3">
              FIND YOUR DREAM CAR
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-200">
              Browse our range of quality vehicles in Amsterdam
            </p>
            <Button size="lg" variant="secondary" onClick={openVoiceAssistant}>
              <Mic className="mr-2 h-5 w-5" />
              Help me find a car
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative text-left bg-gray-50 rounded-2xl p-8 overflow-hidden">
              <Star className="absolute -right-6 -bottom-6 h-48 w-48 text-brand-dark opacity-5" />
              <h3 className="text-3xl font-semibold mb-2 relative z-10">Quality Guaranteed</h3>
              <p className="text-gray-600 relative z-10">
                Every vehicle undergoes thorough inspection and comes with our quality guarantee.
              </p>
            </div>
            <div className="relative text-left bg-gray-50 rounded-2xl p-8 overflow-hidden">
              <Shield className="absolute -right-6 -bottom-6 h-48 w-48 text-brand-dark opacity-5" />
              <h3 className="text-3xl font-semibold mb-2 relative z-10">Trusted Service</h3>
              <p className="text-gray-600 relative z-10">
                Over 15 years of experience serving Amsterdam with honest, reliable service.
              </p>
            </div>
            <div className="relative text-left bg-gray-50 rounded-2xl p-8 overflow-hidden">
              <Award className="absolute -right-6 -bottom-6 h-48 w-48 text-brand-dark opacity-5" />
              <h3 className="text-3xl font-semibold mb-2 relative z-10">Best Prices</h3>
              <p className="text-gray-600 relative z-10">
                Competitive pricing and flexible financing options to fit your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Offers Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hot Offers
            </h2>
            <p className="text-xl text-gray-600">
              Don't miss these amazing deals on premium vehicles
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-dark" />
              <span className="ml-3 text-gray-600">Loading cars...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading cars: {error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : hotOffers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotOffers.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onBookTestDrive={handleBookTestDrive}
                  />
                ))}
                {/* Show button in grid if missing only 1 card in the row (not 2) */}
                {hotOffers.length % 3 === 2 && (
                  <Link to="/cars" className="flex items-center justify-center min-h-full">
                    <Button size="lg" variant="outline" className="w-full h-full min-h-[400px]">
                      <span className="flex items-center">
                        View All Cars
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </Button>
                  </Link>
                )}
              </div>

              {/* Show button centered below grid if missing 2 cards or grid is full */}
              {hotOffers.length % 3 !== 2 && (
                <div className="text-center mt-8">
                  <Link to="/cars">
                    <Button size="lg" variant="outline">
                      View All Cars
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No hot offers available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-2xl px-8 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Ready to Find Your Perfect Car?
              </h2>
              <p className="text-xl text-gray-600">
                Visit our showrooms in Amsterdam or contact us today
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 md:flex-shrink-0">
              <Link to="/contact">
                <Button size="lg" variant="secondary">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TestDriveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCar={selectedCar}
        cars={allCars}
      />
    </div>
  );
};

export default HomePage;

