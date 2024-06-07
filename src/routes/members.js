
const express = require("express")

const middleware = require("../middlewares/middlewares")

const { body, validationResult } = require('express-validator');

const app = express();

app.use(express.json());

let router = express.Router();

const members_controller = require("../controllers/memebrs")


router.post("/add_new_member",
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

    }, middleware.verifyToken, members_controller.addNewMember)


router.get("/get_members", middleware.verifyToken, members_controller.getMembersByGymID)

router.post("/update_member", middleware.verifyToken, members_controller.updateMember)

router.delete("/block_member", middleware.verifyToken, members_controller.blockMember)

router.get("/get_member_profile", middleware.verifyToken, members_controller.getMemberProfile)

router.post("/search_members", middleware.verifyToken, members_controller.searchMembers)

router.get("/get_dashboard", middleware.verifyToken, members_controller.getDashboard)

router.post("/get_monthly_statistics", middleware.verifyToken, members_controller.getMonthlyStatistics)

router.post("/delete_member", middleware.verifyToken, members_controller.DeleteMember)


module.exports = router;