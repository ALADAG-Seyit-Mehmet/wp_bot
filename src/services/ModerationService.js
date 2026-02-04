const config = require('../../config');
const StrikeService = require('./StrikeService');

// In-memory spam tracker (DB is too slow for high-freq spam checks usually, hybrid is best)
const spamTracker = {};

const BanService = require('./BanService');

class ModerationService {
    static isBotAdmin(chat, client) {
        const botId = client.info.wid._serialized;
        const participant = chat.participants.find(p => p.id._serialized === botId);
        return participant && (participant.isAdmin || participant.isSuperAdmin);
    }

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
        // Pass body and type to tracker
        const spamType = this.isSpam(senderId, msg.body, msg.type);
        if (spamType) {
            // Instant Kick/Ban for spam
            if (!this.isBotAdmin(chat, client)) {
                console.warn(`[MOD] Cannot kick spammer ${userLogName}: Bot is not Admin.`);
                await chat.sendMessage("⚠️ Spam algılandı ancak bot Admin olmadığı için müdahale edemiyor.");
                return true;
            }

            try {
                await chat.removeParticipants([senderId]);
                const reason = spamType === 'media_spam' ? "ard arda medya gönderdiği" : "aynı mesajı tekrarladığı";
                await chat.sendMessage(`⛔ @${senderId.split('@')[0]} spam yaptığı için (${reason}) atıldı.`, { mentions: [senderId] });
            } catch (e) {
                console.error("Failed to kick spammer", e);
            }
            return true; // Stop processing
        }

        // 2. Visual Moderation (AI)
        if (msg.hasMedia && config.ENABLE_AI_MODERATION) {
            try {
                const media = await msg.downloadMedia();
                if (media && (media.mimetype.startsWith('image/') || media.mimetype.startsWith('sticker'))) {
                    const ImageAnalysisService = require('./ImageAnalysisService');
                    const nsfwReason = await ImageAnalysisService.isNSFW(Buffer.from(media.data, 'base64'));

                    if (nsfwReason) {
                        await msg.delete(true);

                        // Instant Ban for Porn
                        if (!this.isBotAdmin(chat, client)) {
                            await chat.sendMessage(`⚠️ +18 içerik silindi ancak bot Admin olmadığı için kullanıcı atılamadı.`);
                        } else {
                            await chat.removeParticipants([senderId]);
                            await chat.sendMessage(`⛔ @${senderId.split('@')[0]} +18 içerik attığı için banlandı (${nsfwReason}).`, { mentions: [senderId] });
                        }
                        return true;
                    }
                }
            } catch (err) {
                console.error("Media analysis failed:", err);
            }
        }

