const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  categories,
  summary
} = require("../controllers/transaction");

router.post("/create", createTransaction);
router.get("/getAllTransactions", getAllTransactions);
router.get("/getTransaction/:id", getTransactionById);
router.post("/updateTransaction/:id", updateTransaction);
router.post("/deleteTransaction/:id", deleteTransaction);

router.get("/categories", categories);
router.get("/summary", summary);

module.exports = router;
