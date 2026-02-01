module.exports = {
    name: 'help',
    description: 'Shows available commands',
    adminOnly: false,
    async run(client, msg, args) {
        let helpText = "*🤖 Bot Commands*\n\n";

        client.commands.forEach((cmd) => {
            const cleanName = cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1);
            helpText += `*!${cmd.name}*: ${cmd.description}\n`;
        });

        helpText += "\n_Moderation commands require Admin privileges._";
        msg.reply(helpText);
    }
};
