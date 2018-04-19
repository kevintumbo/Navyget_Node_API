import express from 'express';
const _ = require('lodash');
import {ObjectID} from 'mongodb';
import {mongoose} from '../db/mongoose';
import {Stores} from '../models/stores';
import {Users} from '../models/users';
import {authenticate} from '../middleware/authenticate';

const router = express.Router();

// normal user registration
router.post('/user/register', (req, res) => {
    const body = _.pick(req.body, ['first_name', 'last_name', 'username', 'email_address', 'password', 'account_type']);
    if ( body.account_type !== 'normal user' ) {
        res.status(403).send({message: 'Please Select normal user as account type'});
    } else {
        const user = new Users(body);
        user.save().then(() => {
            return user.generateAuthToken();
        }).then((token) => {
            res.header('x-auth', token).send({
                user,
                message: 'Congratulations You have Successfully registered your normal user account'
            });
        }).catch((e) => {
            res.status(400).send(e);
        });
    }
});


// business registration
router.post('/business/register', (req, res) => {
    const user_body = _.pick(req.body, ['first_name', 'last_name', 'username', 'email_address', 'password', 'account_type']);
    const storebody = _.pick(req.body, ['store_name', 'store_type', 'store_category', 'location']);
    if ( user_body.account_type !== 'business account' ) {
        res.status(403).send({message: 'Please Select business account as account type'});
    } else {
        const user = new Users(user_body);
        user.save().then(() => {
            return user.generateAuthToken();
        }).then((token) => {
            Users.findByToken(token).then((user) => {
                if (!user) {
                    return Promise.reject();
                } else {
                    const store_body = Object.assign({}, storebody, {_storeAdmin: user._id});
                    const store = new Stores(store_body);
                    store.save().then((store) => {
                        res.header('x-auth', token).send({
                            user,
                            store,
                            message: 'Congratulations You have Successfully registered your business account'
                        });
                    });
                }
            });
        }).catch((e) => {
            res.status(400).send(e);
        });
    }
});

// login a user {email, password}
router.post('/login', (req, res) => {
    const body = _.pick(req.body, ['email_address', 'password']);

    Users.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({
                user,
                message: 'Congratulations You have Successfully logged into your account'
            });
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// logout a user
router.delete('/logout/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.send({
            message: 'You have been successfully logged out',
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

module.exports = router;
