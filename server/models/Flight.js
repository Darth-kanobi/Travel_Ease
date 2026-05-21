import mongoose from 'mongoose';

const FlightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: [true, 'Please add a flight number']
  },
  departureCity: {
    type: String,
    required: [true, 'Please add departure city']
  },
  arrivalCity: {
    type: String,
    required: [true, 'Please add arrival city']
  },
  departureTime: {
    type: Date,
    required: [true, 'Please add departure time']
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Please add arrival time']
  },
  price: {
    type: Number,
    required: [true, 'Please add price']
  },
  seatsAvailable: {
    type: Number,
    default: 150
  },
  departureAirport: {
    type: String
  },
  arrivalAirport: {
    type: String
  },
  departureTerminal: {
    type: String,
    default: 'T1'
  },
  arrivalTerminal: {
    type: String,
    default: 'T1'
  },
  airlineName: {
    type: String,
    required: [true, 'Please add airline name']
  }
});

export default mongoose.model('Flight', FlightSchema);
