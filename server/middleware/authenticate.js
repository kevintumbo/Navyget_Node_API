import {Users} from '../models/users';

//authenticate middleware
const authenticate = (req, res, next) => {
    const token = req.header('x-auth');
    Users.findByToken(token).then((user) => {
        if(!user) {
            return Promise.reject();
        }

        req.user = user;
        req.token = token;
        req.account = user.account_type;
        next();

    }).catch((e) => {
        res.status(401).send(e);
    });
};

module.exports = {authenticate}
