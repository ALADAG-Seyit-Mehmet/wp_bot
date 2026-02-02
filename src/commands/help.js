module.exports = {
    name: 'yardım',
    description: 'Komutları gösterir',
    adminOnly: false,
    async run(client, msg, args) {
        let helpText = "*🤖 Bot Komutları*\n\n";

        client.commands.forEach((cmd) => {
            // Translate descriptions manually or keep generic
            let desc = cmd.description;
            if (cmd.name === 'yardim') desc = 'Komutları gösterir';
            if (cmd.name === 'kelimeekle') desc = 'Yasaklı kelime ekler';
            if (cmd.name === 'kelimesil') desc = 'Yasaklı kelime siler';
            if (cmd.name === 'yasakla') desc = 'Kullanıcıyı gruptan yasaklar (ban)';
            if (cmd.name === 'at') desc = 'Kullanıcıyı gruptan atar (kick)';
            if (cmd.name === 'uyar') desc = 'Kullanıcıyı uyarır';
            if (cmd.name === 'uyarisil') desc = 'Kullanıcının uyarısını siler';
            if (cmd.name === 'istatistik') desc = 'Grup istatistiklerini gösterir';

            helpText += `*!${cmd.name}*: ${desc}\n`;
        });

        helpText += "\n_Yönetim komutları sadece Yöneticiler içindir._";
        msg.reply(helpText);
    }
};
