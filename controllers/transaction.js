const Transaction = require("../models/transaction");
const Account = require("../models/account");

exports.createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const savedTransaction = await transaction.save();

    if (transaction.type == "income" && req.body.toAccount) {
      // Update the toAccount balance
      await Account.findOneAndUpdate(
        { name: req.body.toAccount },
        { $inc: { balance: req.body.amount } },
      );
    } else if (transaction.type == "expense" && req.body.fromAccount) {
      // Update the fromAccount balance
      await Account.findOneAndUpdate(
        { name: req.body.fromAccount },
        { $inc: { balance: -req.body.amount } },
      );
    } else if (transaction.type == "transfer") {
      // Update both fromAccount and toAccount balances
      await Account.findOneAndUpdate(
        { name: req.body.fromAccount },
        { $inc: { balance: -transaction.amount } },
      );
      await Account.findOneAndUpdate(
        { name: req.body.toAccount },
        { $inc: { balance: transaction.amount } },
      );
    }

    res.status(201).json({ success: true, data: savedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { type, category, division, startDate, endDate, period } = req.query;
    let filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (division) filter.division = division;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (period) {
      const now = new Date();
      let start;
      if (period === "week") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      } else if (period === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === "year") {
        start = new Date(now.getFullYear(), 0, 1);
      }

      if (start) {
        filter.date = { $gte: start };
      }
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const isEditAllowed = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInHours = Math.abs(now - created) / 36e5;
  return diffInHours <= 12;
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    if (!isEditAllowed(transaction.createdAt)) {
      return res
        .status(403)
        .json({ success: false, message: "Editing time window has expired" });
    }
    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const oldFromAccount = transaction.fromAccount;
    const oldToAccount = transaction.toAccount;

    if (oldType === "income" && oldToAccount) {
      await Account.findOneAndUpdate(
        { name: oldToAccount },
        { $inc: { balance: -oldAmount } },
      );
    } else if (oldType === "expense" && oldFromAccount) {
      await Account.findOneAndUpdate(
        { name: oldFromAccount },
        { $inc: { balance: oldAmount } },
      );
    } else if (oldType === "transfer") {
      await Account.findOneAndUpdate(
        { name: oldFromAccount },
        { $inc: { balance: oldAmount } },
      );
      await Account.findOneAndUpdate(
        { name: oldToAccount },
        { $inc: { balance: -oldAmount } },
      );
    }
    Object.assign(transaction, req.body);
    transaction.updatedAt = Date.now();
    const updatedTransaction = await transaction.save();

    if (transaction.type === "income" && req.body.toAccount) {
      await Account.findOneAndUpdate(
        { name: req.body.toAccount },
        { $inc: { balance: transaction.amount } },
      );
    } else if (transaction.type === "expense" && req.body.fromAccount) {
      await Account.findOneAndUpdate(
        { name: req.body.fromAccount },
        { $inc: { balance: -transaction.amount } },
      );
    } else if (transaction.type === "transfer") {
      await Account.findOneAndUpdate(
        { name: transaction.fromAccount },
        { $inc: { balance: -transaction.amount } },
      );
      await Account.findOneAndUpdate(
        { name: transaction.toAccount },
        { $inc: { balance: transaction.amount } },
      );
    }

    res.status(200).json({ success: true, data: updatedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    if (transaction.type === "income" && transaction.toAccount) {
      await Account.findOneAndUpdate(
        { name: transaction.toAccount },
        { $inc: { balance: -transaction.amount } },
      );
    } else if (transaction.type === "expense" && transaction.fromAccount) {
      await Account.findOneAndUpdate(
        { name: transaction.fromAccount },
        { $inc: { balance: transaction.amount } },
      );
    } else if (transaction.type === "transfer") {
      await Account.findOneAndUpdate(
        { name: transaction.fromAccount },
        { $inc: { balance: transaction.amount } },
      );
      await Account.findOneAndUpdate(
        { name: transaction.toAccount },
        { $inc: { balance: -transaction.amount } },
      );
    }
    await Transaction.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.categories = async (req, res) => {
  try {
    const categories = await Transaction.distinct("category");
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.summary = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (period) {
      const now = new Date();
      let start;
      if (period === "week") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      } else if (period === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === "year") {
        start = new Date(now.getFullYear(), 0, 1);
      }
      if (start) {
        dateFilter = { $gte: start };
      }
    }

    const filter =
      dateFilter.constructor === Object && Object.keys(dateFilter).length > 0
        ? { date: dateFilter }
        : {};

    const incomeTotal = await Transaction.aggregate([
      { $match: { ...filter, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const expenseTotal = await Transaction.aggregate([
      { $match: { ...filter, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { ...filter, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
    const divisionBreakdown = await Transaction.aggregate([
      { $match: { filter } },
      {
        $group: {
          _id: { division: "$division", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: {
        totalIncome: incomeTotal[0]?.total || 0,
        totalExpense: expenseTotal[0]?.total || 0,
        balance: (incomeTotal[0]?.total || 0) - (expenseTotal[0]?.total || 0),
        categoryBreakdown,
        divisionBreakdown,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
