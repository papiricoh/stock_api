const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/users/:id', userController.getCheckUser);
router.get('/group/:id', userController.getGroupById);
router.get('/company/:label', userController.getCompanyData);
router.get('/companies', userController.getCompaniesList);
router.get('/groups', userController.getGroupsList);
router.post('/newcompany', userController.postCreateCompany); //name, label, owner_id, total_shares, initial_money, percentage_sold
router.post('/shares/buy', userController.postBuyShares); //company_label, player_id, quantity,
router.post('/shares/sell', userController.postSellShares); //company_label, player_id, quantity,
router.post('/user/deposit', userController.postDepositMoney); //player_id, deposit
router.post('/user/withdraw', userController.postWithdrawMoney); //player_id, withdraw

module.exports = router;