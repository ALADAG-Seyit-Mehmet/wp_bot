const config = require('../../config');

module.exports = {
    name: 'kelimesil',
    description: 'Yasaklı kelime siler',
    adminOnly: true,
    async run(client, msg, args) {
        if (args.length === 0) return msg.reply('⚠️ Usage: !delword [word]');

        const word = args[0].toLowerCase();
        const index = config.BANNED_WORDS.indexOf(word);

        if (index === -1) {
            return msg.reply('⚠️ Word not found in list.');
        }

        config.BANNED_WORDS.splice(index, 1);
        msg.reply(`✅ Removed "${word}" from banned words.`);
    }
};
