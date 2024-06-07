
const express = require("express")

const middleware = require("../middlewares/middlewares")

const { body, validationResult } = require('express-validator');

const app = express();

app.use(express.json());
let router = express.Router();

const Subscriptions_controller = require("../controllers/Subscriptions")



router.post("/add_new_subscription",
    [
        body("plan_name").notEmpty(),
        body("plan_price").notEmpty().isInt(),
        body("remaining_amount").notEmpty().isInt(),
        body("amount_paid").notEmpty().isInt(),
    ]

    , (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);

        const hasError = !error.isEmpty();

        if (hasError) {
            res.status(422).json({ success: false, message: "Please check all the fields", results: null },);
        } else {
            next();
        }

    }, middleware.verifyToken, Subscriptions_controller.addSubscription)

router.get("/get_subscriptions", middleware.verifyToken, Subscriptions_controller.getSubscriptions)

router.post("/filter_subscriptions", middleware.verifyToken, Subscriptions_controller.filterSubscriptions)

router.post("/set_expierd_members", middleware.verifyToken, Subscriptions_controller.SetExpierdMembers)

router.get("/get_expierd_members", middleware.verifyToken, Subscriptions_controller.getExpierdMembers)

router.post("/filter_expierd_members", middleware.verifyToken, Subscriptions_controller.filterExpierdSubscriptions)

router.post("/add_daily_subscription", middleware.verifyToken, Subscriptions_controller.addDailySubscriptions)

router.post("/get_daily_subscription", middleware.verifyToken, Subscriptions_controller.getDailySub)

router.post("/cancel_subscription", middleware.verifyToken, Subscriptions_controller.cancelSub)

router.post("/add_presence", middleware.verifyToken, Subscriptions_controller.addPresence)

router.post("/paid_remaining", middleware.verifyToken, Subscriptions_controller.paidRemainingAmount)

router.post("/add_client_order", middleware.verifyToken, Subscriptions_controller.addClientSubscription)

router.post("/delete_subscription", middleware.verifyToken, Subscriptions_controller.deleteSubscription)

router.post("/delete_Daily_subscription", middleware.verifyToken, Subscriptions_controller.deleteDailySubscription)


module.exports = router;