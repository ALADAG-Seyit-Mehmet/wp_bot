const db = require('../db/database');
const config = require('../../config');

class StrikeService {
    /**
     * Adds a strike (warning) to a user.
     * @param {string} userId - ID of the user
     * @param {string} groupId - ID of the group
     * @param {string} reason - Reason for warning
     * @returns {Promise<object>} Result containing run status and new strike count
     */
    static async addStrike(userId, groupId, reason) {
        // 1. Add warning record
        await db.run(
            `INSERT INTO warnings (userId, groupId, reason) VALUES (?, ?, ?)`,
            [userId, groupId, reason]
        );

        // 2. Count total strikes
        const result = await db.get(
            `SELECT COUNT(*) as count FROM warnings WHERE userId = ? AND groupId = ?`,
            [userId, groupId]
        );

        return {
            success: true,
            strikeCount: result.count
        };
    }

    /**
     * Gets strike count for a user.
     */
    static async getStrikes(userId, groupId) {
        const result = await db.get(
            `SELECT COUNT(*) as count FROM warnings WHERE userId = ? AND groupId = ?`,
            [userId, groupId]
        );
        return result.count;
    }

    /**
     * Clears all strikes for a user.
     */
    static async clearStrikes(userId, groupId) {
        await db.run(
            `DELETE FROM warnings WHERE userId = ? AND groupId = ?`,
            [userId, groupId]
        );
        return true;
    }
}

module.exports = StrikeService;
