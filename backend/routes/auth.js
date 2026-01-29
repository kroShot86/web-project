const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Имя обязательно'),
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
    body('phone').matches(/^[\+]?[0-9]{10,15}$/).withMessage('Введите корректный телефон')
  ],
  register
);

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;