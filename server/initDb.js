import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import connectDB from './database.js';
import Hotel from './models/Hotel.js';
import Flight from './models/Flight.js';
import User from './models/User.js';
import Review from './models/Review.js';
import Booking from './models/Booking.js';

dotenv.config();

const hotelSeeds = [
  // Mumbai
  {
    name: 'Taj Mahal Palace',
    city: 'Mumbai',
    location: 'Colaba, Mumbai',
    image: 'TAJ MAHAL HOTEL MUMBAI.jpg',
    rating: 4.9,
    price: 15000.00,
    amenities: ['Pool', 'Spa', 'Restaurant', 'Free WiFi', 'Bar'],
    description: 'An iconic landmark of Mumbai, overlooking the Gateway of India, offering rich history and legendary hospitality.',
    roomsAvailable: 50
  },
  {
    name: 'The Oberoi Mumbai',
    city: 'Mumbai',
    location: 'Nariman Point, Mumbai',
    image: 'OBEROI MUMBAI.jpg',
    rating: 4.8,
    price: 14000.00,
    amenities: ['Pool', 'Gym', 'Restaurant', 'Ocean View', 'Free WiFi'],
    description: 'A sanctuary of style and luxury in the heart of Mumbai, with stunning views of the Arabian Sea.',
    roomsAvailable: 50
  },
  {
    name: 'Trident Nariman Point',
    city: 'Mumbai',
    location: 'Nariman Point, Mumbai',
    image: 'TRIDENT NARIMAN MUMBAI.jpg',
    rating: 4.5,
    price: 9500.00,
    amenities: ['Pool', 'Gym', 'Restaurant', 'Free WiFi', 'Bar'],
    description: 'Offering unmatched views of Marine Drive and the Queen\'s Necklace, popular for both business and leisure.',
    roomsAvailable: 50
  },
  {
    name: 'Four Seasons Hotel Mumbai',
    city: 'Mumbai',
    location: 'Worli, Mumbai',
    image: 'FOUR SEASON MUMBAI.jpg',
    rating: 4.6,
    price: 12000.00,
    amenities: ['Pool', 'Spa', 'Rooftop Bar', 'Restaurant', 'Free WiFi'],
    description: 'A sleek modern oasis in Mumbai\'s business district, featuring a premium rooftop lounge with panoramic views.',
    roomsAvailable: 50
  },
  // Delhi
  {
    name: 'Taj Palace New Delhi',
    city: 'Delhi',
    location: 'Diplomatic Enclave, New Delhi',
    image: 'TAJ PALACE NEW DELHI.jpg',
    rating: 4.8,
    price: 13000.00,
    amenities: ['Pool', 'Spa', 'Fine Dining', 'Free WiFi', 'Lounge'],
    description: 'Nestled in the prestigious Diplomatic Enclave, Taj Palace stands as a tribute to royal hospitality and luxury.',
    roomsAvailable: 50
  },
  {
    name: 'The Oberoi New Delhi',
    city: 'Delhi',
    location: 'Dr. Zakir Hussain Marg, New Delhi',
    image: 'THE OBEROI DELHI.jpg',
    rating: 4.9,
    price: 16000.00,
    amenities: ['Pool', 'Spa', 'Gym', 'Air Purifier', 'Free WiFi'],
    description: 'Overlooking the Humayun\'s Tomb, this luxury hotel features state-of-the-art air purification and exemplary service.',
    roomsAvailable: 50
  },
  {
    name: 'The Leela Palace New Delhi',
    city: 'Delhi',
    location: 'Chanakyapuri, New Delhi',
    image: 'THE LEELA PALACE NEW DELHI.jpg',
    rating: 4.8,
    price: 15500.00,
    amenities: ['Rooftop Pool', 'Spa', 'Restaurant', 'Free WiFi', 'Butler Service'],
    description: 'A majestic blend of Lutyens architecture and Indian heritage, located in the diplomatic Chanakyapuri.',
    roomsAvailable: 50
  },
  {
    name: 'The Imperial New Delhi',
    city: 'Delhi',
    location: 'Janpath, New Delhi',
    image: 'THE IMPERIAL NEW DELHI.jpg',
    rating: 4.7,
    price: 12500.00,
    amenities: ['Pool', 'Spa', 'Museum', 'Bar', 'Free WiFi'],
    description: 'An award-winning heritage hotel combining rich Victorian style with luxury amenities near Connaught Place.',
    roomsAvailable: 50
  },
  // Bangalore
  {
    name: 'Taj West End',
    city: 'Bangalore',
    location: 'Race Course Road, Bangalore',
    image: 'TAJ WEST END BANGALORE.jpg',
    rating: 4.7,
    price: 11000.00,
    amenities: ['Pool', 'Spa', 'Heritage Gardens', 'Bar', 'Free WiFi'],
    description: 'Set amidst 20 acres of flora, this heritage hotel offers a serene getaway in the center of the garden city.',
    roomsAvailable: 50
  },
  {
    name: 'The Ritz-Carlton, Bangalore',
    city: 'Bangalore',
    location: 'Residency Road, Bangalore',
    image: 'THE RITZ CARLTON BANGALORE.jpg',
    rating: 4.8,
    price: 13500.00,
    amenities: ['Pool', 'Spa', 'Rooftop Bar', 'Free WiFi', 'Lounge'],
    description: 'Expressing contemporary elegance with local design features, boasting stunning views of downtown Bangalore.',
    roomsAvailable: 50
  },
  {
    name: 'Conrad Bengaluru',
    city: 'Bangalore',
    location: 'Ulsoor, Bangalore',
    image: 'CONARD BANGALORE.jpg',
    rating: 4.6,
    price: 9000.00,
    amenities: ['Pool', 'Spa', 'Lake View', 'Restaurant', 'Free WiFi'],
    description: 'Soaring 24 stories above the Ulsoor Lake, providing smart luxury rooms and multi-cuisine dining options.',
    roomsAvailable: 50
  },
  {
    name: 'JW Marriott Hotel Bengaluru',
    city: 'Bangalore',
    location: 'Vittal Mallya Road, Bangalore',
    image: 'JW MARRIOTT BANGALORE.jpg',
    rating: 4.7,
    price: 11500.00,
    amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Free WiFi'],
    description: 'Located adjacent to the beautiful Cubbon Park, offering luxury rooms and easy access to UB City.',
    roomsAvailable: 50
  },
  // Hyderabad
  {
    name: 'Taj Falaknuma Palace',
    city: 'Hyderabad',
    location: 'Engine Bowli, Hyderabad',
    image: 'TAJ FALAKNUMA PALACE.jpg',
    rating: 4.9,
    price: 25000.00,
    amenities: ['Pool', 'Spa', 'Historical Tour', 'Fine Dining', 'Free WiFi'],
    description: 'A magnificent palace of the Nizam, perched 2000 feet above Hyderabad, offering royal heritage hospitality.',
    roomsAvailable: 50
  },
  {
    name: 'ITC Kohenur',
    city: 'Hyderabad',
    location: 'HITEC City, Hyderabad',
    image: 'ITC KOHENUR HYDERABAD.jpg',
    rating: 4.7,
    price: 10500.00,
    amenities: ['Pool', 'Spa', 'Lake View', 'Gym', 'Free WiFi'],
    description: 'A luxury business hotel overlooking Durgam Cheruvu Lake, offering eco-friendly luxury in HITEC City.',
    roomsAvailable: 50
  },
  {
    name: 'Taj Krishna',
    city: 'Hyderabad',
    location: 'Banjara Hills, Hyderabad',
    image: 'TAJ KRISHNA HYDERABAD.jpg',
    rating: 4.6,
    price: 8500.00,
    amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Free WiFi'],
    description: 'Nestled in the prestigious Banjara Hills, surrounded by manicured lawns and featuring premium restaurants.',
    roomsAvailable: 50
  },
  {
    name: 'The Park Hyderabad',
    city: 'Hyderabad',
    location: 'Somajiguda, Hyderabad',
    image: 'THE PARK HYDERABAD.jpg',
    rating: 4.3,
    price: 6500.00,
    amenities: ['Pool', 'Nightclub', 'Lake View', 'Restaurant', 'Free WiFi'],
    description: 'A modern boutique hotel featuring futuristic design and a spectacular view of Hussain Sagar Lake.',
    roomsAvailable: 50
  },
  // Kochi
  {
    name: 'Taj Malabar Resort & Spa',
    city: 'Kochi',
    location: 'Willingdon Island, Kochi',
    image: 'TAJ MALABAR RESORT KOCHI.jpg',
    rating: 4.7,
    price: 10000.00,
    amenities: ['Pool', 'Spa', 'Harbor View', 'Yacht Tour', 'Free WiFi'],
    description: 'Perched on Willingdon Island, offering glorious views of Kochi harbor and standard luxury heritage.',
    roomsAvailable: 50
  },
  {
    name: 'Forte Kochi',
    city: 'Kochi',
    location: 'Fort Kochi, Kochi',
    image: 'FORTE KOCHI.jpg',
    rating: 4.6,
    price: 7500.00,
    amenities: ['Pool', 'Restaurant', 'Heritage Building', 'Free WiFi', 'Bar'],
    description: 'A beautifully restored 19th-century Dutch-style boutique hotel in the heart of historic Fort Kochi.',
    roomsAvailable: 50
  },
  {
    name: 'Brunton Boatyard',
    city: 'Kochi',
    location: 'Fort Kochi, Kochi',
    image: 'BRUNTON BOATYARD.jpg',
    rating: 4.7,
    price: 11000.00,
    amenities: ['Pool', 'Spa', 'Sea View', 'History Tour', 'Free WiFi'],
    description: 'Built on the site of a historic shipyard, reflecting the colonial Portuguese and Dutch history of Kochi.',
    roomsAvailable: 50
  },
  {
    name: 'Grand Hyatt Kochi Bolgatty',
    city: 'Kochi',
    location: 'Bolgatty Island, Kochi',
    image: 'GRANT HYATT KOCHI BOLGATTY.jpg',
    rating: 4.8,
    price: 12500.00,
    amenities: ['Indoor/Outdoor Pool', 'Spa', 'Lake View', 'Lounge', 'Free WiFi'],
    description: 'A waterfront resort on Bolgatty Island offering panoramic views of Lake Vembanad and premium amenities.',
    roomsAvailable: 50
  }
];

