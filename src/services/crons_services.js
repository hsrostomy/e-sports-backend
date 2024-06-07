
const Subscriptions = require("../controllers/Subscriptions")

const nodeCron = require("node-cron");




const Gyms = require("../models/Gyms");



function getLastWeeksDate() {
    const now = new Date();
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

const SetExpierdMembersCron = async () => {
    await nodeCron.schedule("30 51 3 * * *", async () => {
        const response = await Subscriptions.SetExpierdMembers();
        console.log(response)
    });
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

const setExpierdFreeTrail = async (admin) => {

    let match = {
    }
    let gyms_ids = [];
    var registrationTokens = [];
    var first = getDateByDay()["startDate"];
    var last = getLastWeeksDate();
    var firstday = new Date(last)
    var lastday = new Date(first)
    let startDate = firstday;
    let endDate = lastday;
    match["createdAt"] = {
        "$gte": new Date(startDate).toUTCString(),
        "$lt": new Date(endDate).toUTCString()
    }
    match["subscribed"] = false;
    const gyms = await Gyms.find(match);
    if (gyms != null && gyms.length != 0) {
        for (let i = 0; i < gyms.length; i++) {
            const item = gyms[i];
            gyms_ids.push(item._id);
            registrationTokens.push(item.device_token);
        }
    }
    await Gyms.updateMany({_id: { $in: gyms_ids }, }, { account_status: 2 });
    var options = {
        priority: "high",
    };
    const payload = {
        notification: {
            content_available: "true",
            title: "Abonnez-vous maintenant",
            body: "Bonjour ,Votre période d'essai gratuit a expiré, Abonnez-vous maintenant,Payer avec DAHABIA,CIB"
        }
    };
    try {
        let response = await admin.messaging().sendToDevice(registrationTokens, payload, options);
        console.log(response);
    } catch (error) {
        console.log("Error sending message:", error);
    }
}


module.exports = {
    SetExpierdMembers: SetExpierdMembersCron,
    setExpierdFreeTrail: setExpierdFreeTrail,
};