const { Profile, User } = require('../models')

module.exports.getProfile = async (req, res) => {
  try {
    const userInstance = await User.findOne({
      where: {
        id: req.params.userId
      },
      attributes: ['id', 'name', 'surname', 'username'],
      include: {
        model: Profile,
        attributes: ['gender', 'age', 'occupation', 'bio']
      }
    })

    const user = userInstance.toJSON()

    res.json(user)
  } catch (err) {
    console.log({ err })
    res.status(404).end()
    console.log(err.stack)
  }
}

module.exports.updateProfile = async () => {}
