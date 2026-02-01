const fs = require('fs');
const path = require('path');
const config = require('./config');

// In-memory store for spam tracking: { userId: { count, lastMessageTime } }
const spamTracker = {};

const LOG_FILE = path.join(__dirname, 'chat_logs.txt');

/**
 * Appends message details to a log file.
 * @param {string} user - The sender's ID or name
 * @param {string} content - The message content
 * @param {string} groupName - The group name
 */
function logMessage(user, content, groupName) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${groupName}] ${user}: ${content}\n`;

    fs.appendFile(LOG_FILE, logEntry, (err) => {
        if (err) console.error("Error writing to log file:", err);
    });
}

/**
 * Checks if a user is spamming.
 * @param {string} userId - The sender's ID
 * @returns {boolean} - True if user should be banned/kicked
 */
function isSpam(userId) {
    const now = Date.now();

    if (!spamTracker[userId]) {
        spamTracker[userId] = { count: 1, lastWindowStart: now };
        return false;
    }

    const userData = spamTracker[userId];

    // Reset window if time passed
    if (now - userData.lastWindowStart > config.SPAM_TIME_WINDOW) {
        userData.count = 1;
        userData.lastWindowStart = now;
        return false;
    }

    userData.count++;

    if (userData.count > config.SPAM_THRESHOLD) {
        // Reset so they don't get banned instantly again if they rejoin (optional logic)
        // userData.count = 0; 
        return true;
    }

    return false;
}

/**
 * Checks message content for banned words.
 * @param {string} content - The message text
 * @returns {string|null} - Returns the violation type ('profanity', 'adult', 'political') or null if clean.
 */
function checkContent(content) {
    const lowerContent = content.toLowerCase();

    // Helper to check list
    const containsAny = (list) => list.some(word => lowerContent.includes(word.toLowerCase()));

    if (containsAny(config.BANNED_WORDS)) return 'profanity';
    if (containsAny(config.ADULT_WORDS)) return 'adult';
    if (containsAny(config.POLITICAL_WORDS)) return 'political';

    return null;
}

module.exports = {
    logMessage,
    isSpam,
    checkContent
};
