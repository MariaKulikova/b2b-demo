import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Calendar, Fuel, Cog, Palette, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import TestDriveModal from '../components/TestDriveModal';
import { getCarById, getAllCars } from '../data/cars';

const CarDetailPage = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const car = getCarById(id);
  const allCars = getAllCars();

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Car not found</h1>
          <Link to="/cars">
            <Button>Back to Cars</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCallUs = () => {
    window.location.href = 'tel:+447418613962';
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in the ${car.year} ${car.make} ${car.model} (€${car.price.toLocaleString()})`;
    const whatsappUrl = `https://wa.me/447418613962?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBookTestDrive = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cars
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="mb-4">
              <img
                src={car.images[currentImageIndex]}
                alt={`${car.make} ${car.model}`}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative overflow-hidden rounded-lg ${
                    currentImageIndex === index ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${car.make} ${car.model} view ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Car Details */}
          <div>
            <div className="mb-6">
              {car.isHotOffer && (
                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  HOT OFFER
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {car.year} {car.make} {car.model}
              </h1>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                €{car.price.toLocaleString()}
              </p>
            </div>

            {/* Key Specs */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Key Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{car.year}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Mileage:</span>
                    <span className="font-medium">{car.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Fuel className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Fuel:</span>
                    <span className="font-medium">{car.fuelType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Cog className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Transmission:</span>
                    <span className="font-medium">{car.transmission}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{car.color}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-600 mb-4">{car.description}</p>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {car.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBookTestDrive}
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cta-button"
              >
                Book Test Drive
              </Button>
              
              <Button
                onClick={handleCallUs}
                variant="outline"
                size="lg"
                className="icon-button border-green-500 text-green-600 hover:bg-green-50 p-3"
              >
                <Phone className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                size="lg"
                className="icon-button border-green-500 text-green-600 hover:bg-green-50 p-3"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>

            {/* Contact Info */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Phone:</strong> +44 7418 613962</p>
                  <p><strong>Email:</strong> info@shiftgears.ai</p>
                  <p><strong>Locations:</strong> Amsterdam North & South</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <TestDriveModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedCar={car}
          cars={allCars}
        />
      </div>
    </div>
  );
};

export default CarDetailPage;