const airlines = [
  { name: 'Air India', codePrefix: 'AI' },
  { name: 'IndiGo', codePrefix: '6E' },
  { name: 'Vistara', codePrefix: 'UK' },
  { name: 'SpiceJet', codePrefix: 'SG' }
];

const cities = [
  { name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Intl Airport' },
  { name: 'Delhi', code: 'DEL', airport: 'Indira Gandhi Intl Airport' },
  { name: 'Bangalore', code: 'BLR', airport: 'Kempegowda Intl Airport' },
  { name: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi Intl Airport' },
  { name: 'Kochi', code: 'COK', airport: 'Cochin Intl Airport' }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Clearing existing data...');
    await Hotel.deleteMany({});
    await Flight.deleteMany({});
    // Keep users, reviews, bookings intact or clear bookings/reviews since IDs will change:
    await Review.deleteMany({});
    await Booking.deleteMany({});

    console.log('Inserting Hotels...');
    await Hotel.insertMany(hotelSeeds);

    console.log('Generating Flight seeds...');
    const flightSeeds = [];
    const today = new Date();

    for (let dayOffset = 0; dayOffset <= 10; dayOffset++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + dayOffset);
      const dateStr = flightDate.toISOString().split('T')[0];

      for (let i = 0; i < cities.length; i++) {
        for (let j = 0; j < cities.length; j++) {
          if (i === j) continue;

          const fromCity = cities[i];
          const toCity = cities[j];

          // Generate 2 flights per route per day
          for (let flightIndex = 1; flightIndex <= 2; flightIndex++) {
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            const flightNum = `${airline.codePrefix}-${Math.floor(100 + Math.random() * 900)}`;

            // Flight times: morning (8 AM) and evening (6 PM)
            const depHour = flightIndex === 1 ? 8 + Math.floor(Math.random() * 3) : 17 + Math.floor(Math.random() * 3);
            const departureTime = new Date(`${dateStr}T${String(depHour).padStart(2, '0')}:00:00Z`);
            
            // Arrival is dep time + 2h 15m to 2h 45m
            const arrivalTime = new Date(departureTime.getTime() + (2 * 60 + 15 + Math.floor(Math.random() * 30)) * 60 * 1000);

            const price = 3500 + Math.floor(Math.random() * 4000);
            const seats = 100 + Math.floor(Math.random() * 80);
            const depTerminal = `T${1 + Math.floor(Math.random() * 3)}`;
            const arrTerminal = `T${1 + Math.floor(Math.random() * 3)}`;

            flightSeeds.push({
              flightNumber: flightNum,
              departureCity: fromCity.name,
              arrivalCity: toCity.name,
              departureTime,
              arrivalTime,
              price,
              seatsAvailable: seats,
              departureAirport: fromCity.airport,
              arrivalAirport: toCity.airport,
              departureTerminal: depTerminal,
              arrivalTerminal: arrTerminal,
              airlineName: airline.name
            });
          }
        }
      }
    }

    console.log('Inserting Flights...');
    await Flight.insertMany(flightSeeds);

    console.log(`Inserted ${hotelSeeds.length} hotels and ${flightSeeds.length} flights!`);
    console.log('Database initialized and seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding MongoDB:', error);
    process.exit(1);
  }
}

seedDatabase();
