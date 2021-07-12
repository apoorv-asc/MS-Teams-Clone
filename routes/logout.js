const express = require('express');
const app = express();
const router = express.Router();

// @route   GET logout/
// @desc    Logs out the current user
// @access  Public
router.get("/",function(req,res){

    // Deletes the information of the logged in user from the memory
    req.logOut();
    res.redirect('/login');
});


module.exports = router;