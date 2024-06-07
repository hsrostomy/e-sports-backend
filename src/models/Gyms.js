const mongoose = require("mongoose");


var Schema = mongoose.Schema;

const requiredString = {
    type: String,
    required: false,
};

const GymSchema = new mongoose.Schema(
    {
        owner_full_name: requiredString,

        gym_name: requiredString,

        password: requiredString,

        phone_number: requiredString,

        email: requiredString,

        address: { type: String, },

        products: [{ type: Schema.Types.ObjectId, ref: "Products" }],

        members: [{ type: Schema.Types.ObjectId, ref: "Members" }],

        Subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscriptions" }],

        Daily_Subscriptions: [{ type: Schema.Types.ObjectId, ref: "Daily_Subscriptions" }],

        access: [{ type: Schema.Types.ObjectId, ref: "Access" }],

        sports: [{ type: Schema.Types.ObjectId, ref: "Sports" }],

        payments: [{ type: Schema.Types.ObjectId, ref: "Payments" }],

        sms_messages_monthly: [{}],

        daily_subscriptions: [{ type: Object }],

        notifications: [{ type: Object }],

        commune: requiredString,

        wilaya: requiredString,
        profile_pic: String,
        created_at: {
            type: Date,
            default: Date.now,
        },
        location: { type: Object, },
        sigin_fees: {
            type: Number,
            required: false,
        },
        deleted: {
            string: Boolean,
            default: false,
        },

        subscribed: {
            string: Boolean,
            default: false,
        },

        active: false,

        account_status: {
            type: Number,
            default: 1,
        },

        device_token: {
            type: String,
            default: "",
        },

        ratings: [
            {
                userID: { type: String, required: true },
                rating: Number,
            },
        ],
        avg_rating: Number,
    },
    {
        timestamps: true,
        minimize: false,
    },
    { collection: 'Gyms' }
);

const Gyms = mongoose.model("Gyms", GymSchema);

module.exports = Gyms;

