module.exports = {
    name: 'stats',
    description: 'Shows group statistics',
    adminOnly: true,
    async run(client, msg, args) {
        const chat = await msg.getChat();

        if (!chat.isGroup) {
            return msg.reply('❌ This command can only be used in groups.');
        }

        const stats = `
📊 *Group Statistics*
━━━━━━━━━━━━━━━━
🏷️ *Name*: ${chat.name}
👥 *Participants*: ${chat.participants.length}
📅 *Created At*: ${new Date(chat.timestamp * 1000).toLocaleDateString()}
📝 *Description*: ${chat.description || 'None'}
        `;

        msg.reply(stats.trim());
    }
};
