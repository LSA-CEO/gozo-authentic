async function translateMissingSpecific() {
  console.log('🌐 Traduction spécifique des éléments manquants\n');
  
  try {
    // 1. Retraduire les catégories (pour nos-aventures-en-mer)
    console.log('1. Traduction des catégories...');
    const resp1 = await fetch('http://localhost:3000/api/admin/translate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: 'categories' })
    });
    console.log('Résultat:', await resp1.json());
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Traduire le contenu du site (pour le subtitle)
    console.log('\n2. Traduction du contenu du site...');
    const resp2 = await fetch('http://localhost:3000/api/admin/translate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: 'site_content' })
    });
    console.log('Résultat:', await resp2.text());
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

translateMissingSpecific();
