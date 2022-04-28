'use strict'
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface) => {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash('asdf1234', saltRounds)

    return queryInterface.bulkInsert('Users', [{
      name: 'mr',
      surname: 'jones',
      username: 'mrjones',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: hashedPassword
    }, {
      name: 'mr',
      surname: 'daves',
      username: 'mrdaves',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: hashedPassword
    }], { returning: true }).then((users) => {
      const profiles = users.map(user => ({
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        age: 20,
        occupation: 'Programmer',
        bio: 'Just another programmer',
        gender: 'male'
      }))
      return queryInterface.bulkInsert('Profiles', profiles)
    })
  },

  down: async (queryInterface) => {
    return Promise.all([
      queryInterface.bulkDelete('Users', null, {}),
      queryInterface.bulkDelete('Profiles', null, {})
    ])
  }
}
