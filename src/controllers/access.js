
const Gyms = require("../models/Gyms");


const Access = require("../models/access");
const bcrypt = require('bcryptjs')

var controller = {

};

controller.createAccess = async (req, res) => {
    const id = req.user.user_id;
    const body = req.body;
    try {
        const exists = await Gyms.findOne({ phone_number: body.phone_number, });

        if (exists) {
            res.json({ success: true, message: "phone number already in use", resutls: false }).status(200);
        } else {
            console.log("user exists");
            const newPassword = await bcrypt.hash(body.password, 10);
            let access = Access(body);
            access.password = newPassword;
            access.gym_id = id;
            access.save();
            await
                Gyms.updateOne({ _id: id }, { $push: { access: access } },);
            res.json({ success: true, message: "user exists", resutls: true }).status(200);
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "error" }).status(500);
    }
}



controller.deleteAccess = async (req, res) => {
    const user_id = req.body.user_id;
    const id = req.user.user_id;
    try {
        if (user_id != undefined && user_id != "") {

            let response = await Gyms.updateOne({ _id: id },
                { $pull: { "access": user_id } });
            if (response)
                return res.status(200).send({ success: true, message: response });

        } else {
            return res.status(400).send({ success: false, message: "please enter the required fields" });
        }
    } catch (error) {
        return res.status(400).send({ success: false, message: "please enter the required fields" });
    }

};


controller.getAccesses = async (req, res) => {

    const id = req.user.user_id;
    if (id != undefined && id != "") {
        try {
            let data = [];
            let gym = await Gyms.findOne({ _id: id }).populate({ path: "access" });
            for (let index = 0; index < gym.access.length; index++) {
                const element = gym.access[index];
                element.password = "";
                data.push(element);
            }
            res.status(200).send({
                success: true, message: "ok", results: {
                    data: data,
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
