const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getAvailableTimes
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createAppointment)
  .get(authorize('admin'), getAppointments);

router.route('/my').get(getMyAppointments);
router.route('/available-times').get(getAvailableTimes);

router.route('/:id')
  .put(updateAppointment)
  .delete(deleteAppointment);

module.exports = router;