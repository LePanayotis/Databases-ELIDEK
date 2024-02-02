const express = require('express');
const  projectsController = require('../controllers/projects');

const router = express.Router();

router.get('/', projectsController.getProjects);
router.post('/', projectsController.filteredProjects);
router.post('/delete', projectsController.deleteProject);
router.post('/add', projectsController.postProject);
router.post('/details', projectsController.getDetails);
router.post('/update', projectsController.postUpdateProject);
router.post('/add_researcher', projectsController.addResearcher);
router.post('/add_field', projectsController.addField);
router.post('/remove_field', projectsController.removeField);
router.post('/remove_researcher', projectsController.removeResearcher);
router.post('/add_report', projectsController.addReport);
router.post('/remove_report', projectsController.removeReport);
module.exports = router;