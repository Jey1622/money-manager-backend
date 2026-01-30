const Account = require("../models/account");

exports.createAccount = async (req, res) => {
  try {
    const account = new Account(req.body);
    const savedAccount = await account.save();
    res.status(201).json({ success: true, data: savedAccount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true },
    );
    res.status(200).json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
    try {
      const account = await Account.findByIdAndDelete(req.params.id);
      if (!account) {
        return res.status(404).json({ success: false, message: "Account not found" });
      }
      res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
};
