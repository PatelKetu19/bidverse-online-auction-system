const express = require('express');
const router  = express.Router();
const Product = require('../models/product');
const Bid     = require('../models/bid');

/* ── POST /bid/place ─────────────────────────────────────────────── */
router.post('/place', async (req, res) => {
    try {
        const { productId, bidder, amount } = req.body;
        if (!productId || !bidder || !amount)
            return res.status(400).json({ message: 'All fields required' });

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        if (product.status !== 'approved')
            return res.status(400).json({ message: 'Bidding is not open for this product' });
        if (product.auctionStartTime && new Date() < product.auctionStartTime)
            return res.status(400).json({ message: `Auction hasn't started yet. It starts at ${new Date(product.auctionStartTime).toLocaleString()}` });
        if (product.bidEndTime && new Date() > product.bidEndTime)
            return res.status(400).json({ message: 'Auction time has ended' });

        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0)
            return res.status(400).json({ message: 'Invalid amount' });
        if (amt <= product.basePrice)
            return res.status(400).json({ message: `Bid must be higher than base price of ₹${product.basePrice}` });
        if (amt <= product.currentBid)
            return res.status(400).json({ message: `Bid must be higher than current bid of ₹${product.currentBid}` });

        const windowSec  = product.bidWindowSec || 30;
        const newEndTime = new Date(Date.now() + windowSec * 1000);
        product.currentBid = amt;
        product.bidEndTime = newEndTime;
        await product.save();

        const bid = new Bid({ productId: product._id.toString(), bidder, amount: amt });
        await bid.save();

        res.json({ message: 'Bid placed successfully!', currentBid: amt, bidEndTime: newEndTime, bidWindowSec: windowSec });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── GET /bid/product/:productId  (all bids for one product, sorted highest first) ── */
router.get('/product/:productId', async (req, res) => {
    try {
        const bids = await Bid.find({ productId: req.params.productId }).sort({ amount: -1 });
        res.json(bids);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── GET /bid/buyer/:bidderName
   Returns one entry per product this buyer participated in,
   enriched with product info + auction result.
   Shows the buyer's HIGHEST bid per product.                ─────── */
router.get('/buyer/:bidderName', async (req, res) => {
    try {
        const bidderName = decodeURIComponent(req.params.bidderName).trim();
        if (!bidderName) return res.json([]);

        // All bids by this buyer
        const allBids = await Bid.find({ bidder: bidderName }).sort({ createdAt: -1 });
        if (allBids.length === 0) return res.json([]);

        // Group by productId — keep the highest bid per product
        const byProduct = {};
        allBids.forEach(b => {
            const pid = b.productId;
            if (!byProduct[pid] || b.amount > byProduct[pid].amount) {
                byProduct[pid] = b;
            }
        });

        // Enrich with product details
        const enriched = await Promise.all(
            Object.values(byProduct).map(async (b) => {
                const product = await Product.findById(b.productId);
                if (!product) return null;

                // All bids for this product (to show all participants)
                const allProductBids = await Bid.find({ productId: b.productId }).sort({ amount: -1 });

                return {
                    _id:          b._id,
                    productId:    b.productId,
                    productName:  product.name,
                    seller:       product.seller,
                    basePrice:    product.basePrice,
                    myBidAmount:  b.amount,              // buyer's highest bid
                    currentBid:   product.currentBid,
                    status:       product.status,
                    winner:       product.winner,
                    winnerAmount: product.winnerAmount,
                    bidEndTime:   product.bidEndTime,
                    participants: allProductBids,        // full list for Previous Auction display
                    createdAt:    b.createdAt
                };
            })
        );

        // Filter out nulls, sort by latest first
        const result = enriched
            .filter(Boolean)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
