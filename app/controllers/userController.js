const User = require('../models/User');
const { createToken } = require('../middleware/auth');

// POST 

// /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { firstName = '', lastName = '', username, password, email = '' } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    if (await User.exists({ username: String(username) })) {
      return res.status(409).json({ error: 'A user with that username already exists' });
    }

    // role is intentionally not read from the request body: letting clients
    // choose their own role would let anyone register as an admin.
    // The password is hashed by the User model before it is saved.
    const user = await User.create({
      firstName: String(firstName),
      lastName: String(lastName),
      username: String(username),
      passwordHash: String(password),
      email: String(email)
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
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    // String() matters: without it, a body like {"login": {"$ne": null}}
    // becomes a MongoDB operator instead of a username.
    // The password field is hidden by default (select: false), so ask for it.
    const user = await User.findOne({ username: String(username) }).select('+passwordHash');
    // Same message whether the login or the password was wrong, so the
    // response doesn't reveal which usernames exist.
    if (!user || !(await user.checkPassword(String(password)))) {
      return res.status(401).json({ error: 'Invalid username or password' });
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
