import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { RangeSlider } from '../components/ui/range-slider';
import { MultiSelect } from '../components/ui/multi-select';
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

  // Вычисляем диапазон годов из всех автомобилей
  const yearRange = useMemo(() => {
    const years = allCars.filter(car => car.year > 0).map(car => car.year);
    if (years.length === 0) return { min: 2000, max: new Date().getFullYear() };
    return {
      min: Math.min(...years),
      max: Math.max(...years)
    };
  }, [allCars]);

  // Читаем фильтры из URL или используем значения по умолчанию
  const searchTerm = searchParams.get('search') || '';
  // Множественные фильтры хранятся как строки через запятую (например: "BMW,Audi")
  const makeFilter = searchParams.get('make') ? searchParams.get('make').split(',') : [];
  const modelFilter = searchParams.get('model') ? searchParams.get('model').split(',') : [];
  const bodyTypeFilter = searchParams.get('bodyType') ? searchParams.get('bodyType').split(',') : [];
  const fuelTypeFilter = searchParams.get('fuelType') ? searchParams.get('fuelType').split(',') : [];
  const transmissionFilter = searchParams.get('transmission') ? searchParams.get('transmission').split(',') : [];
  const minPrice = parseInt(searchParams.get('minPrice') || priceRange.min);
  const maxPrice = parseInt(searchParams.get('maxPrice') || priceRange.max);
  const minMileage = parseInt(searchParams.get('minMileage') || mileageRange.min);
  const maxMileage = parseInt(searchParams.get('maxMileage') || mileageRange.max);
  const minYear = parseInt(searchParams.get('minYear') || yearRange.min);
  const maxYear = parseInt(searchParams.get('maxYear') || yearRange.max);
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

  // Функция для получения машин с применением всех фильтров кроме указанного
  const getFilteredCarsExcept = (exceptFilter) => {
    return allCars.filter(car => {
      const matchesSearch = exceptFilter === 'search' ? true : (searchTerm === '' ||
        `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMake = exceptFilter === 'make' ? true : (makeFilter.length === 0 || makeFilter.includes(car.make));
      const matchesModel = exceptFilter === 'model' ? true : (modelFilter.length === 0 || modelFilter.includes(car.model));
      const matchesBodyType = exceptFilter === 'bodyType' ? true : (bodyTypeFilter.length === 0 || bodyTypeFilter.includes(car.bodyType));
      const matchesFuelType = exceptFilter === 'fuelType' ? true : (fuelTypeFilter.length === 0 || fuelTypeFilter.includes(car.fuelType));
      const matchesTransmission = exceptFilter === 'transmission' ? true : (transmissionFilter.length === 0 || transmissionFilter.includes(car.transmission));
      const matchesPrice = exceptFilter === 'price' ? true : (car.price >= minPrice && car.price <= maxPrice);
      const matchesMileage = exceptFilter === 'mileage' ? true : (car.mileage >= minMileage && car.mileage <= maxMileage);
      const matchesYear = exceptFilter === 'year' ? true : (car.year >= minYear && car.year <= maxYear);

      return matchesSearch && matchesMake && matchesModel && matchesBodyType && matchesFuelType && matchesTransmission && matchesPrice && matchesMileage && matchesYear;
    });
  };

  // Фильтруем автомобили
  const filteredCars = allCars.filter(car => {
    const matchesSearch = searchTerm === '' ||
      `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase());

    // Множественные фильтры: если массив пустой - показываем все, иначе проверяем вхождение
    const matchesMake = makeFilter.length === 0 || makeFilter.includes(car.make);
    const matchesModel = modelFilter.length === 0 || modelFilter.includes(car.model);
    const matchesBodyType = bodyTypeFilter.length === 0 || bodyTypeFilter.includes(car.bodyType);
    const matchesFuelType = fuelTypeFilter.length === 0 || fuelTypeFilter.includes(car.fuelType);
    const matchesTransmission = transmissionFilter.length === 0 || transmissionFilter.includes(car.transmission);

    // Фильтруем по диапазону цен
    const matchesPrice = car.price >= minPrice && car.price <= maxPrice;

    // Фильтруем по диапазону пробега
    const matchesMileage = car.mileage >= minMileage && car.mileage <= maxMileage;

    // Фильтруем по диапазону годов
    const matchesYear = car.year >= minYear && car.year <= maxYear;

    return matchesSearch && matchesMake && matchesModel && matchesBodyType && matchesFuelType && matchesTransmission && matchesPrice && matchesMileage && matchesYear;
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

  // Экспортируем отфильтрованные авто для browser control
  useEffect(() => {
    window.currentFilteredCars = {
      cars: sortedCars,
      total: sortedCars.length,
      allCarsTotal: allCars.length,
      timestamp: Date.now()
    };
  }, [sortedCars, allCars]);

  // Вычисляем доступные опции для каждого фильтра с учетом других фильтров
  const uniqueMakes = [...new Set(getFilteredCarsExcept('make').map(car => car.make))].sort();
  const uniqueBodyTypes = [...new Set(getFilteredCarsExcept('bodyType').map(car => car.bodyType))].sort();
  const uniqueFuelTypes = [...new Set(getFilteredCarsExcept('fuelType').map(car => car.fuelType))].sort();
  const uniqueTransmissions = [...new Set(getFilteredCarsExcept('transmission').map(car => car.transmission))].sort();

  // Получаем модели с учетом всех фильтров кроме model
  const availableModels = [...new Set(getFilteredCarsExcept('model').map(car => car.model))].sort();

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
          {/* Фильтры */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">

            {/* Make Filter */}
            <MultiSelect
              id="car-make-filter"
              placeholder="Any Make"
              options={uniqueMakes}
              value={makeFilter}
              onChange={(selectedMakes) => {
                const newParams = new URLSearchParams(searchParams);
                if (selectedMakes.length > 0) {
                  newParams.set('make', selectedMakes.join(','));
                } else {
                  newParams.delete('make');
                }
                // При смене марки сбрасываем фильтр по модели
                newParams.delete('model');
                setSearchParams(newParams);
              }}
            />

            {/* Model Filter */}
            <MultiSelect
              id="car-model-filter"
              placeholder="Any Model"
              options={availableModels}
              value={modelFilter}
              onChange={(selectedModels) => {
                const newParams = new URLSearchParams(searchParams);
                if (selectedModels.length > 0) {
                  newParams.set('model', selectedModels.join(','));
                } else {
                  newParams.delete('model');
                }
                setSearchParams(newParams);
              }}
            />

            {/* Body Type Filter */}
            <MultiSelect
              id="car-body-type-filter"
              placeholder="Any Body Type"
              options={uniqueBodyTypes}
              value={bodyTypeFilter}
              onChange={(selectedBodyTypes) => {
                const newParams = new URLSearchParams(searchParams);
                if (selectedBodyTypes.length > 0) {
                  newParams.set('bodyType', selectedBodyTypes.join(','));
                } else {
                  newParams.delete('bodyType');
                }
                setSearchParams(newParams);
              }}
            />

            {/* Fuel Type Filter */}
            <MultiSelect
              id="car-fuel-type-filter"
              placeholder="Any Fuel Type"
              options={uniqueFuelTypes}
              value={fuelTypeFilter}
              onChange={(selectedFuelTypes) => {
                const newParams = new URLSearchParams(searchParams);
                if (selectedFuelTypes.length > 0) {
                  newParams.set('fuelType', selectedFuelTypes.join(','));
                } else {
                  newParams.delete('fuelType');
                }
                setSearchParams(newParams);
              }}
            />

            {/* Transmission Filter */}
            <MultiSelect
              id="car-transmission-filter"
              placeholder="Any Transmission"
              options={uniqueTransmissions}
              value={transmissionFilter}
              onChange={(selectedTransmissions) => {
                const newParams = new URLSearchParams(searchParams);
                if (selectedTransmissions.length > 0) {
                  newParams.set('transmission', selectedTransmissions.join(','));
                } else {
                  newParams.delete('transmission');
                }
                setSearchParams(newParams);
              }}
            />

            {/* Sort By */}
            <Select
              id="car-sort-filter"
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="year-asc">Year: Oldest First</option>
              <option value="mileage-asc">Mileage: Low to High</option>
              <option value="mileage-desc">Mileage: High to Low</option>
            </Select>
          </div>

          {/* Price, Mileage, Year Range Filters and Clear Button */}
          <div className="flex items-end gap-6">
            {/* Range sliders в grid - занимают основное пространство */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
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

              {/* Year Range */}
              <RangeSlider
                min={yearRange.min}
                max={yearRange.max}
                step={1}
                minValue={minYear}
                maxValue={maxYear}
                onChange={(min, max) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('minYear', min);
                  newParams.set('maxYear', max);
                  setSearchParams(newParams);
                }}
                formatValue={(value) => `${value}`}
                label="Year"
              />
            </div>

            {/* Clear Filters Button - справа, выровнена по низу */}
            <Button
              id="car-clear-filters-btn"
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap"
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

