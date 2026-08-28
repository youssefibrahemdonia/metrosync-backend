const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const registerUser = async (email, password) => {
  const existing = await User.findOne({ email });
  if (existing) {
    return { error: 'User already exists.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });

  return { message: 'User registered successfully.', user: { id: user._id, email: user.email } };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  const token = jwt.sign(
    { id: user._id, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, user: { id: user._id, email: user.email, role: 'user' } };
};

module.exports = { registerUser, loginUser };