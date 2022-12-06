const path = require('path');
const express = require('express');
const router = express.Router();
const Controller = require(path.resolve(__dirname, 'src', 'controllers','controller'));

router.get('/', Controller.homepage);
router.get('/manage', Controller.checkCookies, Controller.managePage)
router.post('/manage', Controller.tryLogin)
router.post('/add', Controller.addRent)
router.post('/edit', Controller.editRent)
router.post('/update-item', Controller.updateItem)
router.get('/logout', Controller.logoutId)
router.get('/delete-rent/', Controller.deleteRent)
router.get('/rent-list/', Controller.sendRents)
module.exports = router;