module.exports = {
    // Exact names of the groups the bot should manage
    TARGET_GROUPS: [
        "Steam Türkiye Topluluğu🇹🇷",
        "Epic Games Sohbet Grubu",
        "Türk Oyuncular Derneği🇹🇷"
    ],

    // Auto-Approve Settings (Gatekeeper)
    // 90 (TR), 994 (AZ), 993 (TM), 998 (UZ), 996 (KG), 76/77 (KZ)
    ALLOWED_PREFIXES: ["90", "994", "993", "998", "996", "76", "77"],

    // Moderation Lists - HEAVY PROFANITY ONLY (Mild insults removed)
    BANNED_WORDS: [
        // --- High Priority (Shorts) ---
        "sie", "s.i.e", "si.e", "siktirgit", "siktir git",

        // --- Variatons of OÇ ---
        "oç", "oc", "o.ç", "o.c", "0ç", "0c", "o ç", "o c",
        "orospu", "orospu cocugu", "orospu çocuğu", "o.çocuğu", "o.cocugu",
        "orosbu", "0rosbu", "or0sbu", "or0spu", "oro5pu", "0rospu", "orospw",
        "evladı", "veledi zina",

        // --- S-Word Variations ---
        "sik", "s1k", "s!k", "skim", "sık", "s1k",
        "siktir", "siktır", "s1ktir", "s!ktir", "siktr", "s.k",
        "sikerim", "s1kerim", "s.ikerim", "s.kerim", "sikem",
        "sokarım", "sakarım", "sokayım", "sokam", "s0karım", "sokuk", "yarak",

        // --- A-Word Elements ---
        "amcık", "amcik", "amc!k", "amc1k",
        "amın", "amina", "amına", "am1na", "am!na",
        "anani", "ananı", "anan1", "anana", "bacını", "bacini",
        "yarrak", "y4rrak", "y4rak", "yarram", "yarrram",

        // --- Insults (Person) ---
        "piç", "pic", "p!ç", "p1ç", "p.i.c", "piç kurusu",
        "göt", "got", "g0t", "g.o.t", "g.ö.t", "götveren", "götoş",
        "gavat", "kavat", "g4vat",
        "ibne", "1bne", "ibn3", "puşt",
        "kahpe", "k4hpe",
        "kaltak", "k4ltak",
        "yavşak", "yavsak", "y4vşak",
        "dalyarak",
        "pezevenk", "pezeveng",
        "beyinsiz", "gerizekalı", "aptal", "salak", "mal", "keko", "yıkık", "ezik", // Community choice: sometimes valid insults

        // --- Religious / Values Insults (Extreme) ---
        "allahını", "allahini", "kitabını", "kitabini", "dinini", "imanını", // Usually preceded by curse
        "atatürk'e", "ataturke", "ataturk'e", // Disrespect checks usually complex but banning specific insult phrases helps

        // --- English Common ---
        "fuck", "shit", "bitch", "asshole", "dick", "cunt", "pussy", "bastard", "whore", "slut"
    ],

    ADULT_WORDS: [
        "+18", "nsfw", "porn", "porno", "p0rno", "p0rn",
        "sex", "seks", "s3x", "s.e.x",
        "sikiş", "sikis", "s1k1s",
        "ifşa", "ifsa", "1fşa",
        "nude", "nudes", "nud",
        "çıplak", "ciplak", "c1plak",
        "erotik", "er0tik",
        "brazzer", "brazzers",
        "xnxx", "xvideos", "pornhub", "hub",
        "kucak",
        "azgın", "azgin",
        "swinger", "escort", "eskort"
    ],

    POLITICAL_WORDS: [
        // --- Government & General ---
        "siyaset", "s1yaset",
        "hükümet", "hukumet",
        "devlet", "bakan", "başkan",
        "seçim", "secim", "tek adam",
        "sandık", "darbe", "eylem", "miting",
        "propaganda",

        // --- Parties ---
        "akp", "ak parti", "a.k.p",
        "chp", "c.h.p", "cehape",
        "mhp", "m.h.p",
        "hdp", "h.d.p", "dem parti", "dem",
        "iyi parti", "iyip",
        "deva", "gelecek", "zafer partisi", "memleket partisi",
        "hüda par", "hudapar",

        // --- Organizations ---
        "fetö", "feto", "fg",
        "pkk", "p.k.k", "apo",
        "ypg", "pyd",
        "dhkp-c", "dhkpc",
        "işid", "isid", "deaş", "daeş",
        "terör", "teror", "terörist",

        // --- Politicians ---
        "erdoğan", "erdogan", "tayyip", "rte",
        "kılıçdaroğlu", "kilicdaroglu", "kk", "bay kemal",
        "imamoğlu", "imamoglu", "ekrem",
        "mansur yavaş", "mansur",
        "bahçeli", "devlet bahçeli",
        "akşener", "meral",
        "özdağ", "ümit özdağ",
        "demirtaş", "selo"
    ],

    // Spam Settings
    SPAM_THRESHOLD: 5,
    SPAM_TIME_WINDOW: 10000,

    // Mute Settings
    MUTE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 Hours
    MAX_MUTE_COUNT: 3, // Max 3 mutes (chances) before permanent kick

    // Messages
    WELCOME_MESSAGE: "Hoşgeldin! Kurallara uymayı unutma. Ağır küfür, +18 ve siyaset YASAKTIR.",
    WARNING_MESSAGE: "⚠️ Bu grupta ağır küfür, siyaset ve +18 içerik yasaktır.",
    BAN_MESSAGE: "🚫 Kuralları ihlal ettiğiniz için gruptan çıkarıldınız."
};
