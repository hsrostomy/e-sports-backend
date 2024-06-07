

const express = require("express")
const { body, validationResult } = require('express-validator');
let router = express.Router();

const middleware = require("../../middlewares/middlewares")

const app = express();

app.use(express.json());


/*router.get("/e-sports", async (req, res) => {
    res.render("e-sports/dashboard.ejs",);
})*/

/*router.get("/members", async (req, res) => {
    let ids = [];
    let values = [];
    let memebrs = [];
    let match = {}
    let status = 3;
    if (status == 3) {
        match = {}
    } else {
        match = {
            "status": Number.parseInt(status),
        }
    }
    let gym = await Gyms.findOne({ _id: "6351237b3d13e72c563dc64f" }).
        populate({
            path: "members", match,
            options: {
                limit: 30,
                sort: { created: -1 },
            }
        })

    gym.members.forEach(element => {

        if (element.subscriptions.slice(-1)[0] != undefined) {
            ids.push(element.subscriptions.slice(-1)[0]);
            values.push(true)
        } else {
            values.push(false);
        }
    });

    const subscriptions = await Subscriptions.find({ _id: ids });

    for (let index = 0; index < gym.members.length; index++) {
        var element = {};
        let id = gym.members[index]["_id"];
        console.log(id);

        element["Subscription"] = subscriptions.
            filter(el => el["member_id"].toString() == id.toString());

        element["member"] = gym.members[index];
        memebrs.push(element);
    }

    res.render("e-sports/members/members.ejs", { memebrs: memebrs });
})


router.get("/add_member", async (req, res) => {
    res.render("e-sports/members/add_member.ejs",);
})


router.post("/add_member", async (req, res) => {
    console.log(req.body);
})*/


module.exports = router;
