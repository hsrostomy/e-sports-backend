
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const PlansSchema = new mongoose.Schema(
    {
        plan_name: {
            type: String,
        },
        gym_id: { type: Schema.Types.ObjectId, ref: "Gyms", required: false },
        sport_id: { type: Schema.Types.ObjectId, ref: "Sports", required: false },
        Subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscriptions", required: false }],
        sub_plans: [{}],
        plan_desc: {
            type: String,
            default: ""
        },
        plan_price: {
            type: Number,
            required: true,
        },
        period_of_duration: {
            type: Number,
            required: false,
        },
        times_perWeek: {
            type: Object,
            default: {
                "timers_per_week": 0,
                "current_value": 0
            }
        },
    },
    {
        timestamps: true,
        minimize: false,
    },
);

const Plans = mongoose.model("Plans", PlansSchema);

module.exports = Plans;
