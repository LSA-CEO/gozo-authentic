const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fonction améliorée pour extraire les clés de traduction
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = [];
  
  // Extraire le namespace - pattern plus flexible
  const namespaceMatches = content.matchAll(/useTranslations\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
  const namespaces = [];
  
  for (const match of namespaceMatches) {
    namespaces.push(match[1]);
  }
  
  if (namespaces.length === 0) return keys;
  
  // Pour chaque namespace trouvé, extraire les clés
  namespaces.forEach(namespace => {
    // Pattern plus flexible pour t('key') ou t("key") ou t(`key`)
    const tMatches = content.matchAll(/\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
    
    for (const match of tMatches) {
      keys.push({
        namespace,
        key: match[1],
        file: filePath.replace('./', '')
      });
    }
  });
  
  return keys;
}

// Scanner récursivement
function scanDirectory(dir, excludeDirs = ['node_modules', '.next', '.git', 'dist', 'build']) {
  const results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip excluded directories et admin
        if (!excludeDirs.includes(file) && !file.startsWith('.') && !filePath.includes('/admin')) {
          results.push(...scanDirectory(filePath, excludeDirs));
        }
      } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !filePath.includes('/admin/')) {
        const keys = extractTranslationKeys(filePath);
        if (keys.length > 0) {
          results.push(...keys);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }
  
  return results;
}

async function findMissingTranslations() {
  console.log('🔍 Scanning for translation keys...\n');
  
  // Scanner tous les fichiers
  const allKeys = scanDirectory('.');
  
  // Grouper par namespace et déduper
  const keysByNamespace = {};
  const filesByKey = {};
  
  allKeys.forEach(item => {
    if (!keysByNamespace[item.namespace]) {
      keysByNamespace[item.namespace] = new Set();
    }
    keysByNamespace[item.namespace].add(item.key);
    
    // Track où chaque clé est utilisée
    const fullKey = `${item.namespace}.${item.key}`;
    if (!filesByKey[fullKey]) {
      filesByKey[fullKey] = new Set();
    }
    filesByKey[fullKey].add(item.file);
  });
  
  console.log('📋 Found translation keys by namespace:\n');
  Object.entries(keysByNamespace).forEach(([namespace, keys]) => {
    console.log(`${namespace}: (${keys.size} keys)`);
    console.log(`  Keys: ${Array.from(keys).sort().join(', ')}`);
    console.log('');
  });
  
  // Récupérer TOUTES les traductions de la DB
  console.log('🔍 Fetching database translations...\n');
  
  const { data: dbTranslations } = await supabaseAdmin
    .from('site_content')
    .select('page, section, key, locale')
    .eq('locale', 'fr');
  
  // Créer un Set des clés existantes
  const existingKeys = new Set();
  dbTranslations?.forEach(item => {
    // Format: page.key ou page.section.key
    if (item.section === 'general') {
      existingKeys.add(`${item.page}.${item.key}`);
    } else {
      existingKeys.add(`${item.page}.${item.section}.${item.key}`);
    }
  });
  
  console.log(`📊 Found ${existingKeys.size} translations in database\n`);
  
  // Identifier les clés manquantes
  console.log('❌ MISSING TRANSLATIONS:\n');
  const missingByNamespace = {};
  let totalMissing = 0;
  
  Object.entries(keysByNamespace).forEach(([namespace, keys]) => {
    const missing = [];
    
    keys.forEach(key => {
      let found = false;
      
      // Essayer différents formats possibles
      if (namespace.includes('.')) {
        // Ex: HomePage.hero -> page=HomePage, section=hero
        const parts = namespace.split('.');
        const checkKey = `${namespace}.${key}`;
        found = existingKeys.has(checkKey);
      } else {
        // Ex: Navigation -> page=Navigation, section=general
        const checkKey1 = `${namespace}.${key}`;
        const checkKey2 = `${namespace}.general.${key}`;
        found = existingKeys.has(checkKey1) || existingKeys.has(checkKey2);
      }
      
      if (!found) {
        missing.push(key);
      }
    });
    
    if (missing.length > 0) {
      missingByNamespace[namespace] = missing;
      totalMissing += missing.length;
      console.log(`${namespace}: ${missing.length} missing`);
      console.log(`  Missing keys: ${missing.sort().join(', ')}`);
      
      // Montrer où ces clés sont utilisées
      console.log('  Used in files:');
      missing.slice(0, 3).forEach(key => {
        const files = Array.from(filesByKey[`${namespace}.${key}`] || []);
        console.log(`    - ${key}: ${files.join(', ')}`);
      });
      console.log('');
    }
  });
  
  // Résumé final
  console.log('─'.repeat(60));
  console.log(`\n📊 SUMMARY: ${totalMissing} missing translations across ${Object.keys(missingByNamespace).length} namespaces\n`);
  
  // Sauvegarder le rapport
  const report = {
    summary: {
      totalMissing,
      namespacesAffected: Object.keys(missingByNamespace).length,
      date: new Date().toISOString()
    },
    missingByNamespace,
    filesScanned: allKeys.length
  };
  
  fs.writeFileSync('missing-translations-report.json', JSON.stringify(report, null, 2));
  console.log('💾 Full report saved to missing-translations-report.json\n');
}

findMissingTranslations().catch(console.error);
