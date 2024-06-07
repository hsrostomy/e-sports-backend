
const express = require("express")

const middleware = require("../middlewares/middlewares")

const { body, validationResult } = require('express-validator');

const app = express();

app.use(express.json());
let router = express.Router();

const products_controller = require("../controllers/products")


router.post("/add_new_product",
    [

    ]

    , (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);

        const hasError = !error.isEmpty();

        if (hasError) {
            res.status(422).json({ success: false, message: "Please check all the fields", results: null },);
        } else {
            next();
        }

    }, middleware.verifyToken, products_controller.addProduct)


router.post("/get_products", middleware.verifyToken, products_controller.getProductsByStoreID)

router.post("/get_product_by_code_bar", middleware.verifyToken, products_controller.getProductByCodeBar)

router.post("/update_product", middleware.verifyToken, products_controller.updateProduct)

router.post("/sell_product", middleware.verifyToken, products_controller.sellProduct)

router.post("/delete_product", middleware.verifyToken, products_controller.deleteProduct)

router.post("/search_product", middleware.verifyToken, products_controller.SearchForProductBy)

module.exports = router;