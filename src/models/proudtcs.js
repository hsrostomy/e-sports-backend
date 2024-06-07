const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const ProductsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        gym_id: { type: Schema.Types.ObjectId, ref: "Gyms", required: false },
        category: {
            type: Number,
        },
        sells: [{ type: Object, required: false }],
        price: {
            type: Number,
            required: true,
        },
        purchase_price: {
            type: Number,
            required: true,
        },
        is_deleted: {
            type: Boolean,
            required: false,
        },
        img_url: {
            type: String,
            required: false,
            default: "",
        },
        code_bar: {
            type: String,
            required: false,
        },
        qnt: {
            type: Number,
            required: true,
        },
        lastSaledAt: {
            type: Date
        },
    },
    {
        timestamps: true,
        minimize: false,
    },
);

const Products = mongoose.model("Products", ProductsSchema);

module.exports = Products;
