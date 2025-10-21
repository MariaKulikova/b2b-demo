import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RangeSlider } from '../components/ui/range-slider';
import CarCard from '../components/CarCard';
import TestDriveModal from '../components/TestDriveModal';
import { useCars } from '../context/CarsContext';

const CarsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const { getAllCars, loading, error } = useCars();
  const allCars = getAllCars();

  // Вычисляем диапазон цен из всех автомобилей
  const priceRange = useMemo(() => {
    const prices = allCars.filter(car => car.price > 0).map(car => car.price);
    if (prices.length === 0) return { min: 0, max: 100000 };
    return {
      min: Math.floor(Math.min(...prices) / 1000) * 1000,
      max: Math.ceil(Math.max(...prices) / 1000) * 1000
    };
  }, [allCars]);

  // Вычисляем диапазон пробега из всех автомобилей
  const mileageRange = useMemo(() => {
    const mileages = allCars.filter(car => car.mileage > 0).map(car => car.mileage);
    if (mileages.length === 0) return { min: 0, max: 200000 };
    return {
      min: Math.floor(Math.min(...mileages) / 1000) * 1000,
      max: Math.ceil(Math.max(...mileages) / 1000) * 1000
    };
  }, [allCars]);

  // Читаем фильтры из URL или используем значения по умолчанию
  const searchTerm = searchParams.get('search') || '';
  const makeFilter = searchParams.get('make') || '';
  const modelFilter = searchParams.get('model') || '';
  const bodyTypeFilter = searchParams.get('bodyType') || '';
  const fuelTypeFilter = searchParams.get('fuelType') || '';
  const transmissionFilter = searchParams.get('transmission') || '';
  const minPrice = parseInt(searchParams.get('minPrice') || priceRange.min);
  const maxPrice = parseInt(searchParams.get('maxPrice') || priceRange.max);
  const minMileage = parseInt(searchParams.get('minMileage') || mileageRange.min);
  const maxMileage = parseInt(searchParams.get('maxMileage') || mileageRange.max);
  const sortBy = searchParams.get('sortBy') || 'price-asc';

  // Функция для обновления URL параметров
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleBookTestDrive = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  // Фильтруем автомобили
  const filteredCars = allCars.filter(car => {
    const matchesSearch = searchTerm === '' ||
      `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMake = makeFilter === '' || car.make === makeFilter;
    const matchesModel = modelFilter === '' || car.model === modelFilter;
    const matchesBodyType = bodyTypeFilter === '' || car.bodyType === bodyTypeFilter;
    const matchesFuelType = fuelTypeFilter === '' || car.fuelType === fuelTypeFilter;
    const matchesTransmission = transmissionFilter === '' || car.transmission === transmissionFilter;

    // Фильтруем по диапазону цен
    const matchesPrice = car.price >= minPrice && car.price <= maxPrice;

    // Фильтруем по диапазону пробега
    const matchesMileage = car.mileage >= minMileage && car.mileage <= maxMileage;

    return matchesSearch && matchesMake && matchesModel && matchesBodyType && matchesFuelType && matchesTransmission && matchesPrice && matchesMileage;
  });

  // Сортируем отфильтрованные автомобили
  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'year-desc':
        return b.year - a.year;
      case 'year-asc':
        return a.year - b.year;
      case 'mileage-asc':
        return a.mileage - b.mileage;
      case 'mileage-desc':
        return b.mileage - a.mileage;
      default:
        return 0;
    }
  });

  const uniqueMakes = [...new Set(allCars.map(car => car.make))].sort();
  const uniqueBodyTypes = [...new Set(allCars.map(car => car.bodyType))].sort();
  const uniqueFuelTypes = [...new Set(allCars.map(car => car.fuelType))].sort();
  const uniqueTransmissions = [...new Set(allCars.map(car => car.transmission))].sort();

  // Получаем модели для выбранной марки (или все, если марка не выбрана)
  const availableModels = makeFilter === ''
    ? [...new Set(allCars.map(car => car.model))].sort()
    : [...new Set(allCars.filter(car => car.make === makeFilter).map(car => car.model))].sort();

  const clearFilters = () => {
    setSearchParams({});
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="lg:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="car-search-input"
                  placeholder="Search by make or model..."
                  value={searchTerm}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Фильтры в отдельной строке */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">

            {/* Make Filter */}
            <select
              id="car-make-filter"
              value={makeFilter}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set('make', e.target.value);
                } else {
                  newParams.delete('make');
                }
                // При смене марки сбрасываем фильтр по модели
                if (e.target.value !== makeFilter) {
                  newParams.delete('model');
                }
                setSearchParams(newParams);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Make</option>
              {uniqueMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>

            {/* Model Filter */}
            <select
              id="car-model-filter"
              value={modelFilter}
              onChange={(e) => updateFilter('model', e.target.value)}
              disabled={availableModels.length === 0}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Any Model</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>

            {/* Body Type Filter */}
            <select
              id="car-body-type-filter"
              value={bodyTypeFilter}
              onChange={(e) => updateFilter('bodyType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Body Type</option>
              {uniqueBodyTypes.map(bodyType => (
                <option key={bodyType} value={bodyType}>{bodyType}</option>
              ))}
            </select>

            {/* Fuel Type Filter */}
            <select
              id="car-fuel-type-filter"
              value={fuelTypeFilter}
              onChange={(e) => updateFilter('fuelType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Fuel Type</option>
              {uniqueFuelTypes.map(fuelType => (
                <option key={fuelType} value={fuelType}>{fuelType}</option>
              ))}
            </select>

            {/* Transmission Filter */}
            <select
              id="car-transmission-filter"
              value={transmissionFilter}
              onChange={(e) => updateFilter('transmission', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Transmission</option>
              {uniqueTransmissions.map(transmission => (
                <option key={transmission} value={transmission}>{transmission}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              id="car-sort-filter"
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="year-asc">Year: Oldest First</option>
              <option value="mileage-asc">Mileage: Low to High</option>
              <option value="mileage-desc">Mileage: High to Low</option>
            </select>
          </div>

          {/* Price and Mileage Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Price Range */}
            <RangeSlider
              min={priceRange.min}
              max={priceRange.max}
              step={1000}
              minValue={minPrice}
              maxValue={maxPrice}
              onChange={(min, max) => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('minPrice', min);
                newParams.set('maxPrice', max);
                setSearchParams(newParams);
              }}
              formatValue={(value) => `€${value.toLocaleString()}`}
              label="Price"
            />

            {/* Mileage Range */}
            <RangeSlider
              min={mileageRange.min}
              max={mileageRange.max}
              step={1000}
              minValue={minMileage}
              maxValue={maxMileage}
              onChange={(min, max) => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('minMileage', min);
                newParams.set('maxMileage', max);
                setSearchParams(newParams);
              }}
              formatValue={(value) => `${value.toLocaleString()} km`}
              label="Mileage"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <Button
              id="car-clear-filters-btn"
              variant="outline"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results and Loading/Error States */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading cars...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">Error loading cars: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {sortedCars.length} of {allCars.length} cars
              </p>
            </div>

            {/* Cars Grid */}
            {sortedCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCars.map((car) => (
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
          </>
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

