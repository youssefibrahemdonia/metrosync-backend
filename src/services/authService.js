const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const loginAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (!admin) return null;

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return null;

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, admin: { id: admin._id, email: admin.email, role: admin.role } };
};

module.exports = { loginAdmin };