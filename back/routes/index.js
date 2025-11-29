const express = require("express");
const router = express.Router();

router.use("/bookings", require("./bookings"));
router.use("/services", require("./services")); 
router.use("/users", require("./users"));
router.use("/categories", require("./categories"));
router.use("/reviews", require("./reviews"));

module.exports = router;


//this is for a dumb test to see if the commit will work again