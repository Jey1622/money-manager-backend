const express = require("express");
const router = express.Router();
const { createAccount,getAccounts,updateAccount,deleteAccount } = require("../controllers/account");

router.route("/create").post(createAccount);
router.route("/get").get(getAccounts);
router.route("/update/:id").post(updateAccount);
router.route("/delete/:id").post(deleteAccount);
module.exports = router;