const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// How much work bcrypt does per hash. Each +1 doubles the time it takes,
// which is what makes stolen hashes slow to crack. 10 is a common default.
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: '',
      trim: true
    },
    lastName: {
      type: String,
      default: '',
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      // Never include the password hash in query results unless a query
      // explicitly asks for it with .select('+password').
      select: false
    },
    passwordUpdatedAt: {
        type: Date,
        default: Date.now,
        trim: true
    },
    lastLoginAt: {
        type: Date,
        default: null,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    phone:{
        type: String,
        default: '',
        trim: true
    }
  },
  {
    collection: 'users',
    versionKey: false
  }
);

// Hash the password whenever it is set or changed, so a plain-text
// password is never written to the database.
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
});

userSchema.methods.checkPassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
