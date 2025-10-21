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

  const getBookTestDriveUrl = () => {
    const carInfo = `${car.year} ${car.make} ${car.model}`;
    return `/book-test-drive?car=${encodeURIComponent(carInfo)}`;
  };

  return (
    <Card className="car-card overflow-hidden flex flex-col">
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
          <div className="absolute top-3 left-3 bg-brand-orange text-white px-3 py-2 rounded-xl text-xs font-semibold">
            HOT OFFER
          </div>
        )}
      </div>

      <CardContent className="p-4 pt-5 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-700">
            {car.year} {car.make} {car.model}
          </h3>
          <p className="text-2xl font-bold text-brand-dark">
            {car.price > 0 ? `€${car.price.toLocaleString()}` : 'Contact for price'}
          </p>
          <p className="text-sm text-gray-600">
            {car.mileage > 0 ? `${car.mileage.toLocaleString()} km` : 'N/A'} • {car.fuelType} • {car.transmission}
          </p>
        </div>

        <Link
          to={`/car/${car.id}`}
          className="block mb-6 text-base text-brand-dark hover:text-brand-dark/80 transition-colors font-medium"
        >
          View Details →
        </Link>

        <div className="flex items-center gap-2 mt-auto">
          <Link to={getBookTestDriveUrl()} className="flex-1">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white cta-button cursor-pointer"
            >
              Book Test Drive
            </Button>
          </Link>

          <button
            onClick={handleCallUs}
            className="h-10 w-10 flex items-center justify-center rounded-md border border-green-500 bg-white hover:bg-green-50 transition-colors cursor-pointer flex-shrink-0"
          >
            <Phone className="h-5 w-5 text-green-600" />
          </button>

          <button
            onClick={handleWhatsApp}
            className="h-10 w-10 rounded-md overflow-hidden hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
          >
            <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="h-full w-full object-cover" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;

