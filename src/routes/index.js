var express = require("express");
const Subscriptions = require("../models/Subscriptions");
const Gyms = require("../models/Gyms");
const Members = require("../models/members");
const nodemailer = require("nodemailer");
const axios = require("axios")
var ObjectId = require('mongodb').ObjectID;
const sendEmail = require("../services/send_email").sendEmail
const ejs = require("ejs");
var path = require('path');

const router = express.Router();
const middleware = require("../middlewares/middlewares")
const puppeteer = require("puppeteer");

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 30 * 1000,
    max: 50,
});
const authRoute = require("./auth")

const productsRoute = require("./products")

const plansRoute = require("./plans")

const membersRoute = require("./members")

const subscriptionsRoutes = require("./Subscriptions")

const accessRoutes = require("./access")

const paymentsController = require("../controllers/payments")

const sportRoutes = require("./sports")

const adminRoutes = require("./admin")


const web_member_routes = require("./web/member")


router.use("/api/auth", limiter, authRoute);

router.use("/api/products", limiter, productsRoute);

router.use("/api/plans", limiter, plansRoute);

router.use("/api/members", limiter, membersRoute);

router.use("/api/subscriptions", limiter, subscriptionsRoutes);

router.use("/api/access", limiter, accessRoutes)

router.use("/api/sports", limiter, sportRoutes)

router.use("/api/admin", limiter, adminRoutes)


router.use("/", web_member_routes)


router.post("/contact_us", async (req, res) => {
    console.log("im her");
    let body = req.body;
    let transporter = nodemailer.createTransport({
        service: "outlook",
        auth: {
            user: "e-gymdz@outlook.fr",
            pass: "rosTOMYHSY123",
        },
    });
    let info = await transporter.sendMail({
        from: "e-gymdz@outlook.fr",
        to: "rostomyhs@gmail.com",
        subject: body.subject,
        text: {
            content: body.content,
            from: body.email,
            name: body.name ?? "",
            phone_number: body.phone ?? "",
        },
    });
    res.status(200).send({
        success: true,
        message: "ok",
    });
})


router.get("/", (req, res) => {
    res.render("index");
})

router.get("/about", (req, res) => {
    res.render("about");
})
router.get("/contact", (req, res) => {
    res.render("contact");
})
const jobs = [
    {
        img_url: "img/flutter-developer.jpg",
        id: "senior-flutter-developer",
        title: "Senior Flutter developer",
        date: "2, December, 2022",
        role: "We are looking out for a Flutter Developer who will be running and designing product routerlication",
        technologies_requierd: ["dart", "flutter", "Android Studio", "xCode", "java", "swift", "Git", "firebase"],
        desc: [
            {
                title: "Roles and Responsibilities",
                desc: [
                    "Designing, developing, testing, maintaining, and deploying software in the Flutter framework and Dart language",
                    "Developing user interface components and implementing them by following well-known Flutter / Dart workflows and practices",
                    "Communicating with product and engineering leads and backend engineers",
                    "Assisting clients in making good decisions and choosing best solutions",
                ],
            },
            {
                title: "Qualifications and Requirements",
                desc: [
                    "2 to 4 years of experience developing mobile routers natively in iOS and/or Android",
                    "Good understanding of state management, Flutter flavors and router architecture",
                    "Good knowledge of design patterns and clean code principle",
                    "experience with client/server routerlications (REST API, JSON)",
                    "Strong communications and consultative skills. Self-initiated and proactive",
                    "Knowledge of the Google Play and router Store lifecycle and Firebase services",
                ],
            },
        ],
        about_job: "We are looking for new team members to join our team and build excellent mobile routerlications. A substantial part of the job is to work with the Flutter team on long-term solutions to maintain our product and create new ones. You will be working in full time position with talented and experienced engineers and closely with the product & design teams. We value positive work ethics, a high level of self-organization, and self-governance in our development team."
    },
    {
        img_url: "img/full-stack-developer.jpeg",
        id: "senior-full-stack-developer",
        title: "Senior Full Stack developer",
        date: "2, December, 2022",
        technologies_requierd: ["JavaScript", "TypeScript", "Node-js", "ExpressJs", "MongoDB", "Html5-Css", "React", "NextjS", "Git",],
        desc: [

            {
                title: "Roles and Responsibilities",
                desc: [
                    "Build and maintain React/Redux frontend routerlications and contribute to our Node.js/Typescript APIs and microservices",
                    "Become an integral part of our growing startup by contributing on a technical and personal level",
                    "Assisting clients in making good decisions and choosing best solutions",
                ],
            },
            {
                title: "Qualifications and Requirements",
                desc: [
                    "Excellent knowledge of using React for front end development (although other Javascript frameworks will be considered)",
                    "Solid understanding of Node.js for back end development",
                    "Experience working with and integrating REST APIs",
                    "experience with client/server routerlications (REST API, JSON)",
                    "Good knowledge of modern software design patterns/anti-patterns",
                    "Firm understanding of object oriented programming as well as functional programming",
                    "Experience in building scalable cloud based solutions desirable",
                    "Knowledge of Docker/Kubernetes considered a plus",
                ],
            },
        ],
        about_job: "We're Seeking a Full stack developer with strong Knowledge of front end dev and backend dev skills to join our team and help build exciting products from the ground up, leveraging your expertise in Typescript and Javascript. You will contribute technical know-how, ideas and ultimately be a huge part of development"
    },
];
router.get("/hiring", async (req, res) => {
    res.render("hiring", { jobs: jobs });
})





