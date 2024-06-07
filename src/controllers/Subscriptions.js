


const DailySubscriptions = require("../models/daily_subscriptions");
const Gyms = require("../models/Gyms");
const Members = require("../models/members");
const Plans = require("../models/plans");
const Subscriptions = require("../models/Subscriptions");
var ObjectId = require('mongodb').ObjectID;

const sendEmail = require("../services/send_email").sendEmail


const sendSms = require("../services/send_sms").sendSms


var controller = {};



const sendSmsToExpierdMembers = (phoneNumbers) => {
    let phoneNumber = "";
    for (let i = 0; i < phoneNumbers.length; i++) {

        const item = phoneNumbers[i];
        if (i === 0) {
            phoneNumber = item;
        } else {
            phoneNumber = phoneNumber + "," + item;
        }
    }
    if (phoneNumber != "") {
        sendSms(phoneNumber);
    }
    return phoneNumber;
}

controller.addSubscription = async (req, res) => {
    const id = req.user.user_id;
    try {
        let subscription = Subscriptions(req.body);
        subscription.gym_id = id;
        if (subscription.member_id == undefined && req.body.id == undefined) {
            return res.status(400).send({
                success: false,
                results: null,
                message: "invalid id"
            })
        }
        const member = await Members.findOne({
            _id: subscription.member_id,
        });

        if (member != null) {
            await subscription.save();
            const gym = await
                Gyms.updateOne({ _id: id }, { $push: { Subscriptions: subscription, } },);
            await
                Members.updateOne({ _id: subscription.member_id }, {
                    $push:
                        { subscriptions: subscription, }, status: 0
                },);
            await
                Plans.updateOne({ _id: subscription.plan_id }, {
                    $push: {
                        Subscriptions: subscription,
                    }
                },);
            if ((member.email === "") || (member.email === null) || (member.email === undefined)) {

            } else {
                sendEmail({
                    subscription: {
                        subscription: subscription,
                        gym: gym,
                        member: member,
                    }
                })
            }
            return res.status(200).send({
                success: true, message: subscription._id,
                results: true
            });
        } else {
            return res.status(200).send({
                success: false, message: "invalid member",
                results: null
            })
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }
};

controller.addClientSubscription = async (req, res) => {
    const id = req.user.user_id;
    try {
        let subscription = Subscriptions(req.body);
        subscription.gym_id = id;
        await subscription.save();
        await
            Gyms.updateOne({ _id: id }, { $push: { Subscriptions: subscription, } },);
        if ((subscription.member_id) === undefined || (subscription.member_id) === undefined) {

        } else {
            await
                Members.updateOne({ _id: subscription.member_id }, {
                    $push:
                        { subscriptions: subscription, }
                },);
        }
        return res.status(200).send({
            success: true, message: subscription._id,
            results: true
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }
}

controller.filterSubscriptions = async (req, res) => {
    const id = req.user.user_id;
    const page = req.body.page;
    let ids = [];
    let memebrs = [];

    let match = {
    }
    req.body.plan_id != null && req.body.plan_id != "" ? match["plan_id"] = { $eq: ObjectId(req.body.plan_id) } : null;
    req.body.sport_id != null && req.body.sport_id != "" ? match["sport_id"] = { $eq: ObjectId(req.body.sport_id) } : null;

    match["status"] = { $eq: 0 };

    try {
        let gym = await Gyms.findOne({ _id: id })
            .populate({
                path: "Subscriptions",
                match,
                options: {
                    limit: 30,
                    sort: { created: -1 },
                    skip: Number.parseInt(page) * 30
                }
            });
        if (gym.Subscriptions.length == 0) {
            res.status(200).send({
                success: true, message: "ok", results: {
                    members: [],
                },
            });
        } else {
            gym.Subscriptions.forEach(element => {
                ids.push(element.member_id);
            });
            const members = await Members.find({ _id: ids, status: 0 });
            for (let index = 0; index < members.length; index++) {
                let id = members[index]["_id"];
                var element = {};
                element["plans"] = gym.Subscriptions.
                    filter(el => el["member_id"].toString() == id.toString());
                element["member"] = members[index];
                memebrs.push(element);
            }
            res.status(200).send({
                success: true, message: "ok", results: {
                    members: memebrs,
                },
            });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: "Server Error", results: null });
    }

}


controller.getSubscriptions = async (req, res) => {
    let id = req.user.user_id;
    const page = req.query.page;
    const month = req.query.month;
    let ids = [];
    let memebrs = [];
    if (id !== undefined && id !== "") {
        try {
            let match = {}
            let find = { _id: ids, };
            if (month === undefined || month === "null" || month === "") {
                find["status"] = 0;
                match["status"] = 0;
                let gymm = await Gyms.findOne({ _id: id }).
                    populate({
                        path: "members", match,
                        options: {
                            limit: 30,
                            sort: { createdAt: -1 },
                            skip: Number.parseInt(page) * 30
                        }
                    });
                gymm.members.forEach(element => {
                    ids.push(element.subscriptions.slice(-1)[0]);
                });
                const subscriptions = await Subscriptions.find(find);
                if (subscriptions.length == 0) {
                    res.status(200).send({
                        success: true, message: "ok", results: {
                            members: [],
                        },
                    });
                } else {
                    for (let index = 0; index < gymm.members.length; index++) {
                        var element = {};
                        let id = gymm.members[index]["_id"];
                        element["plans"] = subscriptions.
                            filter(el => el["member_id"].toString() == id.toString());
                        element["member"] = gymm.members[index];
                        memebrs.push(element);
                    }
                    res.status(200).send({
                        success: true, message: "ok", results: {
                            members: memebrs,
                        },
                    });
                }
            }
            else {
                let startDate = "";
                let endDate = "";
                const date = new Date();
                const y = date.getFullYear();
                let m = Number.parseInt(month);
                startDate = new Date(y, m, 1).toUTCString();
                endDate = new Date(y, m + 1, 1).toUTCString();
                let match = {};
                match["starting_date"] = { "$gte": new Date(startDate).toISOString(), "$lt": new Date(endDate).toISOString() }
                match["status"] = { $in: [1, 0] }
                console.log(match);
                let gym = await Gyms.findOne({ _id: id })
                    .populate({
                        path: "Subscriptions",
                        match,
                        options: {
                            limit: 30,
                            sort: { created: -1 },
                            skip: Number.parseInt(page) * 30
                        }
                    });
                if (gym.Subscriptions.length != 0) {
                    gym.Subscriptions.forEach(element => {
                        ids.push(element.member_id);
                    });

                    const membersList = await Members.find({ _id: ids, },);
                    for (let index = 0; index < membersList.length; index++) {
                        var element = {};
                        element["member"] = membersList[index];
                        element["plans"] = [gym.Subscriptions.
                            filter(el => el["member_id"].toString() == membersList[index]["_id"].toString()).slice(-1)[0]];
                        memebrs.push(element);
                    }
                    res.status(200).send({
                        success: true, message: "ok", results: {
                            members: memebrs,
                        },
                    });
                } else {
                    res.status(200).send({
                        success: true, message: "ok", results: {
                            members: [],
                        },
                    });
                }
            }

        } catch (error) {
            console.log(error);
            res.status(500).send({ success: false, message: "Server Error", results: null });
        }
    } else {
        res.status(400).send({ success: false, message: "please enter an id " });
    }
};

controller.addPresence = async (req, res) => {
    const id = req.body.id;
    const member_id = req.body.member_id;
    const expierd = req.body.expierd;
    console.log(expierd);
    console.log(member_id);
    console.log(id);
    try {
        await Subscriptions.updateOne({
            _id: id
        }, {
            $inc: { "times_perWeek.value": +1 },
            $push: {
                "times_perWeek.presence": {
                    "date": new Date(),
                    "value": 1,
                }
            }
        });
        if (expierd == true) {
            await Subscriptions.updateOne({ _id: id }, { "status": 1 });
            await Members.updateOne({ _id: member_id }, { "status": 1 });
        }
        res.status(200).send({
            success: true, message: "ok", results: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Server Error", results: null });
    }


}

controller.SetExpierdMembers = async () => {
    let ids = [];
    let members_ids = [];
    let gymIDS = [];
    let phone_numbers = [];
    let startDate = "";
    let endDate = "";
    try {
        var start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date();
        end.setUTCHours(23, 59, 59, 999);
        endDate = new Date(end).toUTCString();
        startDate = new Date(start).toUTCString();
        let subscriptions = await Subscriptions.find(
            {
                "status": { $eq: 0 },
                "ending_date": {
                    "$gte": new Date(startDate).toISOString(),
                    "$lt": new Date(endDate).toISOString()
                },
            },
        );
        if (subscriptions != 0 || subscriptions != null) {
            subscriptions.forEach(element => {
                ids.push(element._id);
                members_ids.push(element.member_id)
                if (gymIDS.includes(element.gym_id)) {
                } else {
                    gymIDS.push(element.gym_id)
                }
            });
            await Subscriptions.updateMany({ _id: { "$in": ids } }, { "status": 1 });
            await Members.updateMany({ _id: { "$in": members_ids } }, { "status": 1 });
            const active_gyms = await Gyms.find({ _id: { "$in": gymIDS }, subscribed: true },)

            if (active_gyms.length != 0) {
                for (let index = 0; index < active_gyms.length; index++) {
                    let id = active_gyms[index]["_id"];
                    const gymActiveSubscriptions = subscriptions.
                        filter(el => el["gym_id"].toString() == id.toString());
                    let active_gym = active_gyms[index];
                    let sms_messages_monthly =
                        active_gym.sms_messages_monthly.filter(el => el["month"] == start.getMonth());
                    let totalToSend = 0;
                    if (sms_messages_monthly != null && gymActiveSubscriptions != null) {
                        const sms_messages = sms_messages_monthly[0]["sms_messages"];

                        const expierd_members = gymActiveSubscriptions.length;
                        if (expierd_members <= sms_messages) {
                            totalToSend = expierd_members;
                        } else {
                            totalToSend = sms_messages;
                        }
                        for (let index = 0; index < totalToSend; index++) {
                            const element = gymActiveSubscriptions[index];
                            phone_numbers.push(element["phone_number"])
                        }

                    }
                    let inc = {};
                    inc[`sms_messages_monthly.${start.getMonth()}.sms_messages`] = -totalToSend;
                    if (totalToSend < 0) {
                        totalToSend = 0;
                    }
                    await Gyms.updateOne({ _id: id, }, {
                        "$inc": inc
                    });
                }
                sendSmsToExpierdMembers(phone_numbers);
            }
            return {
                success: true, message: "ok", results: {
                    Subscriptions: subscriptions,
                },
            };
        } else {
            return {
                success: true, message: "ok", results: {
                    Subscriptions: [],
                },
            };
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Server Error", results: null };
    }
}

controller.getExpierdMembers = async (req, res) => {
    const id = req.user.user_id;
    const page = req.body.page;
    let memebrs = [];
    let ids = [];
    var start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    var end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    endDate = new Date(end).toUTCString();
    startDate = new Date(start).toUTCString();
    console.log(new Date(startDate).toISOString())
    console.log(new Date(endDate).toISOString())

    let match = {
        "status": 1,
        "ending_date": {
            "$gte": new Date(startDate).toISOString(),
            "$lt": new Date(endDate).toISOString()
        }
    }
    try {

        let gym = await Gyms.findOne({ _id: id })
            .populate({
                path: "Subscriptions",
                match,
                options: {
                    limit: 30,
                    sort: { created: -1 },
                    skip: Number.parseInt(page) * 30
                }
            });


        if (gym != null) {
            gym.Subscriptions.forEach(element => {
                ids.push(element.member_id);
            });
            const membersList = await Members.find({ _id: ids, status: 1 },);
            for (let index = 0; index < membersList.length; index++) {
                var element = {};
                element["member"] = membersList[index];
                element["subscription"] = gym.Subscriptions[index];
                memebrs.push(element);
            }
            res.status(200).send({
                success: true, message: "ok", results: {
                    members: memebrs,
                },
            });
        } else {
            return res.status(200).send({
                success: true, message: "ok", results: {
                    members: [],
                },
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Server Error", results: null });
    }

}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function getLastWeeksDate() {
    const now = new Date();
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}
function getDateByDay() {
    var start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    var end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    endDate = new Date(end).toUTCString();
    startDate = new Date(start).toUTCString();
    return {
        "endDate": endDate,
        "startDate": startDate
    };
}

controller.filterExpierdSubscriptions = async (req, res) => {
    const id = req.user.user_id;
    const page = req.body.page;
    let startDate = "";
    let endDate = "";
    let ids = [];
    let memebrs = [];
    let match = {
    }

    if (req.body.date != null && req.body.date != "") {
        const type = req.body.date;
        if (type == "ByWeek") {
            var first = getDateByDay()["startDate"];
            var last = getLastWeeksDate();
            var firstday = new Date(last)
            var lastday = new Date(first)
            startDate = firstday;
            endDate = lastday;
            endDate.setUTCHours(23, 59, 59, 999);
            startDate.setUTCHours(23, 59, 59, 999);
        } else if (type == "ByDay") {
            startDate = getDateByDay()["startDate"];
            endDate = getDateByDay()["endDate"];
        } else if (type == "ByMonth") {
            var date = new Date(), y = date.getFullYear(), m = date.getMonth();
            startDate = new Date(y, m, 1);
            endDate = new Date(y, m + 1, 0);
        } else if (type == "ByDate") {
            let date_fromBody = Date.parse(req.body.dat)
            let date = new Date(date_fromBody);
            console.log(date)

            let start = date.getDate();
            let end = date.getDate();

            endDate = new Date(date.setDate(end));
            startDate = new Date(date.setDate(start));
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(23, 59, 59, 999);
        }
    }
    match["status"] = { $eq: 1 };
    if (isValidDate(startDate) && isValidDate(endDate)) {

    } else {
        startDate = getDateByDay()["startDate"];
        endDate = getDateByDay()["endDate"];
    }
    match["ending_date"] = {
        "$gte": new Date(startDate).toUTCString(),
        "$lt": new Date(endDate).toUTCString()
    }
    console.log(match);
    req.body.sport_id != null && req.body.sport_id != "" ? match["sport_id"] =
        { $eq: req.body.sport_id } : null;
    req.body.plan_id != null && req.body.plan_id != "" ? match["plan_id"] =
        { $eq: req.body.plan_id } : null;
    try {
        let gym = await Gyms.findOne({ _id: id })
            .populate({
                path: "Subscriptions",
                match,
                options: {
                    limit: 30,
                    sort: { created: -1 },
                    skip: Number.parseInt(page) * 30
                }
            });

        if (gym != null) {
            if (gym.Subscriptions.length == 0) {
                res.status(200).send({
                    success: true, message: "ok", results: {
                        members: [],
                    },
                });
            } else {
                gym.Subscriptions.forEach(element => {
                    ids.push(element.member_id);
                });
                const members = await Members.find({ _id: ids, status: 1 });
                for (let index = 0; index < members.length; index++) {
                    let id = members[index]["_id"];
                    var element = {};

                    element["plans"] = [
                        gym.Subscriptions.
                            filter(el => el["member_id"].toString() == id.toString()).slice(-1)[0]
                    ];
                    element["member"] = members[index];
                    memebrs.push(element);
                }
                res.status(200).send({
                    success: true, message: "ok", results: {
                        members: memebrs,
                    },
                });
            }
        } else {
            res.status(404).send({
                success: true, message: "not found", results: {
                    members: [],
                },
            });
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false, message: "Server Error", results: null,
        });
    }
}


controller.addDailySubscriptions = async (req, res) => {
    let id = req.user.user_id;
    let body = req.body;
    if (body != undefined) {
        var date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
        try {
            const name = d.toString() + m.toString() + y.toString();
            let object = {
                qnt: Number.parseInt(req.body.qnt),
                price: Number.parseFloat(req.body.price),
                gym_id: id,
            }
            if (req.body.title != null) {
                object["title"] = req.body.title;
            }
            let exists = await DailySubscriptions.findOne({ time: name });

            if (exists) {

                await DailySubscriptions.updateOne({
                    time: name,
                }, {
                    $push: {
                        "Subscriptions": object,
                    }
                });

            } else {
                let daily = DailySubscriptions()
                daily.subscriptions = [];
                daily.time = name;
                await daily.save();
                await DailySubscriptions.updateOne({
                    _id: daily._id,
                }, {
                    $push: {
                        "Subscriptions": object,
                    }
                });
                await Gyms.updateOne({ _id: id, }, {
                    $push: {
                        "Daily_Subscriptions": daily._id,
                    }
                });
            }
            return res.status(200).send({
                results: true,
                message: "ok",
                success: true,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                results: null,
                message: "error",
                success: false,
            });
        }
    } else {
        return res.status(404).send({
            results: null,
            message: "bad request",
            success: false,
        });
    }

}

controller.cancelSub = async (req, res) => {
    const member_id = req.body.member_id;
    try {
        let member = await
            Members.findOne({ _id: member_id })
        let last_sub = member.subscriptions.slice(-1)[0];
        await Subscriptions.updateOne({ _id: last_sub }, {
            status: 2,
        });
        await Members.updateOne({ _id: member_id }, {
            $set: {
                status: 2,
            },
            $pull: {
                subscriptions: ObjectId(last_sub)
            }

        });
        res.status(200).send({ success: true, results: true, });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            results: null,
            message: "error",
            success: false,
        });
    }
}


controller.getDailySub = async (req, res) => {
    const id = req.user.user_id;
    try {
        let startDate = "";
        let endDate = "";

        const date = new Date(), y = date.getFullYear(), d = date.getDate();
        if (req.body.month != undefined || req.body.month != null
            || req.body.month != "" && typeof req.body.month == Number) {
            m = Number.parseInt(req.body.month);
        } else {
            m = date.getMonth();
        }
        startDate = new Date(y, m, 1).toISOString();
        console.log((m + 1))
        endDate = new Date(y, m + 1, 1).toISOString();
        console.log(endDate)
        let match = {

        };
        match["Subscriptions.gym_id"] = id;
        match["createdAt"] = {
            "$gte": new Date(startDate).toISOString(),
            "$lt": new Date(endDate).toISOString()
        };

        let response = await Gyms.findOne({ _id: id }).populate({
            path: "Daily_Subscriptions",
            match: match,
        });
        // console.log(response);
        return res.status(200).send({
            results: response == null ? {} : response.Daily_Subscriptions,
            message: "ok",
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            results: null,
            message: "error",
            success: false,
        });
    }
}




controller.paidRemainingAmount = async (req, res) => {
    const subscription_id = req.body.subscription_id;
    if (subscription_id != null || subscription_id != undefined || subscription_id != "") {
        try {
            await Subscriptions.updateOne({ _id: subscription_id }, {
                "remaining_amount": 0
            });
            return res.status(200).send({
                results: true,
                message: "ok",
                success: true,
            });
        } catch (error) {
            return res.status(500).send({
                results: null,
                message: "error",
                success: false,
            });
        }
    } else {
        return res.status(500).send({
            results: null,
            message: "invalid id",
            success: false,
        });
    }

}


controller.deleteSubscription = async (req, res) => {
    const Subscription_id = req.body.Subscription_id;
    const id = req.user.user_id;
    console.log(Subscription_id);
    try {
        if (Subscription_id != undefined && Subscription_id != "") {
            await Subscriptions.deleteOne({ _id: Subscription_id });
            let response = await Gyms.updateOne({ _id: id }, {
                $pull: { "Subscriptions": Subscription_id },
            });
            if (response)
                return res.status(200).send({ success: true, message: response });

        } else {
            return res.status(400).send({ success: false, message: "please enter the required fields" });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ success: false, message: "server error" });
    }
};

controller.deleteDailySubscription = async (req, res) => {
    const Subscription_id = req.body.Subscription_id;
    const id = req.user.user_id;
    console.log(Subscription_id);
    try {
        if (Subscription_id != undefined && Subscription_id != "") {
            await DailySubscriptions.deleteOne({ _id: Subscription_id });
            let response = await Gyms.updateOne({ _id: id }, {
                $pull: { Daily_Subscriptions: Subscription_id },
            });
            if (response)
                return res.status(200).send({ success: true, message: response });

        } else {
            return res.status(400).send({ success: false, message: "please enter the required fields" });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ success: false, message: "server error" });
    }
};
module.exports = controller;