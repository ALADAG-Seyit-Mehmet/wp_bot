const config = require('../../config');
// Note: In a real "Pro" app you'd update the DB. 
// For now, since 'config' is in-memory for this session (unless we reload), we can push to array.
// Ideally, ModerationService should read from DB.
// We'll update the in-memory config for now.

module.exports = {
    name: 'kelimeekle',
    description: 'Yasaklı kelime ekler',
    adminOnly: true,
    async run(client, msg, args) {
        if (args.length === 0) return msg.reply('⚠️ Usage: !addword [word]');

        const word = args[0].toLowerCase();
        if (config.BANNED_WORDS.includes(word)) {
            return msg.reply('⚠️ Word is already banned.');
        }

        config.BANNED_WORDS.push(word);
        msg.reply(`✅ Added "${word}" to banned words.`);
    }
};
