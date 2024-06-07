

const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const SportsSchema = new mongoose.Schema(
    {
        sport_index: {
            type: Number,
            required: true,
        },
       
        sport_name: {
            type: String,
        },
        gym_id: { type: Schema.Types.ObjectId, ref: "Gyms", required: false },
        sports: [{ type: Schema.Types.ObjectId, ref: "Sports" }],
        Subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscriptions" }],
        plans: [{ type: Schema.Types.ObjectId, ref: "Plans" }],
    },
    {
        timestamps: true,
        minimize: false,
    },
);

const Sports = mongoose.model("Sports", SportsSchema);

module.exports = Sports;
