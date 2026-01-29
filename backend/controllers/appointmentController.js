const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    req.body.user = req.user.id;

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


exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись не найдена'
      });
    }

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

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись не найдена'
      });
    }

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


exports.getAvailableTimes = async (req, res) => {
  try {
    const { date, specialist = 'Доктор Иванов' } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Пожалуйста, укажите дату'
      });
    }

    const allTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

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

exports.confirmAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись не найдена'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'confirmed',
        doctorActionAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при подтверждении записи'
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись не найдена'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        doctorNotes: req.body.notes || 'Запись отменена администратором',
        doctorActionAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при отмене записи'
    });
  }
};


exports.completeAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись не найдена'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        doctorNotes: req.body.notes || 'Прием завершен',
        doctorActionAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при завершении записи'
    });
  }
};


exports.addDoctorNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Пожалуйста, добавьте комментарий'
      });
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись не найдена'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        doctorNotes: notes,
        doctorActionAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении комментария'
    });
  }
};