
const Gyms = require("../models/Gyms");



var controller = {};


controller.getListUsers = async (req, res) => {
    try {
        let gyms = await
            Gyms.find({ account_status: 1 });
        return res.status(200).send({
            success: true, message: "Member beenn adedd succelfy", results: gyms
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }
}

controller.validateAccess = async (req, res) => {
    const id = req.body.id;
    try {
        let gyms = await
            Gyms.updateOne({ _id: id }, {
                account_status: 0
            });
        return res.status(200).send({
            success: true, message: "Member beenn adedd succelfy", results: gyms
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }
}

module.exports = controller;
