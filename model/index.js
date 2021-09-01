const Contacts = require('./schemas/contact')

const listContacts = async () => {
  const result = await Contacts.find()
  return result
}

const getContactById = async (contactId) => {
  const result = await Contacts.findOne({_id: contactId})
  return result
}

const removeContact = async (contactId) => {
 const result = await Contacts.findByIdAndRemove({_id: contactId})
  return result
}

const addContact = async (body) => {
  const result = await Contacts.create(body)
  return result
}

const updateContact = async (contactId, body) => {
  const result = await Contacts.findByIdAndUpdate(
    { _id: contactId },
    { ...body },
    { new: true })
  return result
}

const updateStatusContact = async (contactId, body) => {
  const result = await Contacts.findByIdAndUpdate(
    { _id: contactId },
    { ...body },
    { new: true })
  return result
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
}
