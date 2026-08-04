const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    bidder:    { type: String, required: true },
    amount:    { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bid', BidSchema);
