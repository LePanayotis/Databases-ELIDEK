const express = require('express');
const  homeController = require('../controllers/home');

const router = express.Router();

router.get('/', homeController.getAll);
router.post('/sf',homeController.fields)
module.exports = router;