        // 3. Content Filter
        const violation = this.checkContent(msg.body);
        if (violation) {
            console.log(`[MOD] Detected violation: "${violation}" from ${userLogName}`);

            try {
                // Delete
                // Check if admin only if explicit delete fails? Usually delete works if participant, but kick needs admin.
                try { await msg.delete(true); }
                catch (e) { console.log("[MOD] Could not delete msg - likely not Admin"); }

                console.log(`[MOD] Message deleted from ${userLogName}`);

                // Warn (Strike System)
                const result = await StrikeService.addStrike(senderId, chat.id._serialized, `Used banned word: ${violation}`);
                console.log(`[MOD] Strike added to ${userLogName}. Total: ${result.strikeCount}`);

                // Check Ban Threshold
                if (result.strikeCount >= 3) {
                    // Check how many ban chances they have used
                    const banCount = await BanService.getBanCount(senderId, chat.id._serialized);

                    if (banCount < config.MAX_MUTE_COUNT) {
                        // Apply Temp Ban (24h)
                        // Temp ban logic (remove -> wait -> add) ALSO needs admin to remove.
                        if (!this.isBotAdmin(chat, client)) {
                            await chat.sendMessage(`⚠️ @${senderId.split('@')[0]} 3 uyarı sınırına ulaştı ancak bot Admin olmadığı için uzaklaştıramıyor.`);
                            return true;
                        }

                        await BanService.tempBan(chat, senderId, config.MUTE_DURATION_MS);
                        await StrikeService.clearStrikes(senderId, chat.id._serialized); // Reset strikes

                        // Note: User is kicked, so we can't really mention them effectively inside the group.
                        await chat.sendMessage(`🚫 @${senderId.split('@')[0]} 3 uyarı sınırına ulaştı.\n24 saatliğine gruptan uzaklaştırıldı. Süre bitince otomatik eklenecek.\n(Kalan Hak: ${config.MAX_MUTE_COUNT - banCount - 1})`, {
                            mentions: [senderId]
                        });
                        console.log(`[MOD] Temp banned ${userLogName} for 24h.`);
                    } else {
                        // All chances used -> PERMA KICK
                        if (!this.isBotAdmin(chat, client)) {
                            await chat.sendMessage(`⚠️ @${senderId.split('@')[0]} kalıcı banlanmalı ancak bot Admin değil.`);
                            return true;
                        }

                        await chat.removeParticipants([senderId]);
                        console.log(`[MOD] Perma banned ${userLogName} for exhausting all chances.`);
                        await chat.sendMessage(`⛔ @${senderId.split('@')[0]} 3 kez uzaklaştırıldığı halde devam ettiği için kalıcı olarak atıldı.`, { mentions: [senderId] });
                    }
                } else {
                    // Just warn
                    await chat.sendMessage(`⚠️ @${senderId.split('@')[0]} Uyarıldı!\nSebep: Yasaklı Kelime (${violation})\nUyarı Sayısı: ${result.strikeCount}/3`, {
                        mentions: [senderId]
                    });
                }

            } catch (e) {
                console.error("[MOD] Failed to execute moderation action:", e);
                console.log("[MOD] TIP: Make sure the bot is an Admin!");
            }
            return true;
        }

        return false;
    }

    static isSpam(userId, messageBody, messageType) {
        const now = Date.now();
        if (!spamTracker[userId]) {
            spamTracker[userId] = [];
        }

        const history = spamTracker[userId];

        // 1. Add current message
        history.push({
            time: now,
            body: messageBody || '',
            type: messageType // 'image', 'video', 'chat', etc.
        });

        // 2. Filter out old messages (keep only within window)
        // Optimization: We could just shift(), but filter is safer for edge cases
        const validHistory = history.filter(msg => (now - msg.time) < config.SPAM_TIME_WINDOW);
        spamTracker[userId] = validHistory;

        // 3. Analyze for Spam
        const count = validHistory.length;

        // A. Media Spam Check (>6 media items in window)
        // image, video, sticker, audio, voice...
        const mediaCount = validHistory.filter(msg =>
            msg.type === 'image' || msg.type === 'video' || msg.type === 'sticker' || msg.type === 'audio' || msg.type === 'ptt'
        ).length;

        if (mediaCount > config.SPAM_THRESHOLD) return 'media_spam';

        // B. Repeated Text Spam Check (>6 identical messages in window)
        // Group by body
        if (messageBody && messageType === 'chat') {
            const sameContentCount = validHistory.filter(msg => msg.body === messageBody).length;
            if (sameContentCount > config.SPAM_THRESHOLD) return 'text_spam';
        }

        return false;
    }

    static checkContent(text) {
        // Normalize text: lowercase
        const lower = text.toLowerCase();

        const allBadWords = [
            ...(config.FAMILY_INSULTS || []),
            ...(config.NATIONAL_INSULTS || []),
            ...(config.RELIGIOUS_INSULTS || []),
            ...(config.POLITICAL_PARTIES || []),
            ...(config.ADULT_CONTENT || [])
        ];

        for (const word of allBadWords) {
            const badWord = word.toLowerCase();

            // Check 1: Exact match with custom word boundaries for Turkish support
            // We use lookbehind and lookahead to ensure the word is NOT preceded or followed by a letter (including Turkish chars)
            // (?<![a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]) matches a position where the previous char is NOT a letter
            // (?![a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]) matches a position where the next char is NOT a letter

            const escapedWord = badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Note: JS doesn't support lookbehind broadly in older environments, but Node 10+ does. 
            // If environment is very old, we might need a workaround, but standard Node is fine.
            const regex = new RegExp(`(?<![a-zA-Z0-9çğıöşüÇĞIİÖŞÜ])${escapedWord}(?![a-zA-Z0-9çğıöşüÇĞIİÖŞÜ])`, 'i');

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
