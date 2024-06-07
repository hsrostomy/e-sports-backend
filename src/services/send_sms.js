
const axios = require("axios")

const sendSms = async (phoneNumber) => {
    axios.post('https://wsp.sms-algerie.com/api/json?function=sms_send', {},
        {
            params: {
                'apikey': process.env.API_KEY_SMS,
                'userkey': process.env.USER_KEY_SMS,

                'message': encodeURIComponent('Votre SMS a été envoyé'),

                'to': phoneNumber,
                'message_priority': 'Urgent'
            },
            headers: {}
        }).then(data => {
            console.log(data['data']);
        }).catch(erro => {
            console.log(erro);
            return null;
        });
}


module.exports = {
    sendSms: sendSms
};