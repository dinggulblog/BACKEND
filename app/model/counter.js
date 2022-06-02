import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

export const CounterModel = mongoose.model('Counter', CounterSchema);