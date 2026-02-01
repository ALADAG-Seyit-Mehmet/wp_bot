const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// Collection to hold commands
client.commands = new Map();

// --- 1. Load Commands ---
const commandsPath = path.join(__dirname, 'src', 'commands');
// Ensure directory exists
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
    console.log(`[CMD] Loaded command: ${command.name}`);
}

// --- 2. Load Events ---

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR RECEIVED. Scan with WhatsApp.');
});

client.on('ready', () => {
    console.log('Bot is Ready and Online!');
    // Set Discord-like Presence
    client.setStatus('online');
});

// --- Join Request Gatekeeper ---
client.on('group_membership_request', async (notification) => {
    // Only handle requests for the target group (if checked)
    const chat = await notification.getChat();
    if (chat.name !== config.TARGET_GROUP_NAME) return;

    // console.log("Incoming join request from:", notification.author);

    // notification.author format: 905551234567@c.us
    // We want to check the start of the number.
    const senderNumber = notification.author.replace('@c.us', '');

    // Check if starts with allowed prefix
    const isAllowed = config.ALLOWED_PREFIXES.some(prefix => senderNumber.startsWith(prefix));

    if (isAllowed) {
        try {
            await client.approveGroupMembershipRequests(notification.chatId, { requesterIds: [notification.author] });
            console.log(`✅ Approved join request: ${senderNumber} (Allowed Country)`);
        } catch (err) {
            console.error("Failed to approve:", err);
        }
    } else {
        try {
            await client.rejectGroupMembershipRequests(notification.chatId, { requesterIds: [notification.author] });
            console.log(`⛔ Rejected join request: ${senderNumber} (Foreign Country)`);
        } catch (err) {
            console.error("Failed to reject:", err);
        }
    }
});

client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();

        // 0. Moderation Check (Spam, Content)
        // Returns true if processed/deleted, so we stop there.
        const ModerationService = require('./src/services/ModerationService');
        const isModerated = await ModerationService.checkMessage(client, msg);
        if (isModerated) return;

        // 1. Logging (Basic)
        // console.log(`[MSG] ${msg.from}: ${msg.body}`);

        // 2. Command Handling
        if (msg.body.startsWith('!')) {
            const args = msg.body.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (client.commands.has(commandName)) {
                const command = client.commands.get(commandName);

                // Permission Check
                if (command.adminOnly) {
                    const authorId = msg.author || msg.from;

                    let isAdmin = false;
                    if (chat.isGroup) {
                        for (let participant of chat.participants) {
                            if (participant.id._serialized === authorId && (participant.isAdmin || participant.isSuperAdmin)) {
                                isAdmin = true;
                                break;
                            }
                        }
                    }

                    if (!isAdmin) {
                        return msg.reply('⛔ You do not have permission to use this command.');
                    }
                }

                try {
                    await command.run(client, msg, args);
                } catch (error) {
                    console.error(error);
                    msg.reply('❌ There was an error executing that command.');
                }
            }
        }

    } catch (err) {
        console.error('Error in message handler:', err);
    }
});

client.initialize();
