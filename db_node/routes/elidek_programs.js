const express = require('express');
const  programsController = require('../controllers/programs');

const router = express.Router();

router.get('/', programsController.getPrograms);
router.post('/update/', programsController.postUpdateProgram);
router.post('/add/', programsController.postProgram);
router.post('/delete/', programsController.deleteProgram);
module.exports = router;