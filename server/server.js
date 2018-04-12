require('./config/config');

import express from 'express';
import bodyParser from 'body-parser';
import {ObjectID} from 'mongodb';
import {mongoose} from './db/mongoose';
import {Stores} from './models/stores';
import {Users} from './models/users';
import {authenticate} from './middleware/authenticate';
import authenticationRoutes from './routes/auth';
import userProfileRoutes from './routes/profile';
import storeProfileRoutes from './routes/store'

const _ = require('lodash');

const app = express();
const port  = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/navyget-api/v1/auth', authenticationRoutes);
app.use('/navyget-api/v1/user', userProfileRoutes);
app.use('/navyget-api/v1/store', storeProfileRoutes);

app.listen(port, () => {
    console.log(`Started Navyget on port ${port}`);
});
