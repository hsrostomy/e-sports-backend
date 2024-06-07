const mongoose = require("mongoose");


var Schema = mongoose.Schema;

const requiredString = {
    type: String,
    required: true,
};

const SubscriptionsSchema = new mongoose.Schema(
    {
        member_name: String,
        plan_id: { type: Schema.Types.ObjectId, ref: "Plans", required: false },
        plan_name: requiredString,
        member_id: { type: Schema.Types.ObjectId, ref: "Members", required: false },
        phone_number: { type: String, default: "" },
        gym_id: { type: Schema.Types.ObjectId, ref: "Gyms", required: false },
        products: [{}],

        sport_index: {
            type: Number,
            default: 0,
        },
        sport_id: { type: Schema.Types.ObjectId, ref: "Sports", required: false },
        plan_price: {
            type: Number,
            default: 0,
        },
        amount_paid: {
            type: Number,
            default: 0,
        },
        remaining_amount: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        fees: {
            type: Number,
            default: 0,
        },
        plan_duration: {
            type: Number,
            default: 0,
        },
        status: {
            type: Number,
            default: 0,
        },
        starting_date: {
            type: Date,
        },
        ending_date: {
            type: Date,
        },
        times_perWeek: {
            type: Object,
            default: {
                "timers_per_week": 0,
                "current_value": 0,
                "presence": [],
            }
        },
    },
    {
        timestamps: true,
        minimize: false,
    },
    { collection: 'Subscriptions' }
);

const Subscriptions = mongoose.model("Subscriptions", SubscriptionsSchema);

module.exports = Subscriptions;

