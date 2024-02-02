const express = require('express');
const  researchersController = require('../controllers/researchers');

const router = express.Router();

router.get('/', researchersController.getResearchers);
router.post('/update',researchersController.postUpdateResearcher);
router.post('/add',researchersController.postResearcher);
router.post('/delete',researchersController.deleteResearcher);
router.post('/details',researchersController.getDetails);
router.post('/append_project',researchersController.appendProject);
router.post('/remove_project',researchersController.popProject);
module.exports = router;