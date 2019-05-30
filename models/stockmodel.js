const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StockSchema = new Schema ({
                Stock: String,
                Ip:String,
                Price:Number,
                Likes: Number
})

module.exports = mongoose.model('StockSchema',StockSchema);