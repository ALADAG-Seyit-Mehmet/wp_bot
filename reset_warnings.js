const { run } = require('./src/db/database');

async function resetWarnings() {
    console.log("⚠️  Herkesin uyarısı sıfırlanıyor...");
    try {
        await run("DELETE FROM warnings");
        console.log("✅ İşlem Başarılı! Tüm uyarılar silindi.");
        // İsteğe bağlı: Banları da sıfırlamak isterseniz aşağıdakileri açabilirsiniz:
        // await run("DELETE FROM temp_bans");
        // await run("DELETE FROM muted_users");
    } catch (error) {
        console.error("❌ Hata oluştu:", error);
    }
}

// execute
resetWarnings();
