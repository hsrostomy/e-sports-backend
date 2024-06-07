
const express = require("express")

var fileupload = require("express-fileupload");

var admin = require("firebase-admin");


const Subscriptions = require("./src/controllers/Subscriptions")

require('dotenv').config();

const mongoose = require("mongoose");

const nodeCron = require("node-cron");

const router = require("./src/routes")

const connectDB = require("./src/services/db_connection");

const cronServices = require("./src/services/crons_services");

const cors = require('cors')

const bodyParser = require('body-parser');

var path = require('path');
var fs = require('fs');
const { UPLOAD_DIR } = require("./settings");

connectDB(process.env.PRODUCTION_DATABASE_URL)

var serviceAccount = require("./igym-15a76-firebase-adminsdk-t43a7-20e6d970e9.json");

////
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileupload());
app.use("/", router)

app.post("/get_expierd_free", () => {
    cronServices.setExpierdFreeTrail(admin);
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use('/css', express.static(path.join(__dirname, "./public") + '/assets/css'))
app.use('/css', express.static(path.join(__dirname, "./public") + '/assets/css/scss'))

app.use('/js', express.static(path.join(__dirname, "./public") + '/assets/js'))
app.use('/bootstrap', express.static(path.join(__dirname, "./public") + '/assets/bootstrap'))
app.use('/icons', express.static(path.join(__dirname, "./public") + '/assets/icons'))
app.use('/webfonts', express.static(path.join(__dirname, "./public") + '/assets/webfonts'))
app.use('/vendor', express.static(path.join(__dirname, "./public") + '/vendor'))

app.use('/img', express.static(path.join(__dirname, "./public") + '/assets/img'))

const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}

app.use(cors(corsOptions))

app.use(express.static(UPLOAD_DIR));


cronServices.SetExpierdMembers();


app.listen(3000, () => {
    console.log("running  on port : " + process.env.PORT);
});


