const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
    type:{
        type:String,
        enum:['income','expense','transfer'],
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    division:{
        type:String,
        enum:['personal','office'],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true,
        default:Date.now
    },
    fromAccount:{
        type:String
    },
    toAccount:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ division: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
