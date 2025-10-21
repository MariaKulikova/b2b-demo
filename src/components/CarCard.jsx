import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import CarImagePlaceholder from './CarImagePlaceholder';

const CarCard = ({ car }) => {
  const handleCallUs = () => {
    window.location.href = 'tel:+447418613962';
  };

  const handleWhatsApp = () => {
    const priceText = car.price > 0 ? `€${car.price.toLocaleString()}` : 'price on request';
    const message = `Hi! I'm interested in the ${car.year} ${car.make} ${car.model} (${priceText})`;
    const whatsappUrl = `https://wa.me/447418613962?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBookTestDrive = () => {
    const message = `Hi! I'd like to book a test drive for ${car.year} ${car.make} ${car.model}`;
    if (window.openChatWithMessage) {
      window.openChatWithMessage(message);
    }
  };

  return (
    <Card className="car-card overflow-hidden">
      <div className="relative aspect-[4/3] bg-gray-100">
        {car.images && car.images.length > 0 ? (
          <img
            src={car.images[0]}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <CarImagePlaceholder
            make={car.make}
            model={car.model}
            className="w-full h-full"
          />
        )}
        {car.isHotOffer && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            HOT OFFER
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {car.year} {car.make} {car.model}
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {car.price > 0 ? `€${car.price.toLocaleString()}` : 'Contact for price'}
          </p>
          <p className="text-sm text-gray-600">
            {car.mileage > 0 ? `${car.mileage.toLocaleString()} km` : 'N/A'} • {car.fuelType} • {car.transmission}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleBookTestDrive}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cta-button cursor-pointer"
          >
            Book Test Drive
          </Button>
          
          <button
            onClick={handleCallUs}
            className="h-10 w-10 flex items-center justify-center rounded-md border border-green-500 bg-white hover:bg-green-50 transition-colors cursor-pointer"
          >
            <Phone className="h-5 w-5 text-green-600" />
          </button>
          
          <button
            onClick={handleWhatsApp}
            className="h-10 w-10 rounded-md overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="h-full w-full object-cover" />
          </button>
        </div>

        <Link
          to={`/car/${car.id}`}
          className="block mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Details →
        </Link>
      </CardContent>
    </Card>
  );
};

export default CarCard;

