const Joi = require('@hapi/joi')

module.exports = {
  validateUser: (data) => {
    const schema = Joi.object({
      username: Joi.string().required(),
      name: Joi.string().required(),
      surname: Joi.string().required(),
      password: Joi.string().required()
    }).options({ abortEarly: false })

    const { error, value } = schema.validate(data)
    return { error, value }
  }
}
