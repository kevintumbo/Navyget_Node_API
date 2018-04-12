import express from 'express';
import {Stores} from '../models/stores';
import {Users} from '../models/users';
import {ObjectID} from 'mongodb';
import {Items} from '../models/items';
import {Service} from '../models/services';
import {authenticate} from '../middleware/authenticate';
const _ = require('lodash');

const router = express.Router();

// can view a particular store profile (public)
router.get('/:storeId', (req, res) => {
    const storeId = req.params.storeId;
    if (!ObjectID.isValid(storeId)) {
        return res.status(404).send();
    } 
    Stores.findById(storeId).then((store) => {
        if(!store) {
            return res.status(404).send();
        }
        res.send({store});
    }, (e) => {
        res.send(e);
    });
});


// can view my store profile (private) (not)
router.get('/mystore/view', authenticate, (req, res) => {
    const user_id = req.user._id;
    if (req.account != 'business account') {
        return res.status().send({
            message: "Unauthorized account."
        });
    }
    Stores.findOne({_storeAdmin: user_id }).then((store) =>{
        if(!store) {
            return res.status(404).send({
                message: "Store does not exist", 
            });
        }
        res.send({store})
    }, (e) => {
        res.status(400).send(e);
    });
});

// can delete store profile (private)
router.delete('/:storeId', authenticate, (req, res) => {
    const storeId = req.params.storeId;
    if (!ObjectID.isValid(storeId)) {
        return res.status(404).send({
            message: "Invalid Store Id",
        });
    }

    if (req.account != 'business account') {
        return res.status().send({
            message: "Unauthorized account."
        });
    }

    Stores.findByIdAndRemove(storeId).then((store) => {
        if(!store) {
            return res.status(404).send({
                message: "Store does not exist", 
            });
        }
        res.send({
            store,
            message: "store has been deleted"
        });
    }, (e) => {
        res.status(400).send(e);
    });
});

// can edit store profile (private)
router.patch('/:storeId', authenticate, (req, res) => {
    const storeId = req.params.storeId;
    const body = _.pick(req.body, ['store_name', 'store_type', 'store_category', 'location']);
    if (!ObjectID.isValid(storeId)) {
        return res.status(404).send();
    }

    if (req.account != 'business account') {
        return res.status().send({
            message: "Unauthorized account."
        });
    }

    Stores.findByIdAndUpdate(storeId, {$set: body}, {new: true}).then((store) => {
        if(!store) {
            return res.status(404).send({
                message: "Store does not exist", 
            });
        }
        res.send({
            store,
            message: "Store has been updated"
        });
    }, (e) => {
        res.status(400).send(e);
    });
});

