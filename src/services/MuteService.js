const db = require('../db/database');
const config = require('../../config');

class MuteService {
    /**
     * Checks if a user is currently muted.
     * @returns {Promise<boolean>}
     */
    static async isMuted(userId, groupId) {
        const row = await db.get(
            `SELECT muteEndTime FROM muted_users WHERE userId = ? AND groupId = ?`,
            [userId, groupId]
        );

        if (!row || !row.muteEndTime) return false;

        // Check if expired
        if (Date.now() > row.muteEndTime) {
            // Optional: reset muteEndTime but keep muteCount? 
            // For now just return false, let them speak.
            return false;
        }

        return true;
    }

    /**
     * Applies a mute to the user.
     * Increment muteCount and set muteEndTime.
     */
    static async applyMute(userId, groupId, durationMs) {
        // Check if record exists
        const existing = await db.get(
            `SELECT muteCount FROM muted_users WHERE userId = ? AND groupId = ?`,
            [userId, groupId]
        );

        const muteEndTime = Date.now() + durationMs;
        let newCount = 1;

        if (existing) {
            newCount = existing.muteCount + 1;
            await db.run(
                `UPDATE muted_users SET muteEndTime = ?, muteCount = ? WHERE userId = ? AND groupId = ?`,
                [muteEndTime, newCount, userId, groupId]
            );
        } else {
            await db.run(
                `INSERT INTO muted_users (userId, groupId, muteEndTime, muteCount) VALUES (?, ?, ?, ?)`,
                [userId, groupId, muteEndTime, newCount]
            );
        }

        return { muteCount: newCount, muteEndTime };
    }

    /**
     * Gets full status including count.
     */
    static async getMuteStatus(userId, groupId) {
        const row = await db.get(
            `SELECT muteEndTime, muteCount FROM muted_users WHERE userId = ? AND groupId = ?`,
            [userId, groupId]
        );

        if (!row) return { isMuted: false, muteCount: 0 };

        const isMuted = row.muteEndTime && Date.now() < row.muteEndTime;
        return { isMuted, muteCount: row.muteCount };
    }
}

module.exports = MuteService;
