const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/company/:label', userController.getCompanyData);
router.get('/companies', userController.getCompaniesList);

module.exports = router;