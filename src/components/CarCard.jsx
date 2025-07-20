import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const CarCard = ({ car, onBookTestDrive }) => {
  const handleCallUs = () => {
    window.location.href = 'tel:+31201234567';
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in the ${car.year} ${car.make} ${car.model} (€${car.price.toLocaleString()})`;
    const whatsappUrl = `https://wa.me/31201234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="car-card overflow-hidden">
      <div className="relative">
        <img
          src={car.images[0]}
          alt={`${car.make} ${car.model}`}
          className="w-full h-48 object-cover"
        />
        {car.isHotOffer && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
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
            €{car.price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            {car.mileage.toLocaleString()} km • {car.fuelType} • {car.transmission}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onBookTestDrive(car)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cta-button"
          >
            Book Test Drive
          </Button>
          
          <Button
            onClick={handleCallUs}
            variant="outline"
            size="icon"
            className="icon-button border-green-500 text-green-600 hover:bg-green-50"
          >
            <Phone className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            size="icon"
            className="icon-button border-green-500 text-green-600 hover:bg-green-50"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
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

