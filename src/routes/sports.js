
const express = require("express")

const middleware = require("../middlewares/middlewares")

const { body, validationResult } = require('express-validator');

const app = express();

app.use(express.json());
let router = express.Router();

const sports_controller = require("../controllers/sports")


router.post("/add_new_sport",
    [
        body("sport_index").notEmpty(),
    ],(req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);

        const hasError = !error.isEmpty();

        if (hasError) {
            res.status(422).json({ success: false, message: "Please check all the fields", results: null },);
        } else {
            next();
        }

    }, middleware.verifyToken, sports_controller.addNewSport)


router.get("/get_sports", middleware.verifyToken, sports_controller.getSports)

router.post("/update_sport", middleware.verifyToken, sports_controller.updateSport)

router.post("/delete_sport", middleware.verifyToken, sports_controller.DeleteSport)

router.post("/add_sub_sport", middleware.verifyToken, sports_controller.addSubSport)

router.post("/delete_sub_sport", middleware.verifyToken, sports_controller.DeleteSubSport)

router.get("/get_sub_sports", middleware.verifyToken, sports_controller.getSubSports)

module.exports = router;