var fs = require("fs");
var path = require('path');

var nodemailer = require("nodemailer");
var ejs = require("ejs");

var transporter = nodemailer.createTransport({
    host: "smtp.titan.email",
    port: "465",
    auth: {
        user: "contact@turing-technologies.com",
        pass: "TURING-technologies2022",
    },
});


var daysFr = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
];
var monthNamesFr = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Peut",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
];
var sportsFr = [
    { "id": 0, "text": "musculation" },
    { "id": 1, "text": "Cardio" },
    { "id": 2, "text": "Fitness" },
    { "id": 3, "text": "Natation" },
    { "id": 4, "text": "Judo" },
    { "id": 5, "text": "Karaté" },
    { "id": 6, "text": "Taekwondo" },
    { "id": 7, "text": "Boxe" },
    { "id": 8, "text": "Kick-boxing" },
    { "id": 9, "text": "Lutte" },
    { "id": 10, "text": "Volley-ball" },
    { "id": 11, "text": "Football" },
    { "id": 12, "text": "Basket-ball" },
];

const getsportName = (sport_id, plan_name) => {

    var sport_name = sportsFr.filter(el => el["id"] == sport_id);

    return `${sport_name[0]["text"]} - ${plan_name}`;
}

const getDate = (createdAt) => {
    var dateParse = Date.parse(createdAt);
    let date = new Date(dateParse)
    console.log(`${date.getDate()} ${daysFr[date.getDay()]},${monthNamesFr[date.getMonth()]} ${date.getFullYear()}`);
    return `${date.getDate()} ${daysFr[date.getDay()]}, ${monthNamesFr[date.getMonth()]} ${date.getFullYear()}`;
}
const getExpirydate = (expieryDate) => {
    var dateParse = Date.parse(expieryDate);
    let date = new Date(dateParse)
    return `${date.getDate()} - ${monthNamesFr[date.getMonth()]} - ${date.getFullYear()}`;
}

const sendEmail = async (subscription) => {
    if (subscription.subscription.member.email != null || subscription.subscription.member.email != "" || subscription.subscription.member.email != undefined) {
        subscription.subscription["sport_name"] = getsportName(subscription.subscription.subscription.sport_index, subscription.subscription.subscription.plan_name);
        subscription.subscription["expieryDate"] = getExpirydate(subscription.subscription.subscription.ending_date);
        subscription.subscription["date"] = getDate(subscription.subscription.subscription.createdAt);
        const data = await ejs.renderFile(path.join(__dirname, "/invoice.ejs"), subscription,)

        var mainOptions = {
            from: '"contact@turing-technologies.com',
            to: subscription.subscription.member.email,
            subject: 'INVOICE',
            html: data,
        };
        console.log("html data ======================>", mainOptions.html);
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
    }

}

module.exports = {
    sendEmail: sendEmail
};