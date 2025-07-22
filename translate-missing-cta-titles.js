async function translateMissingCTATitles() {
  console.log('🌐 Traduction des titres CTA manquants...\n');
  
  const missingTranslations = [
    { page: 'HomePage', section: 'cta', key: 'title', locales: ['de', 'nl', 'es', 'pt'] }
  ];
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/translate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'specific',
        translations: missingTranslations
      })
    });
    
    const result = await response.json();
    console.log('Résultat:', result);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

translateMissingCTATitles();
