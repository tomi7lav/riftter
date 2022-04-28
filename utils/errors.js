class BadRequestError extends Error {
  constructor (error) {
    super(error.message)

    this.data = error
    this.statusCode = 400
  }
}

class ForbiddenRequestError extends Error {
  constructor (error) {
    super(error.message)

    this.data = error
    this.statusCode = 403
  }
}

class UnauthorizedRequestErrror extends Error {
  constructor (error) {
    super(error.message)

    this.data = error
    this.statusCode = 401
  }
}

module.exports = {
  badRequestError: (error) => {
    return new BadRequestError(error)
  },
  forbiddenRequestError: (error) => {
    return new ForbiddenRequestError(error)
  },
  unauthorizedRequestError: (error) => {
    return new UnauthorizedRequestErrror(error)
  }
}
