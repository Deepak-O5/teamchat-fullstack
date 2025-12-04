// ===== GLOBAL STATE =====
let page = 1;
let loading = false;
let noMoreMessages = false;
let typingTimeout = null;

// already-loaded messages (to avoid duplicates)
const loadedIds = new Set();

const API_BASE = "http://98.80.143.158:5000";

const user = JSON.parse(localStorage.getItem("user") || "null");
const channelId = localStorage.getItem("channelId");

// Redirect if user/channel missing
if (!user || !channelId) {
  window.location.href = "index.html";
}

// DOM elements
const messageListEl = document.getElementById("messageList");
const messageFormEl = document.getElementById("messageForm");
const messageInputEl = document.getElementById("messageInput");
const userPillEl = document.getElementById("userPill");
const loadingOlderEl = document.getElementById("loadingOlder");
const typingIndicatorEl = document.getElementById("typingIndicator");
const onlineUsersEl = document.getElementById("onlineUsers");

userPillEl.textContent = user.name || "User";

// SOCKET.IO
const socket = io(API_BASE, { transports: ["websocket", "polling"] });

// tell server we are online + join channel
socket.emit("userOnline", { userId: user._id, name: user.name, channelId });
socket.emit("joinChannel", channelId);

// realtime messages from others
socket.on("receiveMessage", (payload) => {
  if (payload.userId === user._id) return; // don't duplicate own message

  addMessageBubble({
    text: payload.text,
    timestamp: payload.time || Date.now(),
    isMe: false,
  });

  scrollToBottom();
  notifySeen();
});

// typing indicator
socket.on("typing", (data) => {
  if (data.name === user.name) return;
  typingIndicatorEl.textContent = `${data.name} is typing...`;
  typingIndicatorEl.style.display = "block";

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingIndicatorEl.style.display = "none";
  }, 1200);
});

// seen indicator updates
socket.on("seenUpdate", (data) => {
  if (data.userId !== user._id) {
    updateSeenIndicator();
  }
});

// online users
socket.on("onlineUsers", (users) => {
  onlineUsersEl.textContent = `Online: ${users.length}`;
});

// =======================================
// LOAD MESSAGES WITH PAGINATION
// Backend: OPTION 2 (oldest -> newest)
// =======================================
async function loadMessages(initial = false) {
  if (loading || noMoreMessages) return;
  loading = true;
  loadingOlderEl.style.display = "block";

  try {
    const res = await fetch(`${API_BASE}/api/messages/${channelId}?page=${page}`);
    const msgs = await res.json();

    // if nothing new, stop further calls
    if (!Array.isArray(msgs) || msgs.length === 0) {
      noMoreMessages = true;
      loadingOlderEl.style.display = "none";
      loading = false;
      return;
    }

    // we want chronological order (oldest at top, newest at bottom)
    // but while inserting at "top", we must loop from last to first
    const oldScrollHeight = messageListEl.scrollHeight;

    for (let i = msgs.length - 1; i >= 0; i--) {
      const msg = msgs[i];

      // SKIP if already rendered (prevents loop / duplicates)
      if (msg._id && loadedIds.has(msg._id)) continue;
      if (msg._id) loadedIds.add(msg._id);

      addMessageBubble(
        {
          text: msg.text,
          timestamp: msg.createdAt,
          isMe: msg.userId === user._id,
        },
        true // insert at top region
      );
    }

    if (initial) {
      scrollToBottom();
    } else {
      // maintain approximate position
      const newScrollHeight = messageListEl.scrollHeight;
      messageListEl.scrollTop = newScrollHeight - oldScrollHeight;
    }

    page++;
    notifySeen();
  } catch (err) {
    console.error("Pagination load error:", err);
  }

  loadingOlderEl.style.display = "none";
  loading = false;
}

// infinite scroll: load older when top reached
messageListEl.addEventListener("scroll", () => {
  if (messageListEl.scrollTop === 0) {
    loadMessages(false);
  }
});

// initial load
loadMessages(true);

// =======================================
// SEND MESSAGE
// =======================================
messageFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = messageInputEl.value.trim();
  if (!text) return;

  // optimistic UI
  addMessageBubble({
    text,
    timestamp: Date.now(),
    isMe: true,
  });
  scrollToBottom();
  messageInputEl.value = "";

  try {
    // save message
    await fetch(`${API_BASE}/api/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId,
        userId: user._id,
        text,
      }),
    });

    // realtime broadcast
    socket.emit("sendMessage", {
      channelId,
      userId: user._id,
      text,
    });
  } catch (err) {
    console.error("Error sending message:", err);
  }
});

// typing event from this user
messageInputEl.addEventListener("input", () => {
  socket.emit("typing", {
    channelId,
    name: user.name,
  });
});

// =======================================
// RENDER MESSAGE BUBBLE
// =======================================
function addMessageBubble({ text, timestamp, isMe }, insertAtTop = false) {
  const row = document.createElement("div");
  row.className = `message-row ${isMe ? "me" : "other"}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  const content = document.createElement("div");
  content.textContent = text;

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = formatTime(timestamp);

  bubble.appendChild(content);
  bubble.appendChild(meta);
  row.appendChild(bubble);

  // insertAtTop → insert just below loadingOlder
  if (insertAtTop) {
    if (loadingOlderEl && loadingOlderEl.parentElement === messageListEl) {
      messageListEl.insertBefore(row, loadingOlderEl.nextSibling);
    } else {
      messageListEl.prepend(row);
    }
  } else {
    messageListEl.appendChild(row);
  }
}

// =======================================
// SEEN INDICATOR HELPERS
// =======================================
function notifySeen() {
  socket.emit("seen", { channelId, userId: user._id });
}

function updateSeenIndicator() {
  const myBubbles = document.querySelectorAll(".message-row.me .message-bubble");
  if (!myBubbles.length) return;

  const last = myBubbles[myBubbles.length - 1];
  let seenEl = last.querySelector(".seen-indicator");

  if (!seenEl) {
    seenEl = document.createElement("div");
    seenEl.className = "seen-indicator";
    seenEl.textContent = "Seen ✔✔";
    last.appendChild(seenEl);
  }
}

// =======================================
// UTILS
// =======================================
function scrollToBottom() {
  requestAnimationFrame(() => {
    messageListEl.scrollTop = messageListEl.scrollHeight;
  });
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
