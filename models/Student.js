const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    min: 17,
    max: 30
  },
  phone: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', // Reference to Department
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);