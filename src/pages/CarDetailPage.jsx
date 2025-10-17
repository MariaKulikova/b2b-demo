import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Calendar, Fuel, Cog, Palette, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useCars } from '../context/CarsContext';
import CarImagePlaceholder from '../components/CarImagePlaceholder';

const CarDetailPage = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const { getCarById, loading, error } = useCars();

  const car = getCarById(id);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading car: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Car not found
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
              {car.images && car.images.length > 0 ? (
                <img
                  src={car.images[currentImageIndex]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              ) : (
                <CarImagePlaceholder
                  make={car.make}
                  model={car.model}
                  className="w-full h-96 rounded-lg shadow-lg"
                />
              )}
            </div>
            {car.images && car.images.length > 1 && (
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
            )}
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
                {car.price > 0 ? `€${car.price.toLocaleString()}` : 'Contact for price'}
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
                    <span className="font-medium">
                      {car.mileage > 0 ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                    </span>
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
                {car.features && car.features.length > 0 && (
                  <>
                    <h4 className="font-medium mb-2">Features:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {car.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBookTestDrive}
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cta-button cursor-pointer"
              >
                Book Test Drive
              </Button>
              
              <button
                onClick={handleCallUs}
                className="h-12 w-12 flex items-center justify-center rounded-md border border-green-500 bg-white hover:bg-green-50 transition-colors cursor-pointer"
              >
                <Phone className="h-6 w-6 text-green-600" />
              </button>
              
              <button
                onClick={handleWhatsApp}
                className="h-12 w-12 rounded-md overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
              >
                <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="h-full w-full object-cover" />
              </button>
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

      </div>
    </div>
  );
};

export default CarDetailPage;

