const mongoose = require("mongoose");


var Schema = mongoose.Schema;

const requiredString = {
    type: String,
    required: true,
};

const PaymentsSchema = new mongoose.Schema(
    {
        pack_price: {
            type: Number,
            requierd: true,
        },
        pack_id: {
            type: Number,
            requierd: true,
        },
        starting_date: {
            type: Date,
            requierd: false,
        },
        expiry_date: {
            type: Date,
            requierd: false,
        },
        gym_id: { type: Schema.Types.ObjectId, ref: "Gyms" },
    },
    {
        timestamps: true,
        minimize: false,
    },
    { collection: 'Payments' }
);

const Payments = mongoose.model("Payments", PaymentsSchema);

module.exports = Payments;