// create a item (private)
router.post('/:storeId/item/create', authenticate, (req, res) => {
    
    const storeId = req.params.storeId;
    const storeAdmin = req.user._id;
    const body = _.pick(req.body, ['item_name', 'item_price', 'item_description', 'item_category', 'item_subcategory', 'item_attributes'])

    if (!ObjectID.isValid(storeId)) {
        return res.status(404).send();
    }

    if (req.account != 'business account') {
        return res.status().send({
            message: "Unauthorized account."
        });
    }
    Stores.findOne({_id: storeId}).then((store) => {
        if(!store) {
            return res.status(404).send({
                message: 'Sorry. Store does not exist'
            }); 
        }

        Items.findOne({item_name: body.item_name}).then((duplicate) => {
            if(duplicate) { 
                return Promise.reject({
                    message: 'Sorry. Item already already exists.'
                });
            }
        }).then(() => {
            const item_body = Object.assign({}, body, { _storeId: storeId}, { _storeAdmin: storeAdmin})

            const item = new Items(item_body);
            item.save().then((item) => {
                res.send({
                    item,
                    message: "you have succesfully created the item"
                });
            });
        });    
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// view a item (public)
router.get('/:storeId/item/:itemId', (req, res) => {
    const storeId = req.params.storeId;
    const itemId = req.params.itemId;

    if (!ObjectID.isValid(storeId) || !ObjectID.isValid(itemId)) {
        return res.status(404).send();
    }

    Items.findOne({ _storeId: storeId, _id: itemId }).then((item) => {
        if(!item) {
            return res.status(404).send({
                message: 'Sorry Item does not exist',
            });
        }
        res.send(item);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// update a item (private)business account
router.patch('/:storeId/item/:itemId', authenticate, (req, res) => {
    const storeId = req.params.storeId;
    const itemId = req.params.itemId;
    const storeAdmin = req.user._id;
    const body = _.pick(req.body, ['item_name', 'item_price', 'item_description', 'item_category', 'item_subcategory', 'item_attributes']);

    if (req.account != 'business account') {
        return res.status(400).send({
            message: "Unauthorized account."
        });
    }

    if (!ObjectID.isValid(storeId) || !ObjectID.isValid(itemId)) {
        return res.status(404).send();
    }

    Items.findOneAndUpdate({
        _storeId: storeId, 
        _id: itemId, 
        _storeAdmin: storeAdmin}, 
        {$set: body}, 
        {new: true}).then((item) => {
            if(!item) {
                return res.status(404).send({
                    message: "Item does not exist", 
                });
            }
            res.send({
                item,
                message: "Item has been updated"
            });
        }).catch((e) => {
            res.status(400).send(e);
        });
});

// delete a item (priitemIdvate)
router.delete('/:storeId/item/:itemId', authenticate, (req, res) => {
    const storeId = req.params.storeId;
    const itemId = req.params.itemId;
    const storeAdmin = req.user._id;

    if (req.account != 'business account') {
        return res.status(400).send({
            message: "Unauthorized account."
        });
    }

    if (!ObjectID.isValid(storeId) || !ObjectID.isValid(itemId)) {
        return res.status(404).send();
    }

    Items.findOneAndRemove({
        _storeId: storeId, 
        _id: itemId, 
        _storeAdmin: storeAdmin
    }).then((item) => {
        if(!item) {
            return res.status(404).send({
                message: "Item does not exist", 
            });
        }
        res.send({
            item,
            message: "Item has been deleted"
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// view all items in a store (public)
router.get('/:storeId/items', (req, res) => {
    const storeId = req.params.storeId;
    if (!ObjectID.isValid(storeId)) {
        return res.status(404).send();
    }

    Items.find({_storeId: storeId}).then((items) =>{
        if(!items) {
            return res.status(404).send({
                message: "Items does not exist", 
            });
        }
        res.send(items);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// create a service (private)
router.post('/:storeId/service/create', authenticate, (req, res) => {
    const storeId = req.params.storeId;
    const storeAdmin = req.user._id;
    const body = _.pick(req.body, ['service_name', 'service_price', 'service_description', 'service_category', 'service_subcategory', 'service_attributes']);

    if (!ObjectID.isValid(storeId)) {
        return res.status(404).send();
    }

    if (req.account != 'business account') {
        return res.status(400).send({
            message: "Unauthorized account."
        });
    }

    Stores.findOne({_id: storeId}).then((store) => {
        if(!store) {
            return res.status(404).send({
                message: 'Sorry. Store does not exist'
            }); 
        }

        Service.findOne({service_name: body.service_name}).then((duplicate) => {
            if(duplicate) {
                return Promise.reject({
                    message: 'Sorry. Service already already exists.'
                });
            }
        }).then(() => {
            const service_body = Object.assign({}, body, { _storeId: storeId}, { _storeAdmin: storeAdmin});

            const service = new Service(service_body);
            service.save().then((service) => {
                res.send({
                    service,
                    message: "you have succesfully created the service"
                });
            });
        }).catch((e) => {
             res.status(400).send(e);
        });
    });
});

// view a service (public)
router.get('/:storeId/service/:serviceId', (req, res) => {
    const storeId = req.params.storeId;
    const serviceId = req.params.serviceId;

    if (!ObjectID.isValid(storeId) || !ObjectID.isValid(serviceId)) {
        return res.status(404).send();
    }

    Service.findOne({ _storeId: storeId, _id: serviceId }).then((service) => {
        if(!service) {
            return res.status(404).send({
                message: 'Sorry. That Service does not exist',
            });
        }
        res.send(service);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// update a service (private)
router.patch('/:storeId/service/:serviceId', authenticate, (req, res) => {
    const storeId = req.params.storeId;
    const serviceId = req.params.serviceId;
    const storeAdmin = req.user._id;
    const body = _.pick(req.body, ['service_name', 'service_price', 'service_description', 'service_category', 'service_subcategory', 'service_attributes']);

    if (!ObjectID.isValid(storeId) || !ObjectID.isValid(serviceId)) {
        return res.status(404).send();
    }

    if (req.account != 'business account') {
        return res.status().send({
            message: "Unauthorized account."
        });
    }

    Service.findOneAndUpdate({
        _storeId: storeId, 
        _id: serviceId, 
        _storeAdmin: storeAdmin}, 
        {$set: body}, 
        {new: true}).then((service) => {
            if(!service) {
                return res.status(404).send({
                    message: "Sorry. Service does not exist", 
                });
            }
            res.send({
                service,
                message: "Service has been updated"
            });
        }).catch((e) => {
            res.status(400).send(e);
        });
});

// delete a service (private)
router.delete('/:storeId/service/:serviceId', authenticate, (req, res) => {
    const storeId = req.params.storeId;
    const serviceId = req.params.serviceId;
    const storeAdmin = req.user._id;

    if (!ObjectID.isValid(storeId) || !ObjectID.isValid(serviceId)) {
        return res.status(404).send();
    }

    if (req.account != 'business account') {
        return res.status().send({
            message: "Unauthorized account."
        });
    }

    Service.findOneAndRemove({
        _storeId: storeId, 
        _id: serviceId, 
        _storeAdmin: storeAdmin
    }).then((service) => {
        if(!service) {
            return res.status(404).send({
                message: "Service does not exist", 
            });
        }
        res.send({
            service,
            message: "Service has been deleted"
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// view all services in a store (public)
router.get('/:storeId/services', (req, res) => {
    const storeId = req.params.storeId;
    if (!ObjectID.isValid(storeId)) {
        return res.status(404).send();
    }

    Service.find({_storeId: storeId}).then((services) =>{
        if(!services) {
            return res.status(404).send({
                message: "Services does not exist", 
            });
        }
        res.send(services);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

module.exports = router
