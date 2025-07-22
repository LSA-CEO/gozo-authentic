import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ← Utiliser SERVICE_ROLE_KEY comme dans ton .env.local
);

async function createAdmin() {
  const email = 'admin@gozoauthentic.com';
  const password = 'ChangeMeImmediately123!';
  const name = 'Super Admin';
  
  // Hash du mot de passe
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Générer secret 2FA
  const secret = speakeasy.generateSecret({
    name: 'GoZo Authentic Admin',
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
    console.error('Erreur:', error);
    return;
  }
  
  console.log('Admin créé avec succès!');
  console.log('Email:', email);
  console.log('Mot de passe temporaire:', password);
  console.log('Secret 2FA:', secret.base32);
  
  // Générer QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
  console.log('\nScannez ce QR code avec Google Authenticator:');
  console.log(qrCodeUrl);
}

createAdmin();
