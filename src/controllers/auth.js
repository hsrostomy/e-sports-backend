

const bcrypt = require('bcryptjs')

var jwt = require("jsonwebtoken");

const Access = require("../models/access");


const Gyms = require("../models/Gyms")


var controller = {};


controller.checkPhoneNumber = async (req, res) => {
    const body = req.body;
    try {
        const exists = await Gyms.findOne({ phone_number: body.phone_number, });

        if (exists) {
            console.log("user exists");
            res.json({ success: true, message: "user exists", resutls: true }).status(200);
        } else {
            res.json({ success: true, message: "user don't exists", resutls: false }).status(200);
        }
    } catch (error) {
        res.json({ success: false, message: "error" }).status(500);
    }
}

controller.register = async (req, res) => {
    let body = req.body;
    try {
        const exists = await Gyms.findOne({ phone_number: body.phone_number, });
        if (exists) {
            console.log("user exists");
            res.json({ success: false, message: "user exists" }).status(200);
        } else {
            const newPassword = await bcrypt.hash(body.password, 10);
            let gym = Gyms(body);
            gym.password = newPassword;
            gym.wilaya = body.wilaya;
            gym.subscribed = false;
            await Gyms.create(gym);
            const token = jwt.sign(
                {
                    name: gym.gym_name,
                    phone_number: gym.phone_number,
                    user_id: gym._id,
                },
                process.env.TOKEN_KEY_SECERT
            );
            res.json({
                success: true, message: "Gyms created", results: {
                    "gym_uid": gym._id,
                    "token": token,
                    "role": 0
                }
            }).status(200);
        }

    } catch (error) {
        res.json({ error: "ok", "message": error }).status(500);
    }
};



///Login gym
controller.login = async (req, res) => {
    const { password, phone_number } = req.body;
    if (password != undefined && phone_number != undefined) {
        try {
            const gym = await Gyms.findOne({
                "phone_number": phone_number,
            });
            const access = await Access.findOne({ phone_number: phone_number, });
            console.log(gym);
            console.log(access);
            if (gym == null && access == null) {
                return res.status(200).send({ success: false, message: 'there"s No Account with this Email', results: null })
            }
            const isPasswordValid = await bcrypt.compare(
                password,
                access ? access.password : gym.password
            )
            if (isPasswordValid) {
                const token = jwt.sign(
                    {
                        name: access ? "" : gym.gym_name,
                        phone_number: access ? access.phone_number : gym.phone_number,
                        user_id: access ? access.gym_id : gym._id,
                    },
                    process.env.TOKEN_KEY_SECERT
                );
                return res.status(200).send({
                    success: true, message: 'ok', results: {
                        "gym_uid": access ? access.gym_id : gym._id,
                        "token": token,
                        "role": access ? access.role : 0
                    }
                })
            } else {
                return res.json({ success: false, message: 'wrong password', resutls: false })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).send({ success: false, message: 'Server Error', resutls: null })
        }
    } else {
        return res.status(400).send({ success: false, message: 'invalid password & email', resutls: false })
    }

};

controller.checkPassword = async (req, res) => {
    const { password } = req.body;
    const id = req.user.user_id;

    try {
        const gym = await Gyms.findOne({
            _id: id,
        });
        if (!gym) {
            return res.status(200).send({ success: false, message: 'there"s no accounts with this Email', reutls: null })
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            gym.password
        )
        if (isPasswordValid) {
            return res.status(200).send({
                success: true, message: 'ok', resutls: true
            })
        } else {
            return res.json({ success: false, message: 'wrong password', resutls: false })
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: 'Server Error', resutls: null })

    }
}

controller.updatePassowrd = async (req, res) => {
    const { old_password, password } = req.body;
    const id = req.user.user_id;
    try {
        const gym = await Gyms.findOne({
            _id: id,
        });
        if (!gym) {
            return res.status(200).send({ success: false, message: 'there"s No Account with this Email', reutls: null })
        }
        const isPasswordValid = await bcrypt.compare(
            old_password,
            gym.password
        )
        if (isPasswordValid) {
            const newPassword = await bcrypt.hash(password, 10);
            const updatePassw = await Gyms.updateOne({
                _id: id,
            }, {
                $set: {
                    "password": newPassword
                }
            });
            return res.status(200).send({
                success: true, message: 'ok', reutls: "password was reset successfuly"
            })
        } else {
            return res.json({ success: false, message: 'wrong password', gym: false })
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: 'Server Error', resutls: null })

    }
}



controller.forgetPassowrd = async (req, res) => {
    const { phone_number, password } = req.body;

    try {
        const gym = await Gyms.findOne({
            phone_number: phone_number,
        });
        if (!gym) {
            return res.status(200).send({ success: false, message: 'there"s No Account with this Email', reutls: null })
        }
        const newPassword = await bcrypt.hash(password, 10);
        const updatePassw = await Gyms.updateOne({
            _id: gym._id,
        }, {
            $set: {
                "password": newPassword
            }
        });
        return res.status(200).send({
            success: true, message: 'ok', reutls: "password was reset successfuly"
        })
    } catch (error) {
        return res.status(500).send({ success: false, message: 'Server Error', resutls: null })

    }
}

controller.updateFeesOfSignIn = async (req, res) => {
    const id = req.user.user_id;
    const { value } = req.body;

    try {
        const gym = await Gyms.findOne({
            _id: id,
        });
        if (!gym) {
            return res.status(200).send({ success: false, message: 'there"s No Account with this id', reutls: null })
        }
        const updateFeesOfSignIn = await Gyms.updateOne({
            _id: id,
        }, {
            $set: {
                "sigin_fees": value
            }
        });
        return res.status(200).send({
            success: true, message: 'ok', reutls: "password was reset successfuly"
        })
    } catch (error) {
        return res.status(500).send({ success: false, message: 'Server Error', resutls: null })

    }
}


module.exports = controller;
