require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateContent() {
  const translations = JSON.parse(fs.readFileSync('messages/fr.json', 'utf8'));
  
  const contentToInsert = [];
  
  // Fonction récursive pour extraire tout le contenu
  function extractContent(obj, page, section = '', parentKey = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      
      if (typeof value === 'string') {
        contentToInsert.push({
          page,
          section: section || 'general',
          key: fullKey,
          locale: 'fr',
          value
        });
      } else if (typeof value === 'object') {
        extractContent(value, page, key, fullKey);
      }
    });
  }
  
  // Extraire tout le contenu
  Object.entries(translations).forEach(([page, content]) => {
    if (typeof content === 'object') {
      extractContent(content, page);
    }
  });
  
  // Insérer dans la DB
  console.log(`Migration de ${contentToInsert.length} entrées...`);
  
  const { error } = await supabase
    .from('site_content')
    .upsert(contentToInsert, { onConflict: 'page,section,key,locale' });
    
  if (error) {
    console.error('Erreur:', error);
  } else {
    console.log('✅ Migration complète !');
  }
}

migrateContent();
