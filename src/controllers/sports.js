
const Gyms = require("../models/Gyms");


const Members = require("../models/members");

const Sports = require("../models/sports");


var controller = {};

var ObjectId = require('mongodb').ObjectID;


controller.addNewSport = async (req, res) => {
    const id = req.user.user_id;
    try {
        let sport = Sports(req.body);

        sport.gym_id = id;
        await sport.save();
        await
            Gyms.updateOne({ _id: id }, { $push: { sports: sport } },);
        return res.status(200).send({
            success: true, message: "plan been adedd succelfy", results: {
                "_id": sport._id,
            }
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }

};




controller.updateSport = async (req, res) => {
    const id = req.body.sport_id;
    try {
        let sport = Sports(req.body.sport);

        await
            Sports.updateOne({ _id: id }, {
                sport_name: plan.plan_name,
            });
        return res.status(200).send({ success: true, message: "sport beenn adedd succelfy", results: true });

    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }

};

controller.DeleteSport = async (req, res) => {
    const sport_id = req.body.sport_id;
    const id = req.user.user_id;

    try {
        if (sport_id != undefined && sport_id != "") {

            await Gyms.updateOne({ _id: id }, { $pull: { "sports": ObjectId(sport_id) } });

            return res.status(200).send({ success: true, message: "Updated Successfully" });

        } else {
            return res.status(400).send({ success: false, message: "please enter the required fields" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: "Server Error", results: null });

    }
};

controller.getSports = async (req, res) => {

    const id = req.user.user_id;
    const page = Number.parseInt(req.query.page);
    let sports = [];
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
            let gym = await Gyms.findOne({ _id: id }).populate({
                path: "sports",
                options: options
            });
            for (let index = 0; index < gym.sports.length; index++) {
                let element = gym.sports[index];
                element["plans"] = element["plans"].length;
                element["Subscriptions"] = element["Subscriptions"].length;
                sports.push(element)
            }
            res.status(200).send({
                success: true, message: "ok", results: {
                    sports: sports,
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


controller.getPlansById = async (req, res) => {

    const id = req.body.plan_id;
    const page = Number.parseInt(req.query.page);

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
            let gym = await Sports.findOne({ _id: id }).populate({
                path: "plans",
                options: options
            });
            res.status(200).send({
                success: true, message: "ok", results: {
                    sports: gym.plans,
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



controller.addSubSport = async (req, res) => {
    const id = req.user.user_id;
    const sport_id = req.body.sport_id;
    try {
        let sport = Sports(req.body);
        await sport.save();
        if (sport != null) {
            let response = await
                Sports.updateOne({ _id: sport_id }, { $push: { "sports": sport } },);
            return res.status(200).send({
                success: true, message: "plan been adedd succelfy", results: {
                    "_id": sport._id,
                }
            });
        } else {
            return res.status(500).send({ success: false, message: "Server Error", results: null });
        }

    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }
};

controller.DeleteSubSport = async (req, res) => {
    const sport_id = req.body.sport_id;
    const sub_sport_id = req.body.sub_sport_id;
    const id = req.user.user_id;

    try {
        if (sport_id != undefined && sport_id != "") {

            await Sports.deleteOne({ _id: sport_id }, { $pull: { "sports": ObjectId(sub_sport_id) } });

            return res.status(200).send({ success: true, message: "Updated Successfully" });

        } else {
            return res.status(400).send({ success: false, message: "please enter the required fields" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: "Server Error", results: null });

    }
};


controller.getSubSports = async (req, res) => {

    const sub_sport_id = req.query.sub_sport_id;
    try {
        let gym = await Sports.findOne({ _id: sub_sport_id }).populate({
            path: "sports",
        });
        res.status(200).send({
            success: true, message: "ok", results: {
                sports: gym.sports,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Server Error", results: null });
    }
};
module.exports = controller;