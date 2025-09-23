// Arquivo: router/ReportRouter.js
const express = require('express');
const router = express.Router();
const ReportControl = require('../control/ReportControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');


const jwtMiddleware = new TokenJWTMiddleware();

router.get('/', ReportControl.renderPage);
router.get('/data', jwtMiddleware.validate.bind(jwtMiddleware), ReportControl.getDashboardData);

module.exports = router;