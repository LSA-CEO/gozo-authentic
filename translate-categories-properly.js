async function translateCategoriesProperley() {
  console.log('🌐 Traduction automatique des catégories...\n');
  
  try {
    // Traduire les descriptions des catégories
    const response1 = await fetch('http://localhost:3000/api/admin/translate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'categories'
      })
    });
    
    console.log('Catégories:', await response1.json());
    
    // Traduire le contenu du site
    const response2 = await fetch('http://localhost:3000/api/admin/translate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'site_content'
      })
    });
    
    console.log('Site content:', await response2.json());
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

translateCategoriesProperley();
