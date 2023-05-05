// Importar modelo de usuario
const User = require('../models/db');
const { getProductById } = require('../models/db');

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await User.getProductById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
