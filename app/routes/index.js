const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/users/:id', userController.getCheckUser);
router.get('/company/:label', userController.getCompanyData);
router.get('/companies', userController.getCompaniesList);
router.post('/newcompany', userController.postCreateCompany);
router.post('/shares/buy', userController.postBuyShares);
router.post('/user/deposit', userController.postDepositMoney);
router.post('/user/withdraw', userController.postWithdrawMoney);

module.exports = router;