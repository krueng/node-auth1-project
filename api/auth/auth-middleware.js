const bcrypt = require('bcryptjs')
const User = require('../users/users-model')
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
  if (!req.session.user) {
    next({
      status: 401,
      message: 'You shall not pass!'
    })
  } else (
    next()
  )
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  const { username } = req.body
  const [user] = await User.findBy({ username })
  if (user) {
    return next({
      status: 422,
      message: 'Username taken'
    })
  }
  next()
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  const { username } = req.body
  const [user] = await User.findBy({ username })
  if (!user) {
    return next({
      status: 401,
      message: 'Invalid credentials'
    })
  }
  next()
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  const { password } = req.body
  // const [user] = await User.findBy({ username })
  if (!password || password.length < 4) {
    return next({
      status: 422,
      message: 'Password must be longer than 3 chars'
    })
  }
  next()
}

async function passwordCheck(req, res, next) {
  const { username, password } = req.body
  const [user] = await User.findBy({ username })
  const comparePassword = bcrypt.compareSync(password, user.password)
  if (!comparePassword) {
    return next({
      status: 401,
      message: 'Invalid credentials'
    })
  }
  next()
}

// Don't forget to add these to the `exports` object so they can be required in other modules

module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
  passwordCheck,
}

