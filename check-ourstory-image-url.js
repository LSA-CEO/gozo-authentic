require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkImageUrl() {
  const { data } = await supabaseAdmin
    .from('site_content')
    .select('locale, value')
    .eq('page', 'OurStory')
    .eq('section', 'general')
    .eq('key', 'image_url')
    .order('locale');
    
  console.log('OurStory.image_url actuelles:\n');
  data?.forEach(item => {
    const isValidUrl = item.value.startsWith('http') || item.value.startsWith('/');
    console.log(`${item.locale}: ${isValidUrl ? '✅' : '❌'} ${item.value.substring(0, 60)}...`);
  });
}

checkImageUrl();
