const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name:         { type: String, required: true },
    basePrice:    { type: Number, required: true },
    currentBid:   { type: Number, required: true },
    seller:       { type: String, required: true },
    status:       { type: String, enum: ['pending','approved','rejected','closed','unsold'], default: 'pending' },
    auctionStartTime: { type: Date, default: null },
    bidEndTime:   { type: Date,   default: null },
    bidWindowSec: { type: Number, default: 30 },
    winner:       { type: String, default: null },
    winnerAmount: { type: Number, default: null },
    imageData:    { type: String, default: null },   // base64 image data
    imageMime:    { type: String, default: null }    // e.g. image/png
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
