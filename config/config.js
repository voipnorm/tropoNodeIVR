(function () {
    "use strict";
//Please make sure to test after updating to a new customer, all words required to be spoken by Tropo. Any words not able to be pronouced
//will be blank.
    exports.apiKey          = process.env.GOOGLE_PLACES_API_KEY || "<Your google key here>";
    exports.outputFormat    = process.env.GOOGLE_PLACES_OUTPUT_FORMAT || "json";
    exports.tropoDevToken   = process.env.TROPO_DEV_TOKEN || "<Your tropo Dev key here>";
    exports.uspsDevToken   = process.env.USPS_DEV_TOKEN || "<Your USPS Dev user ID here>";
    exports.sparkRoomId     = process.env.SPARK_ROOM_ID|| "<Spark Room ID here> ";
    exports.customerName    = process.env.CUSTOMER_NAME || "<Customer or company name here that will own the IVR>";
    exports.googleQueryText = process.env.GOOGLE_QUERY_TEXT|| "<text used by Google API to find closest store location to ZIP code: can be same as customer name>";
    exports.ivrOptionOne    = process.env.OPTION_ONE || "<IVR menu option, fill out>";
    exports.ivrOptionTwo    = process.env.OPTION_TWO || "<IVR menu option, fill out>";
    exports.ivrOptionThree  = process.env.OPTION_THREE || "<IVR menu option, fill out>";
    exports.ivrOptionFour   = process.env.OPTION_FOUR || "<IVR menu option, fill out>";
    exports.ivrOptionSeven  = process.env.OPTION_SEVEN || "<IVR menu option, fill out>";
    exports.ivrOptionZero   = process.env.OPTION_ZERO || "<IVR menu option, fill out>";
    exports.transferNumber  = process.env.TRANSFER_NUMBER || "<operator number to transfer to, for demos use cell phone number>";
})();