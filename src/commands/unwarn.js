const StrikeService = require('../services/StrikeService');

module.exports = {
    name: 'uyarısil',
    description: 'Uyarıyı siler',
    adminOnly: true,
    async run(client, msg, args) {
        if (!msg.hasQuotedMsg && args.length === 0) {
            return msg.reply('⚠️ Please mention a user to unwarn.');
        }

        let targetId;
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            targetId = quotedMsg.author || quotedMsg.from;
        } else if (msg.mentionedIds.length > 0) {
            targetId = msg.mentionedIds[0];
        }

        const chat = await msg.getChat();
        await StrikeService.clearStrikes(targetId, chat.id._serialized);

        msg.reply(`✅ Warnings cleared for @${targetId.split('@')[0]}`, { mentions: [targetId] });
    }
};
