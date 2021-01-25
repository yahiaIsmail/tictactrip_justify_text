// text.js - text justifier route module.

var express = require('express');
var router = express.Router();
var auth=require("../middleware/check-auth")


// Require controller modules.
var text_controller = require('../controllers/textController');

// POST Get Token for user action.
router.post('/token', text_controller.get_token);

// POST Justify text action.
router.post('/justify',auth, text_controller.justify_text);
module.exports = router;
