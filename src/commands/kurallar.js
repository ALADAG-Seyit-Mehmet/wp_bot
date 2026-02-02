module.exports = {
    name: 'kurallar',
    description: 'Grup kurallarını gösterir',
    adminOnly: false,
    async run(client, msg, args) {
        const chat = await msg.getChat();

        if (!chat.isGroup) {
            return msg.reply('❌ Bu komut sadece gruplarda kullanılabilir.');
        }

        const rules = chat.description || '⚠️ Bu grup için henüz kural veya açıklama girilmemiş.';

        msg.reply(`📜 *Grup Kuralları ve Açıklaması:*\n━━━━━━━━━━━━━━━━\n${rules}`);
    }
};
