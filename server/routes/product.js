const express = require('express');
const router  = express.Router();
const Product = require('../models/product');
const Bid     = require('../models/bid');

/* ── POST /product/add ───────────────────────────────────────────── */
router.post('/add', async (req, res) => {
    try {
        const { name, basePrice, seller, imageData, imageMime } = req.body;
        if (!name || !basePrice || !seller)
            return res.status(400).json({ message: 'All fields required' });
        const product = new Product({
            name, basePrice, currentBid: basePrice, seller, status: 'pending',
            imageData: imageData || null, imageMime: imageMime || null
        });
        await product.save();
        res.json({ message: 'Product submitted for approval', product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── GET /product/live
   Returns ALL approved products (live + upcoming/scheduled).
   Client uses auctionStartTime to distinguish "live" vs "upcoming".
─────────────────────────────────────────────────────────────────── */
router.get('/live', async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved' });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── GET /product/closed  — only status:'closed'|'unsold' ── */
router.get('/closed', async (req, res) => {
    try {
        const products = await Product.find({ status: { $in: ['closed','unsold'] } }).sort({ updatedAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── GET /product/all  (approved+closed+unsold) */
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find({ status: { $in: ['approved','closed','unsold'] } });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── POST /product/resubmit/:id ─────────────────────────────────── */
router.post('/resubmit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.status !== 'unsold') return res.status(400).json({ message: 'Only unsold products can be resubmitted' });
        product.status        = 'pending';
        product.winner        = null;
        product.winnerAmount  = null;
        product.bidEndTime    = null;
        product.auctionStartTime = null;
        product.currentBid    = product.basePrice;
        await product.save();
        res.json({ message: 'Product resubmitted for approval', product });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── GET /product/seller/:name ──────────────────────────────────── */
router.get('/seller/:sellerName', async (req, res) => {
    try {
        const products = await Product.find({ seller: decodeURIComponent(req.params.sellerName) });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── GET /product/admin/all ─────────────────────────────────────── */
router.get('/admin/all', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── PUT /product/approve/:id ───────────────────────────────────── */
router.put('/approve/:id', async (req, res) => {
    try {
        const bidWindowSec = parseInt(req.body.bidWindowSec) || 30;
        const auctionStartTime = req.body.auctionStartTime ? new Date(req.body.auctionStartTime) : null;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', bidWindowSec, bidEndTime: null, auctionStartTime: auctionStartTime },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product approved', product });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── PUT /product/reject/:id ────────────────────────────────────── */
router.put('/reject/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product rejected', product });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── POST /product/start-scheduled ──────────────────────────────────
   Called every second by clients (piggy-backed on the 1s $interval).
   Finds approved products whose auctionStartTime has arrived but
   bidEndTime is still null → auto-starts the bid window countdown.
   This ensures the countdown begins at admin-scheduled time even
   when NO buyer has placed any bid.
──────────────────────────────────────────────────────────────────── */
router.post('/start-scheduled', async (req, res) => {
    try {
        const now = new Date();
        const toStart = await Product.find({
            status: 'approved',
            auctionStartTime: { $ne: null, $lte: now },
            bidEndTime: null
        });

        const started = [];
        for (const p of toStart) {
            const windowSec = p.bidWindowSec || 30;
            p.bidEndTime = new Date(now.getTime() + windowSec * 1000);
            await p.save();
            started.push(p._id);
            console.log(`[Auto-Start] "${p.name}" auction started — bidEndTime: ${p.bidEndTime}`);
        }
        res.json({ started: started.length, ids: started });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── POST /product/finalize ──────────────────────────────────────────
   Closes approved products whose bidEndTime has passed.
   - Has bids → closed, winner = highest bidder
   - No bids  → unsold (re-auction queue)
──────────────────────────────────────────────────────────────────── */
router.post('/finalize', async (req, res) => {
    try {
        const now = new Date();
        const expired = await Product.find({
            status: 'approved',
            bidEndTime: { $ne: null, $lt: now }
        });
        for (const p of expired) {
            const bids = await Bid.find({ productId: p._id.toString() }).sort({ amount: -1 });
            if (bids.length > 0) {
                p.winner       = bids[0].bidder;
                p.winnerAmount = bids[0].amount;
                p.status       = 'closed';
            } else {
                // No bids — unsold, goes to re-auction queue
                p.winner       = null;
                p.winnerAmount = null;
                p.status       = 'unsold';
                console.log(`[Unsold] "${p.name}" had no bids — moved to re-auction queue`);
            }
            await p.save();
        }
        res.json({ finalized: expired.length });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── GET /product/:id  (single product) ────────────────────────── */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
