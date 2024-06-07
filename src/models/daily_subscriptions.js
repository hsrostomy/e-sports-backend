const mongoose = require("mongoose");


var Schema = mongoose.Schema;

const requiredString = {
    type: String,
    required: true,
};

const DailySubscriptionsSchema = new mongoose.Schema(
    {
        time: { type: String },
        Subscriptions: [
            {
                type: Object,
            },
        ],
        Date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        minimize: false,
    },
    { collection: 'Daily_Subscriptions' }
);

const DailySubscriptions = mongoose.model("Daily_Subscriptions", DailySubscriptionsSchema);

module.exports = DailySubscriptions;

