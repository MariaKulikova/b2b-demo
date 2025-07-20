import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import CarCard from '../components/CarCard';
import TestDriveModal from '../components/TestDriveModal';
import { getAllCars } from '../data/cars';

const CarsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  const allCars = getAllCars();

  const handleBookTestDrive = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const filteredCars = allCars.filter(car => {
    const matchesSearch = searchTerm === '' || 
      `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMake = makeFilter === '' || car.make === makeFilter;
    
    const matchesPrice = priceFilter === '' || (() => {
      switch (priceFilter) {
        case 'under-25000': return car.price < 25000;
        case '25000-35000': return car.price >= 25000 && car.price <= 35000;
        case 'over-35000': return car.price > 35000;
        default: return true;
      }
    })();

    return matchesSearch && matchesMake && matchesPrice;
  });

  const uniqueMakes = [...new Set(allCars.map(car => car.make))];

  const clearFilters = () => {
    setSearchTerm('');
    setMakeFilter('');
    setPriceFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            All Cars
          </h1>
          <p className="text-xl text-gray-600">
            Browse our complete inventory of quality used cars
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by make or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Make Filter */}
            <select 
              value={makeFilter} 
              onChange={(e) => setMakeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Make</option>
              {uniqueMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>

            {/* Price Filter */}
            <select 
              value={priceFilter} 
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Price</option>
              <option value="under-25000">Under €25,000</option>
              <option value="25000-35000">€25,000 - €35,000</option>
              <option value="over-35000">Over €35,000</option>
            </select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCars.length} of {allCars.length} cars
          </p>
        </div>

        {/* Cars Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onBookTestDrive={handleBookTestDrive}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No cars found matching your criteria</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}

        <TestDriveModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedCar={selectedCar}
          cars={allCars}
        />
      </div>
    </div>
  );
};

export default CarsPage;

