const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerUser, loginUser } = require('../services/userService');
const { loginLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const credentialsValidation = [
  body('email').isEmail().withMessage('A valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
];

router.post(
  '/register',
  credentialsValidation,
  validate,
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const result = await registerUser(email, password);

    if (result.error) {
      return next(new AppError(result.error, 400));
    }

    res.status(201).json(result);
  })
);

router.post(
  '/login',
  loginLimiter,
  credentialsValidation,
  validate,
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    if (!result) {
      return next(new AppError('Invalid email or password.', 401));
    }

    res.json(result);
  })
);

module.exports = router;