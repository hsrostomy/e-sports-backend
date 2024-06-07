
const Products = require("../models/proudtcs");

const Gyms = require("../models/Gyms");


const compressImages = require("compress-images")

const fs = require("fs");

var controller = {};

const { UPLOAD_DIR } = require("../../settings");


var ObjectId = require('mongodb').ObjectID;


//// get all products by Store iD
controller.getProductsByStoreID = async (req, res) => {

    let id = req.user.user_id;
    const page = req.query.page;
    const month = req.query.month;
    let match = {};

    let startDate = "";
    let endDate = "";
    const date = new Date();
    const y = date.getFullYear();
    let m = Number.parseInt(month);
    startDate = new Date(y, m, 1).toUTCString();
    endDate = new Date(y, m + 1, 1).toUTCString();
    month === undefined || month === "null" || month === "" ? null : match["lastSaledAt"] = { "$gte": new Date(startDate).toISOString(), "$lt": new Date(endDate).toISOString() };

    console.log(match);
    if (req.body.category_index != undefined) {
        console.log(req.body.category_index)
        match = {
            "category": { $eq: req.body.category_index },
        };
    }
    if (id != undefined && id != "") {
        try {

            let gym = await Gyms.findOne({ _id: id }).populate({
                path: "products",
                match,
                options: {
                    limit: 30,
                    sort: { created: -1 },
                    skip: Number.parseInt(page) * 30
                }
            },);

            res.status(200).send({
                success: true, message: "ok", results: {
                    products: gym.products,
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


/// add new PRoduct to List of products

controller.addProduct = async (req, res) => {
    const id = req.user.user_id;

    console.log(req.body.product);
    let product = Products(JSON.parse(req.body.product));

    let imagePath = "";
    if (req.files != undefined) {

        let productPic = req.files.file;

        let pic_name = (new Date().getTime()) + "-" + productPic.name;

        let uploadPath = UPLOAD_DIR + "/products/";

        const filePath = UPLOAD_DIR + "/temp-uploads/" + pic_name;
        const compression = 60
        product.img_url = pic_name;

        fs.writeFile(filePath, productPic.data, async function (error) {
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

                    try {
                        fs.unlink(filePath, function (error) {
                            if (error) {
                                console.log(error);
                            } else {

                            }
                        })
                    } catch (error) {
                        return res.status(500).send({ success: false, message: "server error", results: null });

                    }
                }
            )
        })

    }
    try {
        product.is_deleted = false;
        product.gym_id = id;
        product.sells = [];
        await product.save();
        let response = await
            Gyms.updateOne({ _id: id }, {
                $push: { products: product },
            },);
        return res.status(200).send({
            success: true, message: "Product beenn adedd succelfy", results: {
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "server error", results: null });
    }


};

controller.updateProduct = async (req, res) => {

    try {
        let body = JSON.parse(req.body.product)
        const id = JSON.parse(req.body.product_id);
        let product = Products(body);
        if (req.files != undefined) {
            let productPic = req.files.file;

            let pic_name = (new Date().getTime()) + "-" + productPic.name;

            let uploadPath = UPLOAD_DIR + "/products/";

            const filePath = UPLOAD_DIR + "/temp-uploads/" + pic_name;
            const compression = 60
            body.img_url = pic_name;
            fs.writeFile(filePath, productPic.data, async function (error) {
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
            let oldURL = JSON.parse(req.body.old_url);
            if (oldURL == "" || oldURL == undefined) {
            } else {
                try {
                    fs.unlink(UPLOAD_DIR + "/products/" + oldURL, (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Delete File successfully.");
                    });
                } catch (error) {
                    console.log(error);
                    res.status(500).send({ success: false, message: "ok" })
                }
            }
        }
        let response = await
            Products.updateOne({ _id: id }, body);
        return res.status(200).send({
            success: true, message: "product has been updated successfully", results: {
            }
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }

};

controller.deleteProduct = async (req, res) => {
    const proudtc_id = req.body.proudtc_id;
    const id = req.user.user_id;
    console.log(proudtc_id);
    try {
        if (proudtc_id != undefined && proudtc_id != "") {
            await Products.deleteOne({ _id: proudtc_id });
            let response = await Gyms.updateOne({ _id: id }, {
                $pull: { "products": ObjectId(proudtc_id) }, $set: {
                    "is_deleted": true
                }
            });
            if (response)
                return res.status(200).send({ success: true, message: response });

        } else {
            return res.status(400).send({ success: false, message: "please enter the required fields" });
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: "server error" });
    }
};


controller.getProductByCodeBar = async (req, res) => {
    const code_bar = req.body.code_bar;
    console.log(code_bar);
    if (code_bar != undefined || code_bar != "") {
        try {

            let product = await Products.findOne({ code_bar: code_bar })
            if (product) {
                res.status(200).send({
                    success: true, message: "ok", results: {
                        product: product,
                    },
                });
            } else {
                res.status(200).send({
                    success: false, message: "there's no order was found with this tracking number", results: null
                });
            }

        } catch (error) {
            console.log(error);
            res.status(500).send({ success: false, message: "Server Error", results: null });
        }
    } else {
        res.status(404).send({ success: false, message: "Invalid code bar", results: null });
    }

}



controller.sellProduct = async (req, res) => {
    const id = req.body.product_id;
    let qnt = Number.parseInt(req.body.qnt)
    console.log(qnt);
    try {
        let response = await
            Products.updateOne({ _id: id }, {
                $inc: { qnt: -qnt },
                $push: {
                    sells: {
                        "qnt": qnt,
                        "date": new Date(),

                    }
                }, $set: {
                    "lastSaledAt": new Date()
                }
            });
        return res.status(200).send({ success: true, message: "product been updated succelfy", results: response });

    } catch (error) {
        return res.status(500).send({ success: false, message: "Server Error", results: null });
    }
};


controller.SearchForProductBy = async (req, res) => {
    const id = req.user.user_id;
    const query = req.body.query;
    let match = {};
    try {
        match["gym_id"] = { $eq: ObjectId(id) };
        match["is_deleted"] = false,
            console.log(match);

        let response = await Products.aggregate([
            {
                $search: {
                    "index": "search_products",
                    "autocomplete": {
                        "query": query,
                        "path": "name"
                    }
                },
            },

            { $limit: 10, },
            { $match: match }

        ]);
        console.log(response);
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

module.exports = controller;
