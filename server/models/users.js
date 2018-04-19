import mongoose from 'mongoose';
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
import bcrypt from 'bcryptjs';

const UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
    },
    last_name: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 2,
        trim: true,
    },
    email_address: {
        type: String,
        required: true,
        minlength: 5,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email address.'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    account_type: {
        type: String,
        required: true,
    },
    tokens:[{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
    }],
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
    },
    last_login: {
        type: Date,
    },
    login_ip_address: {
        type: String,
    }
});

//restrict user json data returned
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    return _.pick(userObject, ['first_name', 'last_name', 'username', 'email_address', 'account_type']);
};


// Generate authenticaton data
UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
    user.tokens = user.tokens.concat([{access, token}]);

    const currentDate = new Date();
    user.last_login = currentDate;

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    const user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

// finnd user using token
UserSchema.statics.findByToken = function (token) {
    const User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject(e);
    }

   return User.findOne({
        _id: decoded._id,
        'tokens.access': 'auth',
        'tokens.token': token
    });
};

// find user using credentials
UserSchema.statics.findByCredentials = function (email, password) {
    const User = this;

    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

// hash user password before save
UserSchema.pre('save', function (next) {
    const user = this;

    const currentDate = new Date();
    user.updated_at = currentDate;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

const Users = mongoose.model('Users', UserSchema);

module.exports = {Users};
