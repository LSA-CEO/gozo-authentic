const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin() {
  const email = 'admin@test.com';
  const password = 'test123456';
  
  // Générer le hash
  const passwordHash = await bcrypt.hash(password, 12);
  console.log('Hash généré:', passwordHash);
  
  // Supprimer l'ancien si existe
  await supabase
    .from('admin_users')
    .delete()
    .eq('email', email);
  
  // Créer le nouveau
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      email,
      name: 'Admin Test',
      password_hash: passwordHash,
      role: 'super_admin',
      two_factor_enabled: false,
      is_active: true
    })
    .select()
    .single();
    
  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Admin créé !');
    console.log('Email:', email);
    console.log('Mot de passe:', password);
  }
}

createAdmin();
