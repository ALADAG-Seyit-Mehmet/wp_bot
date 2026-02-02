module.exports = {
    name: 'at',
    description: 'Kullanıcıyı gruptan atar',
    adminOnly: true,
    async run(client, msg, args) {
        if (!msg.hasQuotedMsg && args.length === 0) {
            return msg.reply('⚠️ Please mention a user or quote a message to kick.');
        }

        let targetId;
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            targetId = quotedMsg.author || quotedMsg.from;
        } else if (msg.mentionedIds.length > 0) {
            targetId = msg.mentionedIds[0];
        }

        const chat = await msg.getChat();
        try {
            await chat.removeParticipants([targetId]);
            msg.reply('👋 User kicked.');
        } catch (err) {
            msg.reply('❌ Failed to kick user. Ensure I am an admin.');
        }
    }
};
