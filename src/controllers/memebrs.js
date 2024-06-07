const Gyms = require("../models/Gyms");

const fs = require("fs");

const compressImages = require("compress-images")

const Members = require("../models/members");

const qr = require("qrcode");

const { UPLOAD_DIR } = require("../../settings");
const Subscriptions = require("../models/Subscriptions");
const DailySubscriptions = require("../models/daily_subscriptions");


var controller = {};

var ObjectId = require('mongodb').ObjectID;


controller.addNewMember = async (req, res) => {
    const id = req.user.user_id;
    try {
        console.log(req.files)
        let member = Members(JSON.parse(req.body.member));
        member.gym_uid = id;
        member.member_id = ((await Members.count()) + 100).toString();

        let qrCode = await qr.toDataURL(member._id.toString());
        if (qrCode) {
            let uploadPathQr = UPLOAD_DIR + "/qr_images/";

            let qr_pic = (new Date().getTime()) + "-" + ".jpg";

            var base64Data = qrCode.replace(/^data:image\/png;base64,/, "");

            var qrPath = uploadPathQr + qr_pic;
            fs.writeFile(qrPath, base64Data, 'base64', function (err) {
                console.log(err);
            });
            member.qr_pic = qr_pic;
        }
        if (req.files != undefined) {
            let memberPic = req.files.memberImg;
            let pic_name = (new Date().getTime()) + "-" + memberPic.name;
            let uploadPath = UPLOAD_DIR + "/members/";

            const filePath = UPLOAD_DIR + "/temp-uploads/" + pic_name;
            const compression = 60
            member.profile_pic = pic_name;
            fs.writeFile(filePath, memberPic.data, async function (error) {
                if (error) throw error

                compressImages(filePath, uploadPath, { compress_force: false, statistic: true, autoupdate: true }, false,
                    { jpg: { engine: "mozjpeg", command: ["-quality", compression] } },
                    { png: { engine: "pngquant", command: ["--quality=" + compression + "-" + compression, "-o"] } },
                    { svg: { engine: "svgo", command: "--multipass" } },
                    { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
                    async function (error, completed, statistic) {
                        console.log("-------------")
                        console.log(error)
                        console.log(completed)
                        console.log(statistic)
                        console.log("-------------")

                        fs.unlink(filePath, function (error) {
                            if (error) throw error
                        })
                    }
                )

            })
        }

        await member.save();
        await
            Gyms.updateOne({ _id: id }, { $push: { members: member } },);
        return res.status(200).send({
            success: true, message: "Member beenn adedd succelfy", results: {
                "qr_code_url": member.qr_pic,
                "photo_url": member.profile_pic,
                "_id": member._id,
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }

};




controller.updateMember = async (req, res) => {
    const id = req.query.id;
    console.log(id);
    if (id != undefined && req.body != undefined) {
        let body = JSON.parse(req.body.member)
        if (req.files != undefined) {
            let memberPic = req.files.memberImg;
            let pic_name = (new Date().getTime()) + "-" + memberPic.name;

            let uploadPath = UPLOAD_DIR + "/members/";

            const filePath = UPLOAD_DIR + "/temp-uploads/" + pic_name;
            const compression = 60
            body.profile_pic = pic_name;
            fs.writeFile(filePath, memberPic.data, async function (error) {
                if (error) throw error

                compressImages(filePath, uploadPath, { compress_force: false, statistic: true, autoupdate: true }, false,
                    { jpg: { engine: "mozjpeg", command: ["-quality", compression] } },
                    { png: { engine: "pngquant", command: ["--quality=" + compression + "-" + compression, "-o"] } },
                    { svg: { engine: "svgo", command: "--multipass" } },
                    { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
                    async function (error, completed, statistic) {
                        fs.unlink(filePath, function (error) {
                            if (error) throw error
                        })
                    }
                )
            })
            let oldURL = JSON.parse(req.body.old_url);
            console.log("ikdjfslkfjsdfkl" + oldURL);
            if (oldURL == "" || oldURL == undefined) {
                console.log("");
            } else {

                try {
                    fs.unlink(UPLOAD_DIR + "/members/" + oldURL, (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Delete File successfully.");
                    });
                } catch (error) {
                    console.log(error);
                    res.status(500).send({ success: false, message: "Server Error" })
                }
            }
        }
        try {
            await
                Members.updateOne({ _id: id }, body);
            return res.status(200).send({
                success: true, message: "Member beenn adedd succelfy", results: {
                    "photo_url": body.profile_pic,
                }
            });

        } catch (error) {
            console.log(error);
            return res.status(500).send({ success: false, message: "Server Error", results: null });
        }
    } else {
        return res.status(404).send({ success: false, message: "Invalid data", results: null });
    }

};

controller.blockMember = async (req, res) => {
    const id = req.body.member_id;
    try {
        let response = await
            Members.updateOne({ _id: id }, { "account_status": 0 });
        return res.status(200).send({ success: true, message: "Member beenn blocked succelfy", results: response });

    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }

};


controller.getMembersByGymID = async (req, res) => {

    let id = req.user.user_id;
    const status = req.query.status;
    const page = req.query.page;
    console.log(Number.parseInt(page));
    let ids = [];
    let values = [];
    let memebrs = [];
    if (id != undefined && id != "") {
        try {
            let match = {}

            if (status == 3) {
                match = {}
            } else {
                match = {
                    "status": Number.parseInt(status),
                }
            }
            let gym = await Gyms.findOne({ _id: id }).
                populate({
                    path: "members", match,
                    options: {
                        limit: 20,
                        sort: { created: -1 },
                        skip: Number.parseInt(page) * 20
                    }
                })
            if (gym != null) {

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

                res.status(200).send({
                    success: true, message: "ok", results: {
                        members: memebrs,
                    },
                });
            } else {
                res.status(404).send({
                    success: true, message: "invalid id", results: {
                        members: [],
                    },
                });
            }

        } catch (error) {
            console.log(error);
            res.status(500).send({ success: false, message: "Server Error", results: null });
        }
    } else {
        res.status(400).send({ success: false, message: "please enter an id " });
    }

};



controller.getMemberProfile = async (req, res) => {
    let id = req.query.id;
    const gym_id = req.user.user_id;
    if (id == undefined || id == "") {
        res.status(404).send({
            success: false, message: "invalid id please set a valid id", results: {
                member: null,
            },
        });
    } else {
        try {
            let member = await Members.findOne({ _id: id }).
                populate({ path: "subscriptions", }).sort({ createdAt: 1 });
            console.log(member.gym_uid)
            if (member != null && (member.gym_uid.toString() == gym_id.toString())) {
                res.status(200).send({
                    success: true, message: "ok", results: {
                        member: member,
                    },
                });
            } else {
                res.status(403).send({
                    success: false, message: "not authorized", results: {
                        member: {

                        },
                    },
                });
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false, message: "server error", results: null,
            });
        }
    }
}



controller.searchMembers = async (req, res) => {
    const query = req.body.query;
    const id = req.user.user_id;
    console.log(query);
    let match = {};
    try {
        match["gym_uid"] = { $eq: ObjectId(id) };
        console.log(match);
        let response = await Members.aggregate([
            {
                $search: {
                    "index": "search_members",
                    "autocomplete": {
                        query: query,
                        path: "first_name"
                    }
                },
            },
            { $limit: 10, },
            { $match: match }

        ]);
        return res.status(200).send({
            results: response,
            success: true,
            message: "ok"
        })
    } catch (error) {
        return res.status(400).send({
            results: null,
            success: false,
            message: "ok"
        })
    }
}

controller.getDashboard = async (req, res) => {
    const id = req.user.user_id;
    const phone_number = req.user.phone_number;
    try {

        const gym = await Gyms.findOne({ _id: id })
            .populate({
                path: "access",
            });
        if (gym != null) {
            let roles = gym.access.filter(el => el["phone_number"] == phone_number);
            console.log(roles);
            if (roles == 0 && (gym.phone_number) != (phone_number)) {
                return res.status(200).send({
                    success: true,
                    results: {
                        status: 1,
                    }
                })
            } else {
                let soldProducts = 0;
                var date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDate();

                const name = d + m.toString() + y.toString();
                startDate = new Date(y, m, 1).toUTCString();
                endDate = new Date(y, m + 1, 0).toUTCString();

                const match = {
                    "starting_date": {
                        "$gte": new Date(startDate).toISOString(),
                        "$lt": new Date(endDate).toISOString()
                    },
                    "status": { $in: [1, 0] }
                };
                const matchDailySubscriptions = {
                    "updatedAt": {
                        "$gte": new Date(startDate).toISOString(),
                        "$lt": new Date(endDate).toISOString()
                    }
                };
                const matchMembers = {
                    "createdAt": {
                        "$gte": new Date(startDate).toISOString(),
                        "$lt": new Date(endDate).toISOString()
                    }
                };

                let products = await Gyms.findOne({ _id: id })
                    .populate({
                        path: "products",
                        match: {
                            'lastSaledAt': {
                                "$gte": new Date(startDate).toISOString(),
                                "$lt": new Date(endDate).toISOString()
                            },
                        },
                    });
                let subscription = await Gyms.findOne({ _id: id })
                    .populate({
                        path: "Subscriptions",
                        match: match,
                    });
                if (products.products.length != 0) {
                    for (let index = 0; index < products.products.length; index++) {
                        if (products.products[index].sells.length != 0) {
                            for (let i = 0; i < products.products[index].sells.length; i++) {
                                const element = products.products[index].sells[i];
                                console.log(element);
                                soldProducts = soldProducts + element.qnt;
                            }
                        }

                    }
                }
                const members = await Gyms.findOne({ _id: id })
                    .populate({
                        path: "members",
                        match: matchMembers,
                    });

                let daily_subscriptions = await Gyms.findOne({ _id: id })
                    .populate({
                        path: "Daily_Subscriptions",
                        match: matchDailySubscriptions,
                    });
                let DailySubscriptionsLength = 0;
                for (let index = 0; index < daily_subscriptions.Daily_Subscriptions.length; index++) {
                    const element = daily_subscriptions.Daily_Subscriptions[index];
                    for (let index = 0; index < element.Subscriptions.length; index++) {
                        const seond_element = element.Subscriptions[index];
                        DailySubscriptionsLength = DailySubscriptionsLength + seond_element["qnt"];
                    }
                }
                const daily = await DailySubscriptions.findOne({ time: name, "Subscriptions.gym_id": id });
                return res.status(200).send({
                    success: true,
                    results: {
                        subscriptions: subscription.Subscriptions.length,
                        products: soldProducts,
                        members: members.members.length,
                        daily_subscriptions: DailySubscriptionsLength,
                        status: members.account_status,
                        phone_number: members.phone_number,
                        subscribed: members.subscribed,
                        gym_name: members.gym_name,
                        sigin_fees: members.sigin_fees,
                        daily_subscription: daily == null ? {} : {
                            Date: daily.Date,
                            Subscriptions: daily.Subscriptions,
                        },
                    }
                })
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            "error": error,
        })
    }
}


controller.getMonthlyStatistics = async (req, res) => {
    let id = req.user.user_id;
    const month = req.body.month;
    try {
        const date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDate();

        startDate = new Date(y, month, 1).toUTCString();
        endDate = new Date(y, month + 1, 0).toUTCString();

        const match = {
            "starting_date": {
                "$gte": new Date(startDate).toISOString(),
                "$lt": new Date(endDate).toISOString()
            },
            "status": { $in: [1, 0] }
        };
        const matchDailySubscriptions = {
            "updatedAt": {
                "$gte": new Date(startDate).toISOString(),
                "$lt": new Date(endDate).toISOString()
            }
        };

        const matchMembers = {
            "createdAt": {
                "$gte": new Date(startDate).toISOString(),
                "$lt": new Date(endDate).toISOString()
            }
        };

        const subscription = await Gyms.findOne({ _id: id })
            .populate({
                path: "Subscriptions",
                match: match,
            });

        const products = await Gyms.findOne({ _id: id })
            .populate({
                path: "products",
                match: {
                    'lastSaledAt': {
                        "$gte": new Date(startDate).toISOString(),
                        "$lt": new Date(endDate).toISOString()
                    },
                },
            });
        const members = await Gyms.findOne({ _id: id })
            .populate({
                path: "members",
                match: matchMembers,
            });

        const daily_subscriptions = await Gyms.findOne({ _id: id })
            .populate({
                path: "Daily_Subscriptions",
                match: matchDailySubscriptions,
            });
        let DailySubscriptionsLength = 0;
        for (let index = 0; index < daily_subscriptions.Daily_Subscriptions.length; index++) {
            const element = daily_subscriptions.Daily_Subscriptions[index];
            for (let index = 0; index < element.Subscriptions.length; index++) {
                const seond_element = element.Subscriptions[index];
                DailySubscriptionsLength = DailySubscriptionsLength + seond_element["qnt"];
            }
        }
        return res.status(200).send({
            success: true,
            results: {
                subscriptions: subscription.Subscriptions.length,
                products: products.products.length,
                members: members.members.length,
                daily_subscriptions: DailySubscriptionsLength,
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            "error": error,
        })
    }
}
controller.DeleteMember = async (req, res) => {
    const member_id = req.body.member_id;
    const id = req.user.user_id;
    console.log(member_id);
    try {
        if (member_id != undefined && member_id != "") {
            const member = await Members.findOne({ _id: member_id })
            if (member.gym_uid == id) {
                const response = await Gyms.updateOne({ _id: id },
                    { $pull: { "members": ObjectId(member_id) } });

                await Members.deleteOne({ _id: member_id })

                await Subscriptions.deleteMany({ '_id': { '$in': member.subscriptions } })

                if (response)
                    return res.status(200).send({ success: true, message: response });

            } else {
                return res.status(400).send({
                    success: false, message:
                        "please enter the required fields"
                });
            }
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            "error": error,
        })
    }

};

module.exports = controller;
