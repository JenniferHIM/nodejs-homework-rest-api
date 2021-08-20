const fs = require('fs/promises')
const contacts = require('./contacts.json')
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const contactsPath = path.join(__dirname, 'contacts.json')

const listContacts = async () => await fs.readFile(contactsPath).then(data => JSON.parse(data))

const getContactById = async (contactId) => {
  const users = await listContacts()
  const user = users.find(item => String(item.id) === String(contactId))
  return user
}

const removeContact = async (contactId) => {
  const user = await getContactById(contactId)
  const contactsList = await listContacts()
  const updateContactsList = contactsList.filter(contact => String(contact.id) !== String(contactId))
  await fs.writeFile(contactsPath, JSON.stringify(updateContactsList))
  return user
}

const addContact = async (body) => {
  const user = {
    "id": uuidv4(),
    ...body
  }
  const contactsList = await listContacts()
  contactsList.push(user)
  await fs.writeFile(contactsPath, JSON.stringify(contacts))
  return user
}

const updateContact = async (contactId, body) => {
  const user = await getContactById(contactId)
  Object.assign(user, body)
  const contactsList = await listContacts()
  const updateContactsList = contactsList.filter(contact => String(contact.id) !== String(contactId))
  updateContactsList.push(user)
  await fs.writeFile(contactsPath, JSON.stringify(updateContactsList))
  return user.id ? user : null
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
