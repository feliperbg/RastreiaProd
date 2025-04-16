const express = require('express');
const router = express.Router();

/**
 * Handles the logout request.
 * 
 * @route POST /logout
 * @returns {object} Success response with a message.
 */
router.post('/logout', (req, res) => {
    
    // Clear session storage and local storage
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        } else {
            // Clear local storage
            res.locals.localStorage = {};
            // Clear session storage
            req.session = null;
        }
    });
    
    return res.status(200).send({
        status: true,
        msg: "Logout realizado com sucesso."
    });
});



module.exports = router;