const config = require('../../config');
const StrikeService = require('./StrikeService');

// In-memory spam tracker (DB is too slow for high-freq spam checks usually, hybrid is best)
const spamTracker = {};

class ModerationService {
    static async checkMessage(client, msg) {
        const chat = await msg.getChat();

        // Skip if not group or not target group (optional specific check)
        if (!config.TARGET_GROUPS.includes(chat.name)) {
            // console.log(`[DEBUG] Skipping moderation. Chat: "${chat.name}" is not in target list.`);
            return;
        }

        const senderId = msg.author || msg.from;
        const contact = await msg.getContact();
        const userLogName = `+${contact.number} (${contact.pushname || ''})`;

        // 1. Anti-Spam Check
        if (this.isSpam(senderId)) {
            // Instant Kick/Ban for spam
            try {
                await chat.removeParticipants([senderId]);
                await chat.sendMessage(`⛔ @${senderId.split('@')[0]} spam yaptığı için atıldı.`, { mentions: [senderId] });
            } catch (e) {
                console.error("Failed to kick spammer", e);
            }
            return true; // Stop processing
        }

        // 2. Visual Moderation (AI)
        if (msg.hasMedia) {
            try {
                const media = await msg.downloadMedia();
                if (media && (media.mimetype.startsWith('image/') || media.mimetype.startsWith('sticker'))) {
                    const ImageAnalysisService = require('./ImageAnalysisService');
                    const nsfwReason = await ImageAnalysisService.isNSFW(Buffer.from(media.data, 'base64'));

                    if (nsfwReason) {
                        await msg.delete(true);
                        // Instant Ban for Porn
                        await chat.removeParticipants([senderId]);
                        await chat.sendMessage(`⛔ @${senderId.split('@')[0]} +18 içerik attığı için banlandı (${nsfwReason}).`, { mentions: [senderId] });
                        return true;
                    }
                }
            } catch (err) {
                console.error("Media analysis failed:", err);
            }
        }

        // 2. Content Filter
        const violation = this.checkContent(msg.body);
        if (violation) {
            console.log(`[MOD] Detected violation: "${violation}" from ${userLogName}`);

            try {
                // Delete
                await msg.delete(true);
                console.log(`[MOD] Message deleted from ${userLogName}`);

                // Warn (Strike System)
                const result = await StrikeService.addStrike(senderId, chat.id._serialized, `Used banned word: ${violation}`);
                console.log(`[MOD] Strike added to ${userLogName}. Total: ${result.strikeCount}`);

                await chat.sendMessage(`⚠️ @${senderId.split('@')[0]} Uyarıldı!\nSebep: Yasaklı Kelime/Küfür\nUyarı Sayısı: ${result.strikeCount}/3`, {
                    mentions: [senderId]
                });

                if (result.strikeCount >= 3) {
                    await chat.removeParticipants([senderId]);
                    console.log(`[MOD] Banned ${userLogName} for reaching 3 strikes.`);
                    await chat.sendMessage(`🚫 @${senderId.split('@')[0]} 3 uyarı sınırına ulaştığı için gruptan atıldı.`, { mentions: [senderId] });
                }

            } catch (e) {
                console.error("[MOD] Failed to execute moderation action:", e);
                console.log("[MOD] TIP: Make sure the bot is an Admin!");
            }
            return true;
        }

        return false;
    }

    static isSpam(userId) {
        const now = Date.now();
        if (!spamTracker[userId]) {
            spamTracker[userId] = { count: 1, start: now };
            return false;
        }

        const data = spamTracker[userId];
        if (now - data.start > 10000) { // 10 seconds window
            data.count = 1;
            data.start = now;
            return false;
        }

        data.count++;
        if (data.count > 6) return true; // threshold > 5

        return false;
    }

    static checkContent(text) {
        // Normalize text: lowercase
        const lower = text.toLowerCase();

        const allBadWords = [
            ...config.BANNED_WORDS,
            ...config.ADULT_WORDS,
            ...config.POLITICAL_WORDS
        ];

        for (const word of allBadWords) {
            const badWord = word.toLowerCase();

            // Check 1: Exact match with word boundaries (avoids "götür" triggering "göt")
            // \b matches start/end of alphanumeric word. 
            // We escape special chars just in case.
            const escapedWord = badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');

            if (regex.test(lower)) {
                return badWord;
            }

            // Note: For things like "s.i.k" which aren't normal words, the regex might need to be looser,
            // but for "göt" vs "götür", \b is perfect.
        }
        return null;
    }
}

module.exports = ModerationService;
