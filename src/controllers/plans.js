
const Gyms = require("../models/Gyms");


const Members = require("../models/members");

const Plans = require("../models/plans");

const Sports = require("../models/sports");

var controller = {};

var ObjectId = require('mongodb').ObjectID;


controller.addNewPlan = async (req, res) => {
    const id = req.user.user_id;
    const sport_id = req.body.sport_id;
    try {
        let plan = Plans(req.body);
        plan.gym_id = id;
        plan.sport_id = sport_id;
        console.log(plan);
        await plan.save();
        let response = await
            Sports.updateOne({ _id: sport_id }, { $push: { plans: plan } },);
        return res.status(200).send({ success: true, message: "plan been adedd succelfy", results: response });

    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }

};




controller.updatePlan = async (req, res) => {
    const id = req.body.plan_id;
    try {
        let plan = Plans(req.body.plan);

        let response = await
            Plans.updateOne({ _id: id }, {
                plan_name: plan.plan_name,
                plan_desc: plan.plan_desc,
                plan_price: plan.plan_price,
                times_perWeek: plan.times_perWeek,
            });
        return res.status(200).send({ success: true, message: "plan beenn adedd succelfy", results: true });

    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }

};

controller.DeletePlan = async (req, res) => {
    const plan_id = req.body.plan_id;
    const sport_id = req.body.sport_id;
    const id = req.user.user_id;
    console.log(plan_id);
    try {
        if (plan_id != undefined && plan_id != "") {

            let response = await Sports.updateOne({ _id: sport_id }, { $pull: { "plans": ObjectId(plan_id) } });
            if (response)
                return res.status(200).send({ success: true, message: response });

        } else {
            return res.status(400).send({ success: false, message: "please enter the required fields" });
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error" });

    }

};

controller.getPlans = async (req, res) => {
    const id = req.user.user_id;
    const page = Number.parseInt(req.query.page);
    const sport_id = req.query.sport_id;
    const Subscriptions = [];
    let options = {

    };
    if (id != undefined && id != "") {
        if (page != 50) {
            options = {
                limit: 30,
                sort: { created: -1 },
                skip: page * 30
            }
        } else {
            options = {
                sort: { created: -1 },
            }
        }
        try {
            let gym = await Sports.findOne({ _id: sport_id }).populate({
                path: "plans",
                options: options
            });
            if (gym != null) {
                gym.plans.forEach(element => {
                    let gym_plans = {
                        "_id": element["_id"],
                        "plan_name": element["plan_name"],
                        "sport_id": element["sport_id"],
                        "plan_price": element["plan_price"],
                        "times_perWeek": element["times_perWeek"],
                        "gym_id": element["gym_id"],
                        "period_of_duration" : element["period_of_duration"],
                        "Subscriptions": element["Subscriptions"].length,
                    };
                    Subscriptions.push(gym_plans)
                });
            }
            res.status(200).send({
                success: true, message: "ok", results: {
                    plans: Subscriptions,
                },
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({ success: false, message: "Server Error", results: null });
        }
    } else {
        res.status(400).send({ success: false, message: "please enter an id " });
    }
};

module.exports = controller;