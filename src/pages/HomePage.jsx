import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Award, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import CarCard from '../components/CarCard';
import TestDriveModal from '../components/TestDriveModal';
import { useCars } from '../context/CarsContext';

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const { getHotOffers, getAllCars, loading, error } = useCars();

  const hotOffers = getHotOffers();
  const allCars = getAllCars();

  const handleBookTestDrive = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative text-white rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-left" style={{ backgroundImage: 'url(/assets/Light.jpg)', transform: 'scaleX(-1)' }}></div>
            <div className="relative z-10 py-32 px-8 sm:px-12 lg:px-16 text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-3">
                FIND YOUR DREAM CAR
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-gray-200">
                Browse our range of quality vehicles in Amsterdam
              </p>
              <Link to="/cars">
                <Button size="lg" variant="secondary">
                  Browse Inventory
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-brand-dark" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                Every vehicle undergoes thorough inspection and comes with our quality guarantee.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-brand-dark" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Service</h3>
              <p className="text-gray-600">
                Over 15 years of experience serving Amsterdam with honest, reliable service.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-brand-dark" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competitive pricing and flexible financing options to fit your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Offers Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {hotOffers.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onBookTestDrive={handleBookTestDrive}
                  />
                ))}
              </div>

              <div className="text-center">
                <Link to="/cars">
                  <Button size="lg" className="bg-brand-dark hover:bg-brand-dark">
                    View All Cars
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No hot offers available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Visit our showrooms in Amsterdam or contact us today
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contact">
              <Button size="lg" variant="secondary">
                Contact Us
              </Button>
            </Link>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.location.href = 'tel:+447418613962'}
            >
              Call Now: +44 7418 613962
            </Button>
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

