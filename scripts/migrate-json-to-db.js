require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateJsonToDb() {
  const messagesDir = path.join(process.cwd(), 'messages');
  const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));
  
  console.log('Found language files:', files);
  
  for (const file of files) {
    const locale = file.replace('.json', '');
    const content = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'));
    
    console.log(`\nMigrating ${locale}...`);
    
    // Fonction récursive pour aplatir l'objet JSON
    function flattenObject(obj, prefix = '') {
      const result = [];
      
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          result.push(...flattenObject(value, newKey));
        } else {
          // Extraire page et section de la clé
          const parts = newKey.split('.');
          let page = 'global';
          let section = 'general';
          let finalKey = newKey;
          
          if (parts.length >= 2) {
            page = parts[0];
            if (parts.length >= 3) {
              section = parts[1];
              finalKey = parts.slice(2).join('.');
            } else {
              finalKey = parts[1];
            }
          }
          
          result.push({
            page,
            section,
            key: finalKey,
            locale,
            value: String(value)
          });
        }
      }
      
      return result;
    }
    
    const entries = flattenObject(content);
    
    // Insérer par batch
    const batchSize = 100;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('site_content')
        .upsert(batch, {
          onConflict: 'page,section,key,locale'
        });
        
      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        console.log(`Inserted ${batch.length} entries`);
      }
    }
    
    console.log(`Total ${locale}: ${entries.length} entries`);
  }
  
  console.log('\nMigration complete!');
}

migrateJsonToDb().catch(console.error);
