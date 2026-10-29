const User = require('../models');
const createToken = require('../middleware/auth');

// POST 

// /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { firstName = '', lastName = '', login, password, email = '' } = req.body || {};

    if (!login || !password) {
      return res.status(400).json({ error: 'login and password are required' });
    }

    if (await User.exists({ login: String(login) })) {
      return res.status(409).json({ error: 'A user with that login already exists' });
    }

    // role is intentionally not read from the request body: letting clients
    // choose their own role would let anyone register as an admin.
    // The password is hashed by the User model before it is saved.
    const user = await User.create({
      firstName: String(firstName),
      lastName: String(lastName),
      login: String(login),
      passwordHash: String(password),
      email: String(email),
      role: 'user'
    });

    // A new user is logged in right away, so the response includes a token.
    res
      .status(201)
      .location(`/api/users/${user._id}`)
      .json({ token: createToken(user), user });
  } catch (err) {
    next(err);
  }
};

// /api/users/login
exports.login = async (req, res, next) => {
  try {
    const { login, password } = req.body || {};

    if (!login || !password) {
      return res.status(400).json({ error: 'login and password are required' });
    }

    // String() matters: without it, a body like {"login": {"$ne": null}}
    // becomes a MongoDB operator instead of a username.
    // The password field is hidden by default (select: false), so ask for it.
    const user = await User.findOne({ login: String(login) }).select('+password');

    // Same message whether the login or the password was wrong, so the
    // response doesn't reveal which usernames exist.
    if (!user || !(await user.checkPassword(String(password)))) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }

    res.status(200).json({ token: createToken(user), user });
  } catch (err) {
    next(err);
  }
};

// GET 
// /api/users/:userId
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
