
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const AccessSchema = new mongoose.Schema(
    { 
        gym_id: { type: Schema.Types.ObjectId, ref: "Gyms",},
        phone_number: {
            type: String,
            default: "",
            requierd: true,
        },
        name: {
            type: String,
            default: "",
            requierd: true,
        },
        password: {
            type: String,
            default: "",
            requierd: true,
        },
        role: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        minimize: false,
    },
);

const Access = mongoose.model("Access", AccessSchema);

module.exports = Access;
