import mongoose from 'mongoose';

const ServiceSchema = mongoose.Schema({
    service_name: {
        type: String,
        required: true,
        trim: true,
    },
    service_price: {
        type: Number,
        required: true,
    },
    service_description: {
        type: String,
        required: true,
        trim: true,
    },
    service_category: {
        type: String,
        required: true,
    },
    service_subcategory: {
        type: String,
        required: true,
    },
    service_attributes: [{
        attribute_name: {
            type: String,
            required: true,
        },
        attribute_value: {
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
    _storeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    _storeAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

// update updated_at during save
ServiceSchema.pre('save', function (next)  {
    const service = this;
    const currentDate = new Date();
    service.updated_at = currentDate;
    next();
});

// update update_at during update (hehe)
ServiceSchema.pre('findOneAndUpdate', function(next) {
    const service = this;
    service.update({}, {$set: {updated_at: new Date()}});
    next();
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = {Service};
