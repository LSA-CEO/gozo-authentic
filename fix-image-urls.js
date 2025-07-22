require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixImageUrls() {
  console.log('🔧 Fixing image URLs for all languages...\n');
  
  // L'URL correcte depuis FR
  const correctUrl = 'https://hthlsyiemapmopqmajoe.supabase.co/storage/v1/object/public/gallery/1753066354401-x7rvxetbheo.jpg';
  
  // Mettre à jour toutes les langues sauf FR
  const locales = ['en', 'de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of locales) {
    const { error } = await supabaseAdmin
      .from('site_content')
      .update({ value: correctUrl })
      .eq('page', 'OurStory')
      .eq('section', 'general')
      .eq('key', 'image_url')
      .eq('locale', locale);
      
    if (error) {
      console.error(`❌ Error updating ${locale}:`, error);
    } else {
      console.log(`✅ Fixed ${locale}`);
    }
  }
  
  console.log('\n✨ Image URLs fixed!');
  
  // Note pour le futur
  console.log('\n📝 NOTE: Les URLs ne doivent PAS être traduites dans le système de traduction!');
}

fixImageUrls().catch(console.error);
