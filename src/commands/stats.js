module.exports = {
    name: 'istatistik',
    description: 'Grup istatistiklerini gösterir',
    adminOnly: false,
    async run(client, msg, args) {
        const chat = await msg.getChat();

        if (!chat.isGroup) {
            return msg.reply('❌ Bu komut sadece gruplarda kullanılabilir.');
        }

        const stats = `
📊 *Grup İstatistikleri*
━━━━━━━━━━━━━━━━
🏷️ *İsim*: ${chat.name}
👥 *Katılımcılar*: ${chat.participants.length}
📅 *Kuruluş*: ${new Date((chat.createdAt || chat.timestamp) * 1000).toLocaleDateString('tr-TR')}
📝 *Açıklama*: ${chat.description || 'Yok'}
        `;

        msg.reply(stats.trim());
    }
};
