const express = require('express')
const router = express.Router()
const { validCreateContact, validUpdateContact, validationObjectId, validQuery } = require('./valid-contacts')
const cntrl = require('../../controllers/contacts')
const guard = require('../../helpers/guard')


router.get('/', guard, validQuery, cntrl.getAll)
router.post('/', guard, validCreateContact, cntrl.createContact)

router.get('/:contactId', guard, validationObjectId, cntrl.getById)
router.delete('/:contactId', guard, cntrl.deleteContact)
router.patch('/:contactId', guard, validUpdateContact, cntrl.updContact)
router.put('/:contactId', guard ,validUpdateContact, cntrl.updContactPut)

router.patch('/:contactId/favorite', guard, cntrl.updStatus)

module.exports = router