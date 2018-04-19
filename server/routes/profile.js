import express from 'express';
import {Users} from '../models/users';
import {authenticate} from '../middleware/authenticate';
const _ = require('lodash');

const router = express.Router();


// can retrieve owner's user profile (private)
router.get('/myprofile', authenticate, (req, res) => {
   res.send(req.user);
});

// can edit normal user profile (private)
router.patch('/myprofile', authenticate, (req, res) => {
    const userId = req.user._id;
    const body = _.pick(req.body, ['first_name', 'last_name', 'username', 'email_address', 'password']);
    Users.findByIdAndUpdate(userId, {$set: body}, {new: true}).then((user) => {
        if (!user) {
            return res.status(404).send({
                message: 'User account does not exist',
            });
        }

        res.send({
            user,
            message: 'User profile has been updated'
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});


// can delete user profile (private)

router.delete('/myprofile', authenticate, (req, res) => {
    const userId = req.user._id;
    Users.findByIdAndRemove(userId).then((user) => {
        if (!user) {
            return res.status(404).send({
                message: 'User account does not exist',
            });
        }
        res.send({
            user,
            message: 'user account has been deleted successfully',
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

module.exports = router;
