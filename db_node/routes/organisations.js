const express = require('express');
const orgsController = require('../controllers/organisations');

const router = express.Router();

router.get('/', orgsController.getOrgs);
router.post('/update', orgsController.postUpdateOrg);
router.post('/delete', orgsController.deleteOrg);
router.post('/add', orgsController.postOrg);
router.post('/details',orgsController.getDetails);
router.post('/delete_telephone', orgsController.deleteTelephone);
router.post('/add_telephone', orgsController.addTelephone);
router.post('/update_budgets', orgsController.updateBudgets);
module.exports = router;