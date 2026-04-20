/**
 * Test Data Generator für Frontend-Tests
 * Generiert konsistente Testdaten für alle Hauptkomponenten
 */

export class TestDataGenerator {
  /**
   * Generiert 10 Location-Testdaten
   */
  static generateLocations() {
    return [
      { name: 'Hauptküche', description: 'Die zentrale Küche mit allen wichtigen Geräten', image_path: null },
      { name: 'Vorratsraum', description: 'Lagerraum für trockene Lebensmittel und Konserven', image_path: null },
      { name: 'Kühlschrank', description: 'Hauptkühlschrank für frische Lebensmittel', image_path: null },
      { name: 'Gefrierschrank', description: 'Gefriertruhe für langfristige Lagerung', image_path: null },
      { name: 'Gewürzschrank', description: 'Spezieller Schrank für Gewürze und Kräuter', image_path: null },
      { name: 'Backstation', description: 'Bereich mit Backutensilien und Zubehör', image_path: null },
      { name: 'Grillbereich', description: 'Außenbereich mit Grill und Grillzubehör', image_path: null },
      { name: 'Weinkeller', description: 'Kühler Lagerraum für Weine und Spirituosen', image_path: null },
      { name: 'Kräutergarten', description: 'Frische Kräuter direkt aus dem Garten', image_path: null },
      { name: 'Speisekammer', description: 'Zusätzlicher Stauraum für Vorräte', image_path: null },
    ];
  }

  /**
   * Generiert 10 Tool-Testdaten
   */
  static generateTools(locationIds: number[]) {
    if (locationIds.length < 10) throw new Error('Mindestens 10 Location-IDs erforderlich');
    
    return [
      { name: 'Profi-Kochmesser', description: 'Scharfes Kochmesser aus japanischem Stahl, 20cm Klinge', location_id: locationIds[0], storage_location: 'Messerblock, Position 1', image_path: null },
      { name: 'Gusseiserne Pfanne', description: '28cm Durchmesser, perfekt für hohe Temperaturen', location_id: locationIds[0], storage_location: 'Hängeregal über dem Herd', image_path: null },
      { name: 'KitchenAid Küchenmaschine', description: '5L Rührschüssel, mit Knethaken und Schneebesen', location_id: locationIds[0], storage_location: 'Arbeitsplatte links', image_path: null },
      { name: 'Digitales Küchenthermometer', description: 'Präzise Temperaturmessung bis 300°C', location_id: locationIds[0], storage_location: 'Schublade 2', image_path: null },
      { name: 'Springform-Set', description: '3 Springformen: 20cm, 24cm, 28cm', location_id: locationIds[5], storage_location: 'Oberes Regal', image_path: null },
      { name: 'Standmixer', description: '1200W, 2L Glasbehälter, Smoothie-Programm', location_id: locationIds[0], storage_location: 'Arbeitsplatte rechts', image_path: null },
      { name: 'Grillzange', description: 'Edelstahl, 45cm lang, hitzebeständig', location_id: locationIds[6], storage_location: 'Grillwagen, Haken 1', image_path: null },
      { name: 'Nudelmaschine', description: 'Manuelle Nudelmaschine für frische Pasta', location_id: locationIds[0], storage_location: 'Unterschrank links', image_path: null },
      { name: 'Mörser und Stößel', description: 'Granit, 15cm Durchmesser, für Gewürze', location_id: locationIds[4], storage_location: 'Mittleres Regal', image_path: null },
      { name: 'Sous-Vide Stick', description: 'Präzise Temperaturkontrolle für Sous-Vide Garen', location_id: locationIds[0], storage_location: 'Schublade 3', image_path: null },
    ];
  }

  /**
   * Generiert 10 Event-Testdaten
   */
  static generateEvents() {
    const addDays = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString();
    };

