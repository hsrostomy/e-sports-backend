

const admin_controller = require("../controllers/admin")
const express = require("express")
const { body, validationResult } = require('express-validator');
let router = express.Router();

const middleware = require("../middlewares/middlewares")

const app = express();

app.use(express.json());


router.route("/get_list_users").get(admin_controller.getListUsers);


router.route("/validate_access").post( admin_controller.validateAccess,);


module.exports = router;
