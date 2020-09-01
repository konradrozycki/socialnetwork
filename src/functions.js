const moment = require("moment");

exports.formatDateFromMessages = function (messages) {
    for (let i = 0; i < messages.length; i++) {
        let uglyDate = messages[i].created_at;
        let prettyDate = moment(uglyDate).format("YYYY-MM-DD H:mm");
        messages[i].prettyDate = prettyDate;
    }
    return messages;
};

exports.formatDateFromNewMessage = function (message) {
    let uglyDate = message.created_at;
    let prettyDate = moment(uglyDate).format("YYYY-MM-DD H:mm");
    message.prettyDate = prettyDate;
    return message;
};
