const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (request, result) => {
    result.sendFile(path.join(__dirname, 'index.html'));
})

module.exports = router;