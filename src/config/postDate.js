const { DateTime } = require("luxon");

module.exports = function (dateObj) {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
};

// ISO 8601 format with timezone for structured data (Google requires this for uploadDate)
module.exports.isoDate = function (dateObj) {
    return DateTime.fromJSDate(dateObj).toISO();
};
