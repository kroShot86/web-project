const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Пожалуйста, введите имя'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Пожалуйста, введите email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email']
  },
  password: {
    type: String,
    required: [true, 'Пожалуйста, введите пароль'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Пожалуйста, введите телефон'],
    match: [/^[\+]?[0-9]{10,15}$/, 'Пожалуйста, введите корректный телефон']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  refreshToken: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);



