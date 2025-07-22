async function translateMissingGallery() {
  console.log('🌐 Traduction automatique des titres manquants...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/translate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 'HomePage',
        section: 'gallery',
        key: 'title'
      })
    });
    
    const result = await response.json();
    console.log('Résultat:', result);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

translateMissingGallery();
