


const serverResponse =
    (res, success, message, results, code) => {
    return res.status(code).send({ success: success, message: message, results: results });
    }

module.exports = {
    serverResponse: serverResponse,
};