    return [
      { name: 'Italienischer Abend', description: 'Authentisches 4-Gänge-Menü aus der Toskana', theme: 'Italienische Küche', event_date: addDays(7) },
      { name: 'Sushi Workshop', description: 'Lerne die Kunst des Sushi-Machens', theme: 'Japanische Küche', event_date: addDays(14) },
      { name: 'BBQ Party', description: 'Sommerliches Grillfest mit amerikanischen Klassikern', theme: 'American BBQ', event_date: addDays(21) },
      { name: 'Französisches Dinner', description: 'Elegantes 5-Gänge-Menü der Haute Cuisine', theme: 'Französische Küche', event_date: addDays(28) },
      { name: 'Veganes Festmahl', description: 'Kreative pflanzliche Gerichte ohne Kompromisse', theme: 'Vegane Küche', event_date: addDays(35) },
      { name: 'Tapas Abend', description: 'Spanische Kleinigkeiten zum Teilen', theme: 'Spanische Küche', event_date: addDays(42) },
      { name: 'Thai Kochkurs', description: 'Authentische thailändische Aromen', theme: 'Thailändische Küche', event_date: addDays(49) },
      { name: 'Weihnachtsmenü', description: 'Festliches Menü für die Feiertage', theme: 'Weihnachten', event_date: addDays(56) },
      { name: 'Brunch Buffet', description: 'Ausgiebiger Brunch mit süßen und herzhaften Speisen', theme: 'Brunch', event_date: addDays(63) },
      { name: 'Indischer Gewürzabend', description: 'Aromatische Gerichte aus verschiedenen Regionen Indiens', theme: 'Indische Küche', event_date: addDays(70) },
    ];
  }

  /**
   * Generiert 10 Recipe-Testdaten (vereinfacht)
   */
  static generateRecipes() {
    return [
      { name: 'Spaghetti Carbonara', description: 'Klassisches römisches Pasta-Gericht', preparation_time: '0:15', cooking_time: '0:20', categories: ['Pasta', 'Italienisch'] },
      { name: 'Rindersteak mit Kräuterbutter', description: 'Perfekt gebratenes Rindersteak', preparation_time: '0:20', cooking_time: '0:15', categories: ['Fleisch', 'Hauptgericht'] },
      { name: 'Gemüse-Curry', description: 'Aromatisches veganes Curry', preparation_time: '0:25', cooking_time: '0:30', categories: ['Vegan', 'Curry'] },
      { name: 'Schokoladen-Lava-Kuchen', description: 'Warmer Schokoladenkuchen mit flüssigem Kern', preparation_time: '0:15', cooking_time: '0:12', categories: ['Dessert', 'Schokolade'] },
      { name: 'Caesar Salad', description: 'Klassischer Caesar Salad', preparation_time: '0:20', cooking_time: '0:10', categories: ['Salat', 'Vorspeise'] },
      { name: 'Pad Thai', description: 'Thailändische gebratene Reisnudeln', preparation_time: '0:30', cooking_time: '0:15', categories: ['Thailändisch', 'Nudeln'] },
      { name: 'Risotto ai Funghi', description: 'Cremiges Pilzrisotto', preparation_time: '0:15', cooking_time: '0:30', categories: ['Italienisch', 'Reis'] },
      { name: 'Tiramisu', description: 'Klassisches italienisches Dessert', preparation_time: '0:30', cooking_time: '0:00', categories: ['Dessert', 'Italienisch'] },
      { name: 'Pulled Pork Burger', description: 'Langsam gegartes Schweinefleisch', preparation_time: '0:30', cooking_time: '8:00', categories: ['Amerikanisch', 'BBQ'] },
      { name: 'Gazpacho', description: 'Kalte spanische Tomatensuppe', preparation_time: '0:20', cooking_time: '0:00', categories: ['Suppe', 'Spanisch'] },
    ];
  }

  /**
   * Generiert 10 Guest-Testdaten
   */
  static generateGuests() {
    return [
      { first_name: 'Anna', last_name: 'Schmidt', email: 'anna.schmidt@example.com', phone: '+49 151 12345678', city: 'Berlin', intolerances: 'Laktose, Gluten', favorites: 'Pasta, Salate' },
      { first_name: 'Thomas', last_name: 'Müller', email: 'thomas.mueller@example.com', phone: '+49 170 98765432', city: 'München', intolerances: null, favorites: 'Fleisch, Kartoffeln' },
      { first_name: 'Sarah', last_name: 'Weber', email: 'sarah.weber@example.com', phone: '+49 160 11223344', city: 'Hamburg', intolerances: 'Nüsse', favorites: 'Fisch, Gemüse' },
      { first_name: 'Michael', last_name: 'Fischer', email: 'michael.fischer@example.com', phone: '+49 175 55667788', city: 'Frankfurt', intolerances: null, favorites: 'Grillen, Steaks' },
      { first_name: 'Julia', last_name: 'Klein', email: 'julia.klein@example.com', phone: '+49 162 99887766', city: 'Köln', intolerances: null, favorites: 'Süßspeisen, Kuchen' },
      { first_name: 'David', last_name: 'Hoffmann', email: 'david.hoffmann@example.com', phone: '+49 171 44556677', city: 'Stuttgart', intolerances: 'Meeresfrüchte', favorites: 'Asiatische Küche' },
      { first_name: 'Lisa', last_name: 'Wagner', email: 'lisa.wagner@example.com', phone: '+49 152 33221100', city: 'Düsseldorf', intolerances: null, favorites: 'Salate, Smoothies' },
      { first_name: 'Peter', last_name: 'Becker', email: 'peter.becker@example.com', phone: '+49 163 77889900', city: 'Leipzig', intolerances: 'Gluten', favorites: 'Pizza, Pasta' },
      { first_name: 'Nina', last_name: 'Schulz', email: 'nina.schulz@example.com', phone: '+49 174 22334455', city: 'Dresden', intolerances: null, favorites: 'Sushi, Ramen' },
      { first_name: 'Markus', last_name: 'Richter', email: 'markus.richter@example.com', phone: '+49 169 66778899', city: 'Hannover', intolerances: 'Laktose', favorites: 'Gegrilltes, Salate' },
    ];
  }
}

// Made with Bob
