const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const os = require('os');
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // Headless TRUE on Linux (Server), FALSE on Windows (Validation)
        headless: os.platform() !== 'win32',
        executablePath: os.platform() === 'win32' ? undefined : '/usr/bin/chromium-browser',
        protocolTimeout: 240000,
        timeout: 300000, // 5 minutes launch timeout
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            // '--single-process', // REMOVED: Causing ProtocolError timeouts
            '--disable-gpu',
            '--disable-extensions',
            '--disable-component-update',
            '--disable-default-apps',
            '--mute-audio',
            '--no-default-browser-check',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process', // Low memory mode
        ],
    },
    // Force a specific version to prevent "Context Destroyed" errors
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    authTimeoutMs: 300000, // 5 minutes
    loadingScreen: true
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

client.on('authenticated', () => {
    console.log('[DEBUG] Authenticated via WhatsApp Web!');
});

client.on('auth_failure', (msg) => {
    console.error('[ERROR] Authentication Failed:', msg);
});

client.on('loading_screen', (percent, message) => {
    console.log(`[DEBUG] Loading: ${percent}% - ${message}`);
});

client.on('ready', () => {
    console.log('Bot is Ready and Online!');
    console.log('------------------------------------------------');
    console.log(`Target Groups:`);
    config.TARGET_GROUPS.forEach(g => console.log(` - ${g}`));
    console.log('------------------------------------------------');
    // Set Discord-like Presence
    client.setStatus('online');
});

// --- Join Request Gatekeeper ---
client.on('group_membership_request', async (notification) => {
    // Only handle requests for the target groups
    const chat = await notification.getChat();
    // if (chat.name !== config.TARGET_GROUP_NAME) return; -> OLD
    if (!config.TARGET_GROUPS.includes(chat.name)) return;

    // console.log("Incoming join request from:", notification.author);


    // notification.author might be a LID (e.g. 123456@lid) which breaks country code checks.
    // We must fetch the Contact object to get the real phone number.
    let senderNumber;
    try {
        const contact = await notification.getContact();
        senderNumber = contact.number; // This is the real number (e.g., 905551234567)
    } catch (err) {
        console.error("Failed to get contact for join request, falling back to ID:", err);
        senderNumber = notification.author.replace('@c.us', '').replace('@lid', '');
    }

    // Check if starts with allowed prefix
    const isAllowed = config.ALLOWED_PREFIXES.some(prefix => senderNumber.startsWith(prefix));

    if (isAllowed) {
        try {
            await client.approveGroupMembershipRequests(notification.chatId, { requesterIds: [notification.author] });
            console.log(`✅ Approved join request: +${senderNumber} (Allowed Country)`);
        } catch (err) {
            console.error("Failed to approve:", err);
        }
    } else {
        try {
            await client.rejectGroupMembershipRequests(notification.chatId, { requesterIds: [notification.author] });
            console.log(`⛔ Rejected join request: +${senderNumber} (Foreign Country)`);
        } catch (err) {
            console.error("Failed to reject:", err);
        }
    }
});

// --- Welcome Message ---
client.on('group_join', async (notification) => {
    try {
        const chat = await notification.getChat();

        // Only welcome in target groups
        if (!config.TARGET_GROUPS.includes(chat.name)) return;

        // Don't welcome the bot itself
        if (notification.id.participant === client.info.wid._serialized) return;

        const contact = await client.getContactById(notification.id.participant);
        const welcomeMsg = `👋 Hoşgeldin @${contact.id.user}, *${chat.name}* grubumuza!\n\nLütfen kuralları okumak için *!kurallar* komutunu kullanmayı unutma. Keyifli sohbetler! 😊`;

        await chat.sendMessage(welcomeMsg, {
            mentions: [contact]
        });
        console.log(`[JOIN] Welcomed ${contact.number} to ${chat.name}`);
    } catch (err) {
        console.error("Failed to send welcome message:", err);
    }
});

client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        const contact = await msg.getContact();

        // DEBUG LOGGING
        console.log(`[DEBUG] From: ${chat.name} | User: +${contact.number} (${contact.pushname || 'No Name'}) | Body: ${msg.body}`);

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
                // RESTRICT TO TARGET GROUPS
                if (!config.TARGET_GROUPS.includes(chat.name)) {
                    // console.log(`[DEBUG] Ignoring command "!${commandName}" from non-target group: ${chat.name}`);
                    return;
                }

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
