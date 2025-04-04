const express = require('express');
const router = express.Router();

router.post('/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false   
    });

    return res.status(200).send({
        status: true,
        msg: "Logout realizado com sucesso."
    });
});

module.exports = router;
