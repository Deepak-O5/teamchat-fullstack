const router = require("express").Router();
const Channel = require("../models/Channel");
const User = require("../models/User");

// CREATE CHANNEL
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Channel.findOne({ name });
    if (exists) return res.status(400).json({ msg: "Channel already exists" });

    const channel = await Channel.create({ name });
    res.json({ msg: "Channel created", channel });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET ALL CHANNELS
router.get("/", async (req, res) => {
  try {
    const channels = await Channel.find();
    res.json(channels);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// JOIN CHANNEL
router.post("/join", async (req, res) => {
  try {
    const { channelId, userId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ msg: "Channel not found" });

    if (channel.members.includes(userId)) {
      return res.status(400).json({ msg: "Already joined" });
    }

    channel.members.push(userId);
    await channel.save();

    res.json({ msg: "Joined channel", channel });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// LEAVE CHANNEL
router.post("/leave", async (req, res) => {
  try {
    const { channelId, userId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ msg: "Channel not found" });

    channel.members = channel.members.filter(
      (m) => m.toString() !== userId.toString()
    );

    await channel.save();

    res.json({ msg: "Left channel", channel });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
