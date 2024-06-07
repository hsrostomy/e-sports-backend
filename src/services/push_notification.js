

const admin = require("firebase-admin");


async function pushNotificationToDevice(deviceToke,data) {
    admin.messaging().send({
        token: deviceToke,
        data: data,

        android: {
            priority: "high",
        },
        
        apns: {
            payload: {
                aps: {
                    contentAvailable: true,
                },
            },
            headers: {
                "apns-push-type": "background",
                "apns-priority": "5", // Must be `5` when `contentAvailable` is set to true.
                "apns-topic": "io.flutter.plugins.firebase.messaging", // bundle identifier
            },
        },
    });
}

module.exports = pushNotificationToDevice;