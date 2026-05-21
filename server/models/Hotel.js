import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hotel name']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  image: {
    type: String
  },
  rating: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  amenities: {
    type: [String],
    default: []
  },
  description: {
    type: String
  },
  roomsAvailable: {
    type: Number,
    default: 50
  }
});

export default mongoose.model('Hotel', HotelSchema);
