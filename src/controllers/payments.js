

var ObjectId = require('mongodb').ObjectID;
const axios = require("axios")


const Gyms = require("../models/Gyms");

const Payments = require("../models/payments");

var controller = {};


controller.createPayment = async (req, res) => {
    console.log(process.env.PUBLIC_KEY_SLICK_PAY);
    try {
        if (req.body.amount != "" && req.body.amount != undefined) {
            axios.post('https://transfer.slick-pay.com/api/user/transfer', {
                "amount": Number.parseInt(req.body.amount),
                "title": "Client's payment",
                "type": "internal",
                "rib": "00799999002634591695",
                "fname": "Rostom",
                "lname": "Hadj said",
                "address": "Testing address for slick-pay",
                "returnUrl": "https://turing-technologies.com",
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": process.env.PUBLIC_KEY_SLICK_PAY,
                }
            }).then(({ data }) => res.status(200).send(data)).catch(({ error }) => res.status(200).send({
                success: false,
                "error": "error"
            }));
        } else {
            return res.status(400).send({
                success: false,
                "error": "please add all the requierd fileds"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            "error": "server error"
        })
    }
}


controller.checkPayment = async (req, res) => {

    const id = req.user.user_id;
    try {
        if (req.body.transfer_id != "" && req.body.transfer_id != undefined) {
            axios.get(`https://transfer.slick-pay.com/api/user/transfer/${Number.parseInt(req.body.transfer_id)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": process.env.PUBLIC_KEY_SLICK_PAY,
                }
            }).then(async ({ data }) => {

                if (data.success == 1) {
                    let dd = new Date();
                    var starting_date = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate());
                    var expiry_date = new Date(dd.getFullYear() + 1, dd.getMonth() + 1, dd.getDate());
                    const payment_info = req.body.payment_info;
                    let payment = Payments({
                        pack_price: Number.parseInt(payment_info["price"]),
                        pack_id: payment_info["id"],
                        gym_id: id,
                        starting_date: starting_date,
                        expiry_date: expiry_date
                    });
                    await payment.save();
                    await Gyms.updateOne({
                        _id: id
                    }, {
                        $push: { "payments": payment },
                        $set: {
                            "account_status": 0,
                            "subscribed": true,
                            "current_plan": payment_info["id"],
                            "sms_messages_monthly": genreatMonth(payment_info["id"]),
                        }
                    });
                } 
                res.status(200).send(data)
            }).catch(({ error }) => res.status(200).send({
                success: false,
                "error": "error"
            }));
        } else {
            res.status(400).send({
                success: false,
                "error": "please add all the requierd fileds"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            "error": "server error"
        })
    }
}


const genreatMonth = (selected_pack) => {
    let months = [];
    let sms_messages = 0;
    if (selected_pack == 0) {
        sms_messages = 30;
    } else if (selected_pack == 1) {
        sms_messages = 60;
    } else {
        sms_messages = 90;
    }
    for (let i = 0; i < 13; i++) {

        months.push({
            "month": i,
            "sms_messages": sms_messages,
        });
    }
    return months;
}


module.exports = controller;