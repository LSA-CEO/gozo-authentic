// Script à exécuter avec : node scripts/setup-admin.js

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin() {
  console.log('🔐 Création du premier administrateur...\n');
  
  const email = 'admin@gozoauthentic.com';
  const password = 'ChangeMeImmediately123!';
  const name = 'Super Admin';
  
  // Hash du mot de passe
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Générer secret 2FA
  const secret = speakeasy.generateSecret({
    name: `GoZo Authentic (${email})`,
    issuer: 'GoZo Authentic',
    length: 32
  });
  
  // Créer l'utilisateur
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      email,
      name,
      password_hash: passwordHash,
      role: 'super_admin',
      two_factor_secret: secret.base32,
      two_factor_enabled: true
    })
    .select()
    .single();
    
  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }
  
  console.log('✅ Admin créé avec succès!\n');
  console.log('📧 Email:', email);
  console.log('🔑 Mot de passe temporaire:', password);
  console.log('🔐 Secret 2FA:', secret.base32);
  console.log('\n⚠️  IMPORTANT: Changez le mot de passe immédiatement après la première connexion!');
  
  // Générer QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
  console.log('\n📱 QR Code pour Google Authenticator:');
  console.log('Ouvrez ce lien dans votre navigateur:', qrCodeUrl.substring(0, 100) + '...');
  
  // Sauvegarder le QR code
  const fs = require('fs');
  const qrCodeData = qrCodeUrl.split(',')[1];
  fs.writeFileSync('admin-2fa-qrcode.html', `
    <html>
      <body style="text-align: center; padding: 50px; font-family: Arial;">
        <h1>GoZo Authentic Admin 2FA</h1>
        <p>Scannez ce QR code avec Google Authenticator</p>
        <img src="${qrCodeUrl}" />
        <p style="margin-top: 30px;">
          <strong>Email:</strong> ${email}<br>
          <strong>Secret:</strong> ${secret.base32}
        </p>
      </body>
    </html>
  `);
  
  console.log('\n📄 QR Code sauvegardé dans: admin-2fa-qrcode.html');
  console.log('Ouvrez ce fichier dans votre navigateur pour scanner le QR code.\n');
}

createAdmin();
