const express = require('express')
const router = express.Router()
const cntrl = require('../../controllers/users')
const guard = require('../../helpers/guard')
const uploadAvatar = require('../../helpers/upload-avatar')


router.post('/register', cntrl.register)
router.post('/login', cntrl.login)
router.post('/logout', guard, cntrl.logout)
router.patch('/avatars', guard, uploadAvatar.single('avatar'), cntrl.updateAvatar)

module.exports = router