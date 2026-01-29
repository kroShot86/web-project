const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getAvailableTimes,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  addDoctorNotes
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createAppointment);

router.route('/my')
  .get(getMyAppointments);

router.route('/available-times')
  .get(getAvailableTimes);

router.route('/:id')
  .put(updateAppointment)
  .delete(deleteAppointment);

router.route('/')
  .get(authorize('admin'), getAppointments);

router.put('/:id/confirm', authorize('admin'), confirmAppointment);
router.put('/:id/cancel', authorize('admin'), cancelAppointment);
router.put('/:id/complete', authorize('admin'), completeAppointment);
router.put('/:id/notes', authorize('admin'), addDoctorNotes);

module.exports = router;