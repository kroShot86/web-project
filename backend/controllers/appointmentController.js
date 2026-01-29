const Appointment = require('../models/Appointment');

// @desc    Создать запись
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    req.body.user = req.user.id;

    // Проверяем, есть ли уже запись на это время
    const existingAppointment = await Appointment.findOne({
      date: req.body.date,
      time: req.body.time,
      specialist: req.body.specialist
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Это время уже занято'
      });
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании записи'
    });
  }
};

// @desc    Получить все записи пользователя
// @route   GET /api/appointments/my
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .sort('-date')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении записей'
    });
  }
};

// @desc    Получить все записи (для админа)
// @route   GET /api/appointments
// @access  Private/Admin
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort('-date')
      .populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении записей'
    });
  }
};

// @desc    Обновить запись
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись не найдена'
      });
    }

    // Проверяем, что пользователь является владельцем записи или админом
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для изменения этой записи'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении записи'
    });
  }
};

// @desc    Удалить запись
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись не найдена'
      });
    }

    // Проверяем, что пользователь является владельцем записи или админом
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для удаления этой записи'
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении записи'
    });
  }
};

// @desc    Получить доступные времена
// @route   GET /api/appointments/available-times
// @access  Public
exports.getAvailableTimes = async (req, res) => {
  try {
    const { date, specialist = 'Доктор Иванов' } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Пожалуйста, укажите дату'
      });
    }

    // Все возможные времена
    const allTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    // Находим занятые времена на эту дату
    const bookedAppointments = await Appointment.find({
      date: new Date(date),
      specialist,
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedTimes = bookedAppointments.map(app => app.time);
    const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));

    res.status(200).json({
      success: true,
      date,
      specialist,
      availableTimes,
      bookedTimes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении доступных времен'
    });
  }
};