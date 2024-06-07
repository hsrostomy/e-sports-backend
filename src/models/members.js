const mongoose = require("mongoose");


var Schema = mongoose.Schema;

const requiredString = {
    type: String,
    required: true,
};

const MemberSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            default: ""
        },
        second_name: {
            type: String,
            default: ""
        },
        phone_number: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        gender: {
            type: Number,
            default: 0,
        },
        subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscriptions" }],
        profile_pic: String,
        qr_pic: String,
        location: { type: Object, },
        deleted: {
            string: Boolean,
            default: false,
        },
        active: false,
        status: {
            type: Number,
            default: 2,
        },
        member_id: {
            type: String,
            default: "",
        },
        gym_uid: {
            type: Schema.Types.ObjectId,
            default: ""
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        birthday: {
            type: String,
            default: ""
        },
    },
    {
        timestamps: true,
        minimize: false,
    },
    { collection: 'Members' }
);

const Members = mongoose.model("Members", MemberSchema);

module.exports = Members;

