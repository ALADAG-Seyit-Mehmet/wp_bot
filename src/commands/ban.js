module.exports = {
    name: 'yasakla',
    description: 'Kullanıcıyı yasaklar',
    adminOnly: true,
    async run(client, msg, args) {
        // WhatsApp API "ban" usually just means remove, 
        // as true "blocking" from a group isn't fully supported via API the same way Discord does.
        // We will treat it as a kick + log.

        let targetId;
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            targetId = quotedMsg.author || quotedMsg.from;
        } else if (msg.mentionedIds.length > 0) {
            targetId = msg.mentionedIds[0];
        } else {
            return msg.reply('⚠️ Please mention a user to ban.');
        }

        const chat = await msg.getChat();
        try {
            await chat.removeParticipants([targetId]);
            msg.reply('⛔ User banned (removed) from the group.');
        } catch (err) {
            msg.reply('❌ Failed to ban user.');
        }
    }
};
