// Car inventory data for Cool Cars Amsterdam
const bmwSedan1 = '/assets/cars/bmw-sedan-1.jpg';
const bmwSedan2 = '/assets/cars/bmw-sedan-2.jpg';
const audiA41 = '/assets/cars/audi-a4-1.jpg';
const audiA42 = '/assets/cars/audi-a4-2.jpg';
const rav41 = '/assets/cars/rav4-1.jpg';
const rav42 = '/assets/cars/rav4-2.jpg';
const accord1 = '/assets/cars/accord-1.jpg';
const accord2 = '/assets/cars/accord-2.jpg';

export const cars = [
  {
    id: 1,
    make: 'BMW',
    model: '3 Series',
    year: 2020,
    price: 32500,
    mileage: 45000,
    images: [bmwSedan1, bmwSedan2],
    description: 'Luxury sedan with premium features and excellent performance. Well-maintained with full service history.',
    features: ['Automatic transmission', 'Leather seats', 'Navigation system', 'Bluetooth connectivity'],
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Silver',
    isHotOffer: true
  },
  {
    id: 2,
    make: 'BMW',
    model: '5 Series',
    year: 2019,
    price: 28900,
    mileage: 52000,
    images: [bmwSedan2, bmwSedan1],
    description: 'Executive sedan with advanced safety features and comfortable interior.',
    features: ['Automatic transmission', 'Premium sound system', 'Parking sensors', 'Climate control'],
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Black',
    isHotOffer: true
  },
  {
    id: 3,
    make: 'Audi',
    model: 'A4',
    year: 2021,
    price: 38500,
    mileage: 32000,
    images: [audiA41, audiA42],
    description: 'Modern luxury sedan with cutting-edge technology and superior comfort.',
    features: ['Quattro AWD', 'Virtual cockpit', 'LED headlights', 'Wireless charging'],
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'White',
    isHotOffer: true
  },
  {
    id: 4,
    make: 'Audi',
    model: 'A4 Avant',
    year: 2020,
    price: 35900,
    mileage: 38000,
    images: [audiA42, audiA41],
    description: 'Versatile wagon with premium features and spacious cargo area.',
    features: ['Quattro AWD', 'Panoramic sunroof', 'Bang & Olufsen sound', 'Adaptive cruise control'],
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Gray',
    isHotOffer: true
  },
  {
    id: 5,
    make: 'Toyota',
    model: 'RAV4',
    year: 2022,
    price: 29900,
    mileage: 25000,
    images: [rav41, rav42],
    description: 'Reliable SUV with excellent fuel economy and advanced safety features. Perfect for Amsterdam city driving and weekend adventures.',
    features: ['AWD', 'Toyota Safety Sense 2.0', 'Apple CarPlay', 'Backup camera', 'LED headlights'],
    fuelType: 'Hybrid',
    transmission: 'CVT',
    color: 'Blueprint Blue',
    isHotOffer: true
  },
  {
    id: 6,
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2021,
    price: 31500,
    mileage: 28000,
    images: [rav42, rav41],
    description: 'Eco-friendly SUV with outstanding fuel efficiency and modern technology.',
    features: ['AWD', 'Hybrid powertrain', 'Wireless charging', 'JBL premium audio'],
    fuelType: 'Hybrid',
    transmission: 'CVT',
    color: 'Silver',
    isHotOffer: true
  },
  {
    id: 7,
    make: 'Honda',
    model: 'Accord',
    year: 2020,
    price: 24500,
    mileage: 42000,
    images: [accord1, accord2],
    description: 'Midsize sedan with spacious interior and excellent reliability record.',
    features: ['Honda Sensing', 'Automatic transmission', 'Dual-zone climate', 'Remote start'],
    fuelType: 'Petrol',
    transmission: 'CVT',
    color: 'White',
    isHotOffer: false
  },
  {
    id: 8,
    make: 'Honda',
    model: 'Accord Sport',
    year: 2021,
    price: 27900,
    mileage: 35000,
    images: [accord2, accord1],
    description: 'Sporty sedan with enhanced performance and premium interior features. Featuring the powerful 1.5T turbo engine.',
    features: ['Sport mode', 'Paddle shifters', 'Bose premium audio', 'Sunroof', 'Honda Sensing Suite'],
    fuelType: 'Petrol',
    transmission: 'CVT',
    color: 'Radiant Red',
    isHotOffer: false
  }
];

export const getHotOffers = () => cars.filter(car => car.isHotOffer);
export const getCarById = (id) => cars.find(car => car.id === parseInt(id));
export const getAllCars = () => cars;