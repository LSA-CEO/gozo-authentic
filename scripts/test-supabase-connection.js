require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log('URL Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service Key existe ?', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Test 1: Lister tous les utilisateurs
  const { data: users, error: usersError } = await supabase
    .from('admin_users')
    .select('email, name, is_active');
    
  console.log('\n=== Tous les utilisateurs ===');
  console.log('Erreur ?', usersError);
  console.log('Utilisateurs:', users);
  
  // Test 2: Chercher admin@test.com spécifiquement
  const { data: user, error: userError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', 'admin@test.com')
    .eq('is_active', true)
    .single();
    
  console.log('\n=== Recherche admin@test.com ===');
  console.log('Erreur ?', userError);
  console.log('Utilisateur trouvé ?', !!user);
  if (user) {
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Hash existe ?', !!user.password_hash);
  }
}

test();
