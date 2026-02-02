const StrikeService = require('../services/StrikeService');

module.exports = {
    name: 'uyar',
    description: 'Kullanıcıyı uyarır',
    adminOnly: true,
    async run(client, msg, args) {
        if (!msg.hasQuotedMsg && args.length === 0) {
            return msg.reply('⚠️ Usage: @mention user or quote a message to warn options: [reason]');
        }

        let targetId;
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            targetId = quotedMsg.author || quotedMsg.from;
        } else if (msg.mentionedIds.length > 0) {
            targetId = msg.mentionedIds[0];
        } else {
            return msg.reply('⚠️ Please mention a user to warn.');
        }

        const reason = args.join(' ') || 'No reason provided';
        const chat = await msg.getChat();

        // Add Strike
        const result = await StrikeService.addStrike(targetId, chat.id._serialized, reason);

        msg.reply(`⚠️ **WARNING ISSUED**\nUser: @${targetId.split('@')[0]}\nReason: ${reason}\nStrikes: ${result.strikeCount}/3`, {
            mentions: [targetId]
        });

        // Check for Ban
        if (result.strikeCount >= 3) {
            await chat.sendMessage(`🚫 User @${targetId.split('@')[0]} has reached 3 strikes and will be removed.`, {
                mentions: [targetId]
            });

            try {
                await chat.removeParticipants([targetId]);
                // Optional: Clear strikes after ban
                // await StrikeService.clearStrikes(targetId, chat.id._serialized);
            } catch (err) {
                msg.reply('❌ Failed to remove user. Make sure I am an Admin.');
            }
        }
    }
};
