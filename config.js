module.exports = {
    // Exact names of the groups the bot should manage
    TARGET_GROUPS: [
        "Steam Türkiye Topluluğu🇹🇷",
        "Epic Games Sohbet Grubu",
        "Türk Oyuncular Derneği🇹🇷"
    ],

    // Allowed prefixes for joining
    ALLOWED_PREFIXES: ["90", "994", "993", "998", "996", "76", "77"],

    // Feature Flags
    ENABLE_AI_MODERATION: false, // Set to true to enable heavy image analysis (high CPU/RAM usage)

    // Moderation Lists - HEAVY PROFANITY ONLY (Mild insults removed)
    // Moderation Lists - VALUES BASED (Milli, Dini, Ailevi)
    // 1. Family Values (Ailevi) - Targeting lineage/mothers
    FAMILY_INSULTS: [
        "ananı", "anani", "anan1", "anana",
        "bacını", "bacini",
        "karını", "avradını",
        "sülaleni",
        "oç", "oc", "o.ç", "o.c", "0ç", "0c", "o ç", "o c",
        "orospu çocuğu", "orospu cocugu", "o.çocuğu", "o.cocugu",
        "neslini", "zürriyetini",
        "piç", // Often aimed at lineage, kept for safety
        "yavşak" // Often aimed at character/lineage
    ],

    // 2. National Values (Milli) - Terror, Treason, Hate against State
    NATIONAL_INSULTS: [
        "pkk", "p.k.k", "apo", "ap0",
        "fetö", "feto",
        "ypg", "pyd",
        "dhkp-c", "dhkpc",
        "işid", "isid", "deaş", "daeş",
        "terör", "teror", "terörist",
        "bölücü"
    ],

    // 2.1 Political Parties (Siyaset Yasağı request)
    POLITICAL_PARTIES: [
        "akp", "ak parti", "a.k.p",
        "chp", "c.h.p", "cehape",
        "mhp", "m.h.p",
        "hdp", "h.d.p", "dem parti", "dem",
        "iyi parti", "iyip",
        "deva", "gelecek", "zafer partisi", "memleket partisi",
        "hüda par", "hudapar",
        "yeniden refah"
    ],

    // 3. Religious Values (Dini) - Explicit insults to sacred values
    RELIGIOUS_INSULTS: [
        "allahını", "allahini",
        "kitabını", "kitabini",
        "dinini", "imanını",
        "peygamberini"
        // Generic "Allah" is allowed (e.g., "Allah razı olsun"). only possessive insult forms are banned.
    ],

    // 4. Adult/Illegal Content (Spam protection) 
    // Kept to prevent ban from WhatsApp (Account safety)
    ADULT_CONTENT: [
        "+18", "cp", "child porn",
        "porno", "p0rno",
        "escort", "eskort",
        "sikiş izle", "sex izle" // Specific phrases to avoid banning "sikiş" related chat
    ],

    // Spam Settings
    SPAM_THRESHOLD: 6, // > 6 messages
    SPAM_TIME_WINDOW: 5000, // 5 seconds

    // Mute Settings
    MUTE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 Hours
    MAX_MUTE_COUNT: 3, // Max 3 mutes (chances) before permanent kick

    // Messages
    WELCOME_MESSAGE: "Hoşgeldin! Kurallara uymayı unutma. Ağır küfür, +18 ve siyaset YASAKTIR.",
    WARNING_MESSAGE: "⚠️ Bu grupta ağır küfür, siyaset ve +18 içerik yasaktır.",
    BAN_MESSAGE: "🚫 Kuralları ihlal ettiğiniz için gruptan çıkarıldınız."
};
