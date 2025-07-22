const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fonction pour extraire les clés de traduction d'un fichier
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = [];
  
  // Extraire le namespace
  const namespaceMatch = content.match(/useTranslations\(['"]([^'"]+)['"]\)/);
  if (!namespaceMatch) return keys;
  
  const namespace = namespaceMatch[1];
  
  // Extraire toutes les utilisations de t()
  const tMatches = content.matchAll(/t\(['"]([^'"]+)['"]\)/g);
  for (const match of tMatches) {
    keys.push({
      namespace,
      key: match[1],
      file: filePath
    });
  }
  
  return keys;
}

// Scanner récursivement les dossiers
function scanDirectory(dir, excludeDirs = ['node_modules', '.next', 'admin']) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!excludeDirs.includes(file)) {
        results.push(...scanDirectory(filePath, excludeDirs));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Skip admin files
      if (!filePath.includes('/admin/')) {
        const keys = extractTranslationKeys(filePath);
        results.push(...keys);
      }
    }
  }
  
  return results;
}

async function findMissingTranslations() {
  console.log('🔍 Scanning for translation keys...\n');
  
  // Scanner tous les fichiers
  const foundKeys = scanDirectory('./components');
  const appKeys = scanDirectory('./app');
  const allKeys = [...foundKeys, ...appKeys];
  
  // Grouper par namespace
  const keysByNamespace = {};
  allKeys.forEach(item => {
    if (!keysByNamespace[item.namespace]) {
      keysByNamespace[item.namespace] = new Set();
    }
    keysByNamespace[item.namespace].add(item.key);
  });
  
  console.log('📋 Found translation keys by namespace:');
  Object.entries(keysByNamespace).forEach(([namespace, keys]) => {
    console.log(`\n${namespace}: ${Array.from(keys).join(', ')}`);
  });
  
  // Récupérer les traductions existantes de la DB
  console.log('\n\n🔍 Checking database...\n');
  
  const { data: dbTranslations } = await supabaseAdmin
    .from('site_content')
    .select('page, section, key')
    .eq('locale', 'fr');
  
  // Convertir en format namespace.key
  const existingKeys = new Set();
  dbTranslations?.forEach(item => {
    if (item.section === 'general') {
      existingKeys.add(`${item.page}.${item.key}`);
    } else {
      existingKeys.add(`${item.page}.${item.section}.${item.key}`);
    }
  });
  
  // Trouver les clés manquantes
  console.log('❌ MISSING TRANSLATIONS:\n');
  const missingByNamespace = {};
  
  Object.entries(keysByNamespace).forEach(([namespace, keys]) => {
    const missing = [];
    keys.forEach(key => {
      // Gérer les namespaces avec points (ex: HomePage.hero)
      const fullKey = `${namespace}.${key}`;
      const simpleKey = namespace.includes('.') ? fullKey : `${namespace}.general.${key}`;
      
      if (!existingKeys.has(fullKey) && !existingKeys.has(simpleKey)) {
        missing.push(key);
      }
    });
    
    if (missing.length > 0) {
      missingByNamespace[namespace] = missing;
      console.log(`${namespace}:`);
      console.log(`  Missing: ${missing.join(', ')}`);
      console.log('');
    }
  });
  
  // Résumé
  const totalMissing = Object.values(missingByNamespace).flat().length;
  console.log(`\n📊 SUMMARY: ${totalMissing} missing translations across ${Object.keys(missingByNamespace).length} namespaces`);
  
  // Sauvegarder dans un fichier pour référence
  fs.writeFileSync('missing-translations.json', JSON.stringify(missingByNamespace, null, 2));
  console.log('\n💾 Full report saved to missing-translations.json');
}

findMissingTranslations().catch(console.error);
