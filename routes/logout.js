const express = require('express');
const app = express();
const router = express.Router();

// @route   GET logout/
// @desc    Logs out the current user
// @access  Public
router.get("/",function(req,res){
    req.logOut();
    res.redirect('/login');
});


module.exports = router;