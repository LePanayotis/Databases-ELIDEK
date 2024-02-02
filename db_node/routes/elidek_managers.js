const express = require('express');
const  managersController = require('../controllers/managers');

const router = express.Router();

router.get('/', managersController.getManagers);
router.post('/update/', managersController.postUpdateManager)
router.post('/add/', managersController.postManager)
router.post('/delete/', managersController.deleteManager)

module.exports = router;