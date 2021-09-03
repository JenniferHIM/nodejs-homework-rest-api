const express = require('express')
const router = express.Router()
const cntrl = require('../../controllers/users')
const guard = require('../../helper/guard')


router.post('/register', cntrl.register)
router.post('/login', cntrl.login)
router.post('/logout', guard, cntrl.logout)

module.exports = router