const jwt = require('jsonwebtoken');
require('dotenv').config();
async function loginAdmin(req, res) {
    const { adminId, password } = req.body;
  if (adminId === process.env.ADMIN_ID && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Unauthorized' });
};

module.exports = {
    loginAdmin
};