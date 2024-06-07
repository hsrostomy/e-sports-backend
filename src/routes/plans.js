
const express = require("express")

const middleware = require("../middlewares/middlewares")

const { body, validationResult } = require('express-validator');

const app = express();

app.use(express.json());
let router = express.Router();

const products_controller = require("../controllers/plans")


router.post("/add_new_plan",
    [
        body("plan_name").notEmpty(),
        body("plan_price").notEmpty().isInt(),
    ]

    , (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);

        const hasError = !error.isEmpty();

        if (hasError) {
            res.status(422).json({ success: false, message: "Please check all the fields", results: null },);
        } else {
            next();
        }

    }, middleware.verifyToken, products_controller.addNewPlan)


router.get("/get_plans", middleware.verifyToken, products_controller.getPlans)

router.post("/update_plan", middleware.verifyToken, products_controller.updatePlan)

router.post("/delete_plan", middleware.verifyToken, products_controller.DeletePlan)


module.exports = router;