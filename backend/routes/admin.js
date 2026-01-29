const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Все маршруты требуют авторизации и прав администратора
router.use(protect);
router.use(authorize('admin'));


router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении пользователей'
    });
  }
});


router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Неверная роль пользователя'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка при изменении роли:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при изменении роли'
    });
  }
});


router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Проверяем, есть ли у пользователя активные записи
    const activeAppointments = await Appointment.find({
      user: req.params.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя удалить пользователя с активными записями'
      });
    }

    await Appointment.deleteMany({ user: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении пользователя'
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments
    ] = await Promise.all([
      User.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: await User.countDocuments({ role: 'admin' }),
          regular: await User.countDocuments({ role: 'user' })
        },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики'
    });
  }
});

module.exports = router;