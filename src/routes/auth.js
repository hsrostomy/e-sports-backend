const auth_controller = require("../controllers/auth")
const express = require("express")
const { body, validationResult } = require('express-validator');
let router = express.Router();

const middleware = require("../middlewares/middlewares")

const app = express();

app.use(express.json());

router.post("/register",
    [
        body("gym_name").notEmpty(), body("password").notEmpty(),
        body("phone_number").notEmpty(),
    ]

    , (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);

        const hasError = !error.isEmpty();

        if (hasError) {
            res.status(422).json({ success: false, message: "Please check all the fields", results: null },);
        } else {
            next();
        }

    }, auth_controller.register)

router.route("/login").post(auth_controller.login);

router.route("/check_number").post(auth_controller.checkPhoneNumber);

router.route("/change_password").post(middleware.verifyToken, auth_controller.updatePassowrd);

router.route("/forget_password").post(auth_controller.forgetPassowrd);


router.route("/check_password").post(middleware.verifyToken,auth_controller.checkPassword);

router.route("/updateFees").post(middleware.verifyToken,auth_controller.updateFeesOfSignIn);


module.exports = router;
