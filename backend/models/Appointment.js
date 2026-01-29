const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialist: {
    type: String,
    required: true,
    default: 'Доктор Иванов'
  },
  date: {
    type: Date,
    required: [true, 'Пожалуйста, выберите дату']
  },
  time: {
    type: String,
    required: [true, 'Пожалуйста, выберите время'],
    enum: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
  },
  service: {
    type: String,
    required: [true, 'Пожалуйста, выберите услугу'],
    enum: ['Консультация', 'Диагностика', 'Лечение', 'Обследование']
  },
  notes: {
    type: String,
    maxlength: [500, 'Примечание не должно превышать 500 символов']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  doctorNotes: {
    type: String,
    maxlength: [1000, 'Комментарий врача не должен превышать 1000 символов']
  },
  doctorActionAt: {
    type: Date
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);