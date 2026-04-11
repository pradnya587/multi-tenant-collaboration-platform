import Chat from "../models/Chat.js";

function parseChatId(chatId, currentUser) {
  // New format: private_{teamId}_{userId1}_{userId2}
  // Old format: c_{teamId}_general or c_{teamId}_private_{userId}
  let teamId, type, participants;

  if (chatId.startsWith("private_")) {
    // New format: private_{teamId}_{minUserId}_{maxUserId}
    const parts = chatId.split("_");
    teamId = parts[1];
    type = "private";
    participants = [parts[2], parts[3]];
  } else if (chatId.includes("_private_")) {
    // Old format: c_{teamId}_private_{userId}
    const parts = chatId.split("_");
    teamId = parts[1];
    type = "private";
    const otherUserId = parts[3];
    participants = [...new Set([currentUser.userId, otherUserId])];
  } else {
    // Group format: c_{teamId}_general
    const parts = chatId.split("_");
    teamId = parts[1];
    type = "group";
    participants = [];
  }

  return { teamId, type, participants };
}

export const syncChats = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // Group messages by chatId to minimize DB operations
    const messagesByChatId = {};
    for (const item of messages) {
      if (!messagesByChatId[item.chatId]) {
        messagesByChatId[item.chatId] = [];
      }
      messagesByChatId[item.chatId].push(item.message);
    }

    for (const [chatId, msgs] of Object.entries(messagesByChatId)) {
      const { teamId, type, participants } = parseChatId(chatId, req.user);
      
      // Deduplicate: fetch existing message IDs to avoid re-pushing
      const existing = await Chat.findOne({ chatId }, { "messages.id": 1 });
      const existingIds = new Set(
        existing?.messages?.map((m) => m.id) || []
      );
      const newMsgs = msgs.filter((m) => !existingIds.has(m.id));

      if (newMsgs.length === 0) {
        console.log(`⏭️ Skipping chatId ${chatId} — all ${msgs.length} messages already exist`);
        continue;
      }

      await Chat.findOneAndUpdate(
        { chatId },
        { 
          $push: { messages: { $each: newMsgs } },
          $setOnInsert: { teamId, type, participants }
        },
        { upsert: true, new: true }
      );

      console.log(`💾 Pushed ${newMsgs.length} new messages to chatId: ${chatId} (${msgs.length - newMsgs.length} duplicates skipped)`);
    }

    res.status(200).json({ success: true, message: "Synced successfully" });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    
    // App Security Level: 
    // Return all 'group' chats for that team.
    // Return 'private' chats ONLY if the current user's ID is in the participants array.
    const chats = await Chat.find({
      teamId,
      $or: [
        { type: "group" },
        { type: "private", participants: req.user.userId }
      ]
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
