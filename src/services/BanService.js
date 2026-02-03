const db = require('../db/database');
const config = require('../../config');

class BanService {
    /**
     * Temporarily bans a user (Kick + Auto-add later)
     */
    static async tempBan(chat, userId, durationMs) {
        // 1. Kick User
        try {
            await chat.removeParticipants([userId]);
        } catch (e) {
            console.error(`[BAN] Failed to kick ${userId}:`, e);
            return false; // Failed to kick, so don't record ban
        }

        // 2. Record in DB
        const unbanTime = Date.now() + durationMs;

        // Check existing record
        const existing = await db.get(
            `SELECT banCount FROM temp_bans WHERE userId = ? AND groupId = ?`,
            [userId, chat.id._serialized]
        );

        let newCount = 1;
        if (existing) {
            newCount = existing.banCount + 1;
            await db.run(
                `UPDATE temp_bans SET unbanTime = ?, banCount = ? WHERE userId = ? AND groupId = ?`,
                [unbanTime, newCount, userId, chat.id._serialized]
            );
        } else {
            await db.run(
                `INSERT INTO temp_bans (userId, groupId, unbanTime, banCount) VALUES (?, ?, ?, ?)`,
                [userId, chat.id._serialized, unbanTime, newCount]
            );
        }

        return { banCount: newCount, unbanTime };
    }

    /**
     * Checks for expired bans and tries to add users back.
     * Run this periodically (e.g. every minute).
     */
    static async checkExpiredBans(client) {
        const now = Date.now();
        const expiredBans = await db.all(
            `SELECT * FROM temp_bans WHERE unbanTime < ?`,
            [now]
        );

        if (!expiredBans || expiredBans.length === 0) return;

        console.log(`[BAN] Found ${expiredBans.length} expired bans. Processing...`);

        for (const ban of expiredBans) {
            try {
                // Get Chat Object
                const chat = await client.getChatById(ban.groupId);

                if (!chat) {
                    console.error(`[BAN] Chat not found: ${ban.groupId}`);
                    continue;
                }

                // Try to Add
                console.log(`[BAN] Attempting to add ${ban.userId} back to ${chat.name}...`);
                try {
                    await chat.addParticipants([ban.userId]);
                    await chat.sendMessage(`👋 @${ban.userId.split('@')[0]} cezası bittiği için gruba geri alındı.`, {
                        mentions: [ban.userId]
                    });
                    console.log(`[BAN] Successfully re-added ${ban.userId}`);

                    // Remove record
                    await db.run(`DELETE FROM temp_bans WHERE userId = ? AND groupId = ?`, [ban.userId, ban.groupId]);

                } catch (addError) {
                    console.error(`[BAN] Failed to add participant (Privacy?): ${addError.message}`);

                    // Fallback: Send Invite Link
                    try {
                        const inviteCode = await chat.getInviteCode();
                        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
                        const contact = await client.getContactById(ban.userId);
                        const chatPrivate = await contact.getChat();

                        await chatPrivate.sendMessage(`⏳ Cezasız süreniz doldu! Ancak gizlilik ayarlarınız nedeniyle sizi otomatik ekleyemedim.\n\nLütfen bu linkten gruba geri dönün: ${inviteLink}`);
                        console.log(`[BAN] Sent invite link to ${ban.userId}`);

                        // Remove record so we don't spam invite links
                        await db.run(`DELETE FROM temp_bans WHERE userId = ? AND groupId = ?`, [ban.userId, ban.groupId]);

                    } catch (dmError) {
                        console.error(`[BAN] Failed to send DM invite: ${dmError.message}`);
                    }
                }

            } catch (err) {
                console.error(`[BAN] Error processing expired ban for ${ban.userId}:`, err);
            }
        }
    }

    /**
     * Gets ban count.
     */
    static async getBanCount(userId, groupId) {
        const row = await db.get(
            `SELECT banCount FROM temp_bans WHERE userId = ? AND groupId = ?`,
            [userId, groupId]
        );
        return row ? row.banCount : 0;
    }
}

module.exports = BanService;
