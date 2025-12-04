const router = require("express").Router();
const Message = require("../models/Message");

// Send Message
router.post("/send", async (req, res) => {
  try {
    const { channelId, userId, text } = req.body;

    const msg = await Message.create({ channelId, userId, text });

    res.json({ msg: "Message sent", message: msg });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get Messages (last 20)
router.get("/:channelId", async (req, res) => {
  try {
    const channelId = req.params.channelId;

    const messages = await Message.find({ channelId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
router.get("/:channelId", async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const page = parseInt(req.query.page) || 1;   // which page?
    const limit = 20;                             // fixed 20 messages per page
    const skip = (page - 1) * limit;

    const messages = await Message.find({ channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