router.get("/invoice", async (req, res) => {
    try {
        let subscription_id = req.query.id;

        const subscription = await Subscriptions.findOne({
            _id: subscription_id,
        },)
        if (subscription == null) {
            res.send("Not Found")
        } else {
            const gym = await Gyms.findOne({
                _id: ObjectId(subscription.gym_id),
            });
            const member = await Members.findOne({
                _id: ObjectId(subscription.member_id),
            });

            res.render("invoice", {
                subscription: {
                    subscription: subscription,
                    gym: gym,
                    member: member,
                }
            });
        }

    } catch (error) {
        res.send("Not Found")
    }
})




router.get("/clinet_invoice", async (req, res) => {
    try {
        let subscription_id = req.query.id;
        let status = req.query.status;
        let invoice_status = req.query.invoice_status;
        if ((status != null) || (status != undefined)) {
            status = Number.parseInt(status);
        }
        console.log(status)
        const subscription = await Subscriptions.findOne({
            _id: subscription_id,
        },)
        if (subscription == null) {
            res.send("NotFound")
        } else {
            const gym = await Gyms.findOne({
                _id: ObjectId(subscription.gym_id),
            });
            const member = await Members.findOne({
                _id: ObjectId(subscription.member_id),
            });
            var subscription_info = {
                subscription: subscription,
                gym: gym,
                member: member,
                isClient: status === 0 ? true : false
            }
            console.log(invoice_status)
            if (invoice_status === "10") {
                res.render("client/client_invoice.ejs", {
                    subscription: subscription_info,
                })
            } else if (invoice_status === "11") {
                browser = await puppeteer.launch();
                const [page] = await browser.pages();
                const html = await ejs.renderFile(path.join(__dirname + "../../../views/", "client/client_invoice.ejs"), {
                    subscription: subscription_info,
                });
                await page.setContent(html);
                const pdf = await page.pdf({ format: "A4" });
                res.contentType("application/pdf");
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=invoice.pdf"
                );
                res.send(pdf);
            }else{
                console.log(error)
        res.send("Not Found")
            }
        }

    } catch (error) {
        console.log(error)
        res.send("Not Found")
    }
})


router.get("/api/subscriptions", middleware.verifyToken, async (req, res) => {
    let id = req.user.user_id;
    const page = req.query.page;
    const month = req.query.month;
    let ids = [];
    let memebrs = [];
    if (id !== undefined && id !== "") {
        try {
            if (month === undefined || month === "null" || month === "") {
                let gymm = await Gyms.findOne({ _id: id }).
                    populate({
                        path: "Subscriptions",
                        options: {
                            limit: 30,
                            sort: { createdAt: -1 },
                            skip: Number.parseInt(page) * 30
                        }
                    });
                res.status(200).send({
                    success: true, message: "ok", results: {
                        orders: gymm.Subscriptions,
                    },
                });
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
                match["createdAt"] = { "$gte": new Date(startDate).toISOString(), "$lt": new Date(endDate).toISOString() }
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
                res.status(200).send({
                    success: true, message: "ok", results: {
                        orders: gym.Subscriptions,
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
});

router.get("/job_details", (req, res) => {
    let job_id = req.query.id

    let job = jobs.filter(job => job.id == job_id);
    if (job_id == "" || job_id == undefined || job == undefined) {
        res.render("hiring", { jobs: jobs })
    }
    res.render("job_details", { job: job[0] });
})


router.get("/share", async (req, res) => {
    let member_id = req.query.id
    if (member_id != "" || member_id != undefined) {
        const member = await Members.findOne({
            _id: ObjectId(member_id),
        });
        res.render("share_qr", { member: member })
    }
})


router.post("/api/create_payment", middleware.verifyToken, paymentsController.createPayment)

router.post("/api/check_payment", middleware.verifyToken, paymentsController.checkPayment)

module.exports = router;