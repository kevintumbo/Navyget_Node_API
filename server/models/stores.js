import mongoose from 'mongoose';

const StoresSchema = mongoose.Schema({
    store_name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    store_type: {
        type: String,
        required: true,
        trim: true,
    },
    store_category: {
        type: String,
        required: true,
        trim: true,
    },
    location: [{
        title: {
            type: String,
            required: true,
        },
        area: {
            type: String,
            required: true,
        },
        physical_address: {
            type: String,
            required: true,
        },
        town_city: {
            type: String,
            required: true,
        },
        county: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        weekdays: {
            type: String,
            required: true,
        },
        satarday: {
            type: String,
            required: true,
        },
        sunday: {
            type: String,
            required: true,
        },
        public_holidays: {
            type: String,
            required: true,
        }
    }],
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
    },
    _storeAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    }
});

// update updated_at
StoresSchema.pre('save', function (next)  {
    const store = this;
    const currentDate = new Date();
    store.updated_at = currentDate;
    next();
});

const Stores = mongoose.model('Stores', StoresSchema);

module.exports = {Stores};
