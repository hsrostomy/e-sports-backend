

const access_controller = require("../controllers/access")
const express = require("express")
const { body, validationResult } = require('express-validator');
let router = express.Router();

const middleware = require("../middlewares/middlewares")

const app = express();

app.use(express.json());


router.route("/create").post(middleware.verifyToken, access_controller.createAccess,);


router.route("/delete").post(middleware.verifyToken, access_controller.deleteAccess,);


router.route("/get").get(middleware.verifyToken, access_controller.getAccesses,);


module.exports = router;
