const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  hod: {
    type: String,
    required: true
  },
  building: String
}, {
  timestamps: true // Adds createdAt, updatedAt
});

module.exports = mongoose.model('Department', departmentSchema);