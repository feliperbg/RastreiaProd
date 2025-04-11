const express = require('express');
const router = express.Router();

router.post('/logout', (req, res) => {
    
    return res.status(200).send({
        status: true,
        msg: "Logout realizado com sucesso."
    });
});

module.exports = router;
