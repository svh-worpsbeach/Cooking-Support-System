"""
Test Data Generator für automatisierte Tests
Generiert konsistente Testdaten für alle Hauptkomponenten:
- Locations (10 Items)
- Tools (10 Items)
- Events (10 Items)
- Recipes (10 Items)
- Guests (10 Items)
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any


class TestDataGenerator:
    """Generator für konsistente Testdaten"""
    
    @staticmethod
    def generate_locations() -> List[Dict[str, Any]]:
        """Generiert 10 Location-Testdaten"""
        return [
            {
                "name": "Hauptküche",
                "description": "Die zentrale Küche mit allen wichtigen Geräten",
                "image_path": None
            },
            {
                "name": "Vorratsraum",
                "description": "Lagerraum für trockene Lebensmittel und Konserven",
                "image_path": None
            },
            {
                "name": "Kühlschrank",
                "description": "Hauptkühlschrank für frische Lebensmittel",
                "image_path": None
            },
            {
                "name": "Gefrierschrank",
                "description": "Gefriertruhe für langfristige Lagerung",
                "image_path": None
            },
            {
                "name": "Gewürzschrank",
                "description": "Spezieller Schrank für Gewürze und Kräuter",
                "image_path": None
            },
            {
                "name": "Backstation",
                "description": "Bereich mit Backutensilien und Zubehör",
                "image_path": None
            },
            {
                "name": "Grillbereich",
                "description": "Außenbereich mit Grill und Grillzubehör",
                "image_path": None
            },
            {
                "name": "Weinkeller",
                "description": "Kühler Lagerraum für Weine und Spirituosen",
                "image_path": None
            },
            {
                "name": "Kräutergarten",
                "description": "Frische Kräuter direkt aus dem Garten",
                "image_path": None
            },
            {
                "name": "Speisekammer",
                "description": "Zusätzlicher Stauraum für Vorräte",
                "image_path": None
            }
        ]
    
    @staticmethod
    def generate_tools(location_ids: List[int]) -> List[Dict[str, Any]]:
        """
        Generiert 10 Tool-Testdaten
        
        Args:
            location_ids: Liste von Location-IDs für die Zuordnung
        """
        if len(location_ids) < 10:
            raise ValueError("Mindestens 10 Location-IDs erforderlich")
        
        return [
            {
                "name": "Profi-Kochmesser",
                "description": "Scharfes Kochmesser aus japanischem Stahl, 20cm Klinge",
                "location_id": location_ids[0],
                "storage_location": "Messerblock, Position 1",
                "image_path": None
            },
            {
                "name": "Gusseiserne Pfanne",
                "description": "28cm Durchmesser, perfekt für hohe Temperaturen",
                "location_id": location_ids[0],
                "storage_location": "Hängeregal über dem Herd",
                "image_path": None
            },
            {
                "name": "KitchenAid Küchenmaschine",
                "description": "5L Rührschüssel, mit Knethaken und Schneebesen",
                "location_id": location_ids[0],
                "storage_location": "Arbeitsplatte links",
                "image_path": None
            },
            {
                "name": "Digitales Küchenthermometer",
                "description": "Präzise Temperaturmessung bis 300°C",
                "location_id": location_ids[0],
                "storage_location": "Schublade 2",
                "image_path": None
            },
            {
                "name": "Springform-Set",
                "description": "3 Springformen: 20cm, 24cm, 28cm",
                "location_id": location_ids[5],
                "storage_location": "Oberes Regal",
                "image_path": None
            },
            {
                "name": "Standmixer",
                "description": "1200W, 2L Glasbehälter, Smoothie-Programm",
                "location_id": location_ids[0],
                "storage_location": "Arbeitsplatte rechts",
                "image_path": None
            },
            {
                "name": "Grillzange",
                "description": "Edelstahl, 45cm lang, hitzebeständig",
                "location_id": location_ids[6],
                "storage_location": "Grillwagen, Haken 1",
                "image_path": None
            },
            {
                "name": "Nudelmaschine",
                "description": "Manuelle Nudelmaschine für frische Pasta",
                "location_id": location_ids[0],
                "storage_location": "Unterschrank links",
                "image_path": None
            },
            {
                "name": "Mörser und Stößel",
                "description": "Granit, 15cm Durchmesser, für Gewürze",
                "location_id": location_ids[4],
                "storage_location": "Mittleres Regal",
                "image_path": None
            },
            {
                "name": "Sous-Vide Stick",
                "description": "Präzise Temperaturkontrolle für Sous-Vide Garen",
                "location_id": location_ids[0],
                "storage_location": "Schublade 3",
                "image_path": None
            }
        ]

# Made with Bob

    
    @staticmethod
    def generate_events() -> List[Dict[str, Any]]:
        """Generiert 10 Event-Testdaten"""
        base_date = datetime.now()
        
        return [
            {
                "name": "Italienischer Abend",
                "description": "Authentisches 4-Gänge-Menü aus der Toskana",
                "theme": "Italienische Küche",
                "event_date": (base_date + timedelta(days=7)).isoformat(),
                "participants": [
                    {"name": "Maria Schmidt", "dietary_restrictions": "Vegetarisch"},
                    {"name": "Thomas Müller", "dietary_restrictions": None}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Antipasti", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Pasta", "recipe_ids": []},
                    {"course_number": 3, "course_name": "Hauptgang", "recipe_ids": []},
                    {"course_number": 4, "course_name": "Dolce", "recipe_ids": []}
                ]
            },
            {
                "name": "Sushi Workshop",
                "description": "Lerne die Kunst des Sushi-Machens",
                "theme": "Japanische Küche",
                "event_date": (base_date + timedelta(days=14)).isoformat(),
                "participants": [
                    {"name": "Anna Weber", "dietary_restrictions": "Keine rohen Eier"},
                    {"name": "Klaus Fischer", "dietary_restrictions": None}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Maki Rollen", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Nigiri", "recipe_ids": []}
                ]
            },
            {
                "name": "BBQ Party",
                "description": "Sommerliches Grillfest mit amerikanischen Klassikern",
                "theme": "American BBQ",
                "event_date": (base_date + timedelta(days=21)).isoformat(),
                "participants": [
                    {"name": "Michael Braun", "dietary_restrictions": None},
                    {"name": "Sarah Klein", "dietary_restrictions": "Glutenfrei"}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Vorspeisen", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Gegrilltes", "recipe_ids": []},
                    {"course_number": 3, "course_name": "Beilagen", "recipe_ids": []}
                ]
            },
            {
                "name": "Französisches Dinner",
                "description": "Elegantes 5-Gänge-Menü der Haute Cuisine",
                "theme": "Französische Küche",
                "event_date": (base_date + timedelta(days=28)).isoformat(),
                "participants": [
                    {"name": "Sophie Laurent", "dietary_restrictions": "Laktosefrei"},
                    {"name": "Pierre Dubois", "dietary_restrictions": None}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Amuse-Bouche", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Entrée", "recipe_ids": []},
                    {"course_number": 3, "course_name": "Poisson", "recipe_ids": []},
                    {"course_number": 4, "course_name": "Viande", "recipe_ids": []},
                    {"course_number": 5, "course_name": "Dessert", "recipe_ids": []}
                ]
            },
            {
                "name": "Veganes Festmahl",
                "description": "Kreative pflanzliche Gerichte ohne Kompromisse",
                "theme": "Vegane Küche",
                "event_date": (base_date + timedelta(days=35)).isoformat(),
                "participants": [
                    {"name": "Lisa Grün", "dietary_restrictions": "Vegan"},
                    {"name": "Max Stein", "dietary_restrictions": "Vegan, Nussallergie"}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Vorspeise", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Hauptgang", "recipe_ids": []},
                    {"course_number": 3, "course_name": "Dessert", "recipe_ids": []}
                ]
            },
            {
                "name": "Tapas Abend",
                "description": "Spanische Kleinigkeiten zum Teilen",
                "theme": "Spanische Küche",
                "event_date": (base_date + timedelta(days=42)).isoformat(),
                "participants": [
                    {"name": "Carlos Rodriguez", "dietary_restrictions": None},
                    {"name": "Elena Martinez", "dietary_restrictions": "Keine Meeresfrüchte"}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Kalte Tapas", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Warme Tapas", "recipe_ids": []}
                ]
            },
            {
                "name": "Thai Kochkurs",
                "description": "Authentische thailändische Aromen",
                "theme": "Thailändische Küche",
                "event_date": (base_date + timedelta(days=49)).isoformat(),
                "participants": [
                    {"name": "Nina Becker", "dietary_restrictions": "Mild gewürzt"},
                    {"name": "Jan Hoffmann", "dietary_restrictions": None}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Suppe", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Curry", "recipe_ids": []},
                    {"course_number": 3, "course_name": "Dessert", "recipe_ids": []}
                ]
            },
            {
                "name": "Weihnachtsmenü",
                "description": "Festliches Menü für die Feiertage",
                "theme": "Weihnachten",
                "event_date": (base_date + timedelta(days=56)).isoformat(),
                "participants": [
                    {"name": "Familie Schneider", "dietary_restrictions": "Keine Nüsse"},
                    {"name": "Oma Gertrud", "dietary_restrictions": "Weiche Kost"}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Vorspeise", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Hauptgang", "recipe_ids": []},
                    {"course_number": 3, "course_name": "Dessert", "recipe_ids": []}
                ]
            },
            {
                "name": "Brunch Buffet",
                "description": "Ausgiebiger Brunch mit süßen und herzhaften Speisen",
                "theme": "Brunch",
                "event_date": (base_date + timedelta(days=63)).isoformat(),
                "participants": [
                    {"name": "Julia Wagner", "dietary_restrictions": None},
                    {"name": "Tim Schulz", "dietary_restrictions": "Vegetarisch"}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Süßes", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Herzhaftes", "recipe_ids": []}
                ]
            },
            {
                "name": "Indischer Gewürzabend",
                "description": "Aromatische Gerichte aus verschiedenen Regionen Indiens",
                "theme": "Indische Küche",
                "event_date": (base_date + timedelta(days=70)).isoformat(),
                "participants": [
                    {"name": "Priya Patel", "dietary_restrictions": "Vegetarisch"},
                    {"name": "David Koch", "dietary_restrictions": "Scharf"}
                ],
                "courses": [
                    {"course_number": 1, "course_name": "Vorspeisen", "recipe_ids": []},
                    {"course_number": 2, "course_name": "Currys", "recipe_ids": []},
                    {"course_number": 3, "course_name": "Beilagen", "recipe_ids": []},
                    {"course_number": 4, "course_name": "Dessert", "recipe_ids": []}
                ]
            }
        ]

    
    @staticmethod
    def generate_recipes() -> List[Dict[str, Any]]:
        """Generiert 10 Recipe-Testdaten"""
        return [
            {
                "name": "Spaghetti Carbonara",
                "description": "Klassisches römisches Pasta-Gericht mit Ei, Pecorino und Guanciale",
                "preparation_time": "0:15",
                "cooking_time": "0:20",
                "categories": ["Pasta", "Italienisch", "Hauptgericht"],
                "ingredients": [
                    {"name": "Spaghetti", "description": None, "amount": 400, "unit": "g", "order_index": 0},
                    {"name": "Guanciale", "description": "Italienischer Schweinebackenspeck", "amount": 150, "unit": "g", "order_index": 1},
                    {"name": "Eier", "description": "Freilandeier", "amount": 4, "unit": "Stück", "order_index": 2},
                    {"name": "Pecorino Romano", "description": "Gerieben", "amount": 100, "unit": "g", "order_index": 3},
                    {"name": "Schwarzer Pfeffer", "description": "Frisch gemahlen", "amount": 1, "unit": "TL", "order_index": 4}
                ],
                "steps": [
                    {"step_number": 1, "content": "Wasser für die Pasta zum Kochen bringen und salzen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Guanciale in kleine Würfel schneiden und in einer Pfanne knusprig braten.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Eier mit Pecorino und Pfeffer verquirlen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Spaghetti al dente kochen, abgießen und etwas Nudelwasser aufheben.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Pasta mit Guanciale mischen, von der Hitze nehmen und Ei-Mischung unterrühren. Mit Nudelwasser cremig rühren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Rindersteak mit Kräuterbutter",
                "description": "Perfekt gebratenes Rindersteak mit hausgemachter Kräuterbutter",
                "preparation_time": "0:20",
                "cooking_time": "0:15",
                "categories": ["Fleisch", "Hauptgericht", "Grillen"],
                "ingredients": [
                    {"name": "Rindersteak", "description": "Entrecôte oder Ribeye, 250g pro Person", "amount": 2, "unit": "Stück", "order_index": 0},
                    {"name": "Butter", "description": "Zimmerwarm", "amount": 100, "unit": "g", "order_index": 1},
                    {"name": "Petersilie", "description": "Frisch gehackt", "amount": 2, "unit": "EL", "order_index": 2},
                    {"name": "Knoblauch", "description": "Fein gehackt", "amount": 2, "unit": "Zehen", "order_index": 3},
                    {"name": "Olivenöl", "description": None, "amount": 2, "unit": "EL", "order_index": 4}
                ],
                "steps": [
                    {"step_number": 1, "content": "Kräuterbutter vorbereiten: Butter mit Petersilie, Knoblauch, Salz und Pfeffer mischen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Steaks 30 Minuten vor dem Braten aus dem Kühlschrank nehmen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Steaks trocken tupfen und mit Salz und Pfeffer würzen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Pfanne stark erhitzen, Olivenöl hinzufügen und Steaks 3-4 Minuten pro Seite braten.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Steaks ruhen lassen und mit Kräuterbutter servieren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Gemüse-Curry",
                "description": "Aromatisches veganes Curry mit Kokosmilch und frischem Gemüse",
                "preparation_time": "0:25",
                "cooking_time": "0:30",
                "categories": ["Vegan", "Curry", "Hauptgericht", "Indisch"],
                "ingredients": [
                    {"name": "Süßkartoffeln", "description": "In Würfel geschnitten", "amount": 300, "unit": "g", "order_index": 0},
                    {"name": "Blumenkohl", "description": "In Röschen", "amount": 200, "unit": "g", "order_index": 1},
                    {"name": "Kichererbsen", "description": "Aus der Dose, abgetropft", "amount": 400, "unit": "g", "order_index": 2},
                    {"name": "Kokosmilch", "description": None, "amount": 400, "unit": "ml", "order_index": 3},
                    {"name": "Currypaste", "description": "Rot oder gelb", "amount": 2, "unit": "EL", "order_index": 4}
                ],
                "steps": [
                    {"step_number": 1, "content": "Zwiebeln, Knoblauch und Ingwer in Öl anbraten.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Currypaste hinzufügen und kurz mitbraten.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Süßkartoffeln und Blumenkohl hinzufügen, mit Kokosmilch ablöschen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "20 Minuten köcheln lassen, dann Kichererbsen hinzufügen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Spinat unterheben und mit Reis servieren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Schokoladen-Lava-Kuchen",
                "description": "Warmer Schokoladenkuchen mit flüssigem Kern",
                "preparation_time": "0:15",
                "cooking_time": "0:12",
                "categories": ["Dessert", "Schokolade", "Backen"],
                "ingredients": [
                    {"name": "Zartbitterschokolade", "description": "70% Kakao", "amount": 200, "unit": "g", "order_index": 0},
                    {"name": "Butter", "description": None, "amount": 100, "unit": "g", "order_index": 1},
                    {"name": "Eier", "description": None, "amount": 3, "unit": "Stück", "order_index": 2},
                    {"name": "Zucker", "description": None, "amount": 75, "unit": "g", "order_index": 3},
                    {"name": "Mehl", "description": None, "amount": 50, "unit": "g", "order_index": 4}
                ],
                "steps": [
                    {"step_number": 1, "content": "Ofen auf 200°C vorheizen. Förmchen buttern und mit Kakao ausstreuen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Schokolade und Butter im Wasserbad schmelzen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Eier mit Zucker schaumig schlagen, Vanille hinzufügen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Schokolade unterrühren, Mehl unterheben.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "In Förmchen füllen und 12 Minuten backen. Sofort servieren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Caesar Salad",
                "description": "Klassischer Caesar Salad mit Croutons und Parmesan",
                "preparation_time": "0:20",
                "cooking_time": "0:10",
                "categories": ["Salat", "Vorspeise", "Amerikanisch"],
                "ingredients": [
                    {"name": "Römersalat", "description": "Gewaschen und zerteilt", "amount": 2, "unit": "Köpfe", "order_index": 0},
                    {"name": "Hähnchenbrust", "description": "Optional", "amount": 300, "unit": "g", "order_index": 1},
                    {"name": "Parmesan", "description": "Frisch gehobelt", "amount": 50, "unit": "g", "order_index": 2},
                    {"name": "Croutons", "description": "Selbstgemacht oder gekauft", "amount": 100, "unit": "g", "order_index": 3}
                ],
                "steps": [
                    {"step_number": 1, "content": "Dressing zubereiten: Mayonnaise, Knoblauch, Zitronensaft, Worcestersauce und Parmesan mischen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Hähnchenbrust würzen und braten, in Streifen schneiden.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Römersalat in mundgerechte Stücke reißen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Salat mit Dressing mischen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Mit Hähnchen, Croutons und Parmesan garnieren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Pad Thai",
                "description": "Thailändische gebratene Reisnudeln mit Tamarinde und Erdnüssen",
                "preparation_time": "0:30",
                "cooking_time": "0:15",
                "categories": ["Thailändisch", "Nudeln", "Hauptgericht"],
                "ingredients": [
                    {"name": "Reisnudeln", "description": "Breit", "amount": 250, "unit": "g", "order_index": 0},
                    {"name": "Garnelen", "description": "Geschält", "amount": 200, "unit": "g", "order_index": 1},
                    {"name": "Eier", "description": None, "amount": 2, "unit": "Stück", "order_index": 2},
                    {"name": "Sojasprossen", "description": None, "amount": 100, "unit": "g", "order_index": 3}
                ],
                "steps": [
                    {"step_number": 1, "content": "Reisnudeln nach Packungsanweisung einweichen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Sauce aus Tamarinde, Fischsauce und Zucker mischen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Garnelen in heißem Wok anbraten, beiseite stellen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Eier verquirlen und im Wok stocken lassen, Nudeln hinzufügen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Sauce, Garnelen und Sprossen untermischen. Mit Erdnüssen und Limette servieren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Risotto ai Funghi",
                "description": "Cremiges Pilzrisotto mit Steinpilzen und Parmesan",
                "preparation_time": "0:15",
                "cooking_time": "0:30",
                "categories": ["Italienisch", "Reis", "Vegetarisch", "Hauptgericht"],
                "ingredients": [
                    {"name": "Risotto-Reis", "description": "Arborio oder Carnaroli", "amount": 300, "unit": "g", "order_index": 0},
                    {"name": "Gemischte Pilze", "description": "Steinpilze, Champignons", "amount": 400, "unit": "g", "order_index": 1},
                    {"name": "Gemüsebrühe", "description": "Heiß", "amount": 1, "unit": "l", "order_index": 2},
                    {"name": "Weißwein", "description": "Trocken", "amount": 150, "unit": "ml", "order_index": 3}
                ],
                "steps": [
                    {"step_number": 1, "content": "Pilze putzen und in Scheiben schneiden, in Butter anbraten.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Zwiebel glasig dünsten, Reis hinzufügen und anschwitzen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Mit Weißwein ablöschen und einkochen lassen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Nach und nach Brühe hinzufügen und unter ständigem Rühren garen (ca. 20 Min).", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Pilze, Parmesan und Butter unterrühren. Mit Petersilie garnieren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Tiramisu",
                "description": "Klassisches italienisches Dessert mit Mascarpone und Espresso",
                "preparation_time": "0:30",
                "cooking_time": "0:00",
                "categories": ["Dessert", "Italienisch", "Kalt"],
                "ingredients": [
                    {"name": "Mascarpone", "description": None, "amount": 500, "unit": "g", "order_index": 0},
                    {"name": "Eier", "description": "Getrennt", "amount": 4, "unit": "Stück", "order_index": 1},
                    {"name": "Zucker", "description": None, "amount": 100, "unit": "g", "order_index": 2},
                    {"name": "Löffelbiskuits", "description": None, "amount": 300, "unit": "g", "order_index": 3}
                ],
                "steps": [
                    {"step_number": 1, "content": "Eigelb mit Zucker schaumig schlagen, Mascarpone unterrühren.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Eiweiß steif schlagen und vorsichtig unterheben.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Espresso mit Amaretto mischen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Löffelbiskuits kurz in Espresso tauchen und in Form schichten.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Mascarponecreme darauf verteilen, wiederholen. Mindestens 4 Stunden kühlen, mit Kakao bestäuben.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Pulled Pork Burger",
                "description": "Langsam gegartes Schweinefleisch im Burger-Brötchen",
                "preparation_time": "0:30",
                "cooking_time": "8:00",
                "categories": ["Amerikanisch", "Fleisch", "BBQ", "Hauptgericht"],
                "ingredients": [
                    {"name": "Schweinenacken", "description": None, "amount": 2, "unit": "kg", "order_index": 0},
                    {"name": "BBQ-Rub", "description": "Gewürzmischung", "amount": 4, "unit": "EL", "order_index": 1},
                    {"name": "BBQ-Sauce", "description": None, "amount": 300, "unit": "ml", "order_index": 2},
                    {"name": "Burger-Brötchen", "description": None, "amount": 8, "unit": "Stück", "order_index": 3}
                ],
                "steps": [
                    {"step_number": 1, "content": "Schweinenacken mit BBQ-Rub einreiben und 1 Stunde marinieren.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Bei 110°C im Ofen oder Smoker 8 Stunden garen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Fleisch mit zwei Gabeln zerpflücken.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Mit BBQ-Sauce mischen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Auf getoasteten Brötchen mit Coleslaw servieren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            },
            {
                "name": "Gazpacho",
                "description": "Kalte spanische Tomatensuppe, perfekt für heiße Tage",
                "preparation_time": "0:20",
                "cooking_time": "0:00",
                "categories": ["Suppe", "Spanisch", "Vegan", "Kalt"],
                "ingredients": [
                    {"name": "Tomaten", "description": "Reif und aromatisch", "amount": 1, "unit": "kg", "order_index": 0},
                    {"name": "Gurke", "description": "Geschält", "amount": 1, "unit": "Stück", "order_index": 1},
                    {"name": "Paprika", "description": "Rot", "amount": 1, "unit": "Stück", "order_index": 2},
                    {"name": "Knoblauch", "description": None, "amount": 2, "unit": "Zehen", "order_index": 3}
                ],
                "steps": [
                    {"step_number": 1, "content": "Tomaten überbrühen, häuten und grob würfeln.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 2, "content": "Gurke, Paprika und Knoblauch grob schneiden.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 3, "content": "Brot in Wasser einweichen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 4, "content": "Alle Zutaten im Mixer pürieren, Olivenöl langsam einlaufen lassen.", "ingredient_ids": [], "storage_item_ids": []},
                    {"step_number": 5, "content": "Mindestens 2 Stunden kühlen. Eiskalt mit Croutons servieren.", "ingredient_ids": [], "storage_item_ids": []}
                ]
            }
        ]
    
    @staticmethod
    def generate_guests() -> List[Dict[str, Any]]:
        """Generiert 10 Guest-Testdaten"""
        return [
            {
                "first_name": "Anna",
                "last_name": "Schmidt",
                "email": "anna.schmidt@example.com",
                "phone": "+49 151 12345678",
                "street": "Hauptstraße 123",
                "city": "Berlin",
                "postal_code": "10115",
                "country": "Deutschland",
                "intolerances": "Laktose, Gluten",
                "favorites": "Pasta, Salate, Meeresfrüchte",
                "dietary_notes": "Bevorzugt mediterrane Küche",
                "image_path": None
            },
            {
                "first_name": "Thomas",
                "last_name": "Müller",
                "email": "thomas.mueller@example.com",
                "phone": "+49 170 98765432",
                "street": "Gartenweg 45",
                "city": "München",
                "postal_code": "80331",
                "country": "Deutschland",
                "intolerances": None,
                "favorites": "Fleisch, Kartoffeln, Bier",
                "dietary_notes": "Isst alles gerne, besonders deftige Küche",
                "image_path": None
            },
            {
                "first_name": "Sarah",
                "last_name": "Weber",
                "email": "sarah.weber@example.com",
                "phone": "+49 160 11223344",
                "street": "Blumenstraße 7",
                "city": "Hamburg",
                "postal_code": "20095",
                "country": "Deutschland",
                "intolerances": "Nüsse",
                "favorites": "Fisch, Gemüse, Reis",
                "dietary_notes": "Allergisch gegen alle Nussarten",
                "image_path": None
            },
            {
                "first_name": "Michael",
                "last_name": "Fischer",
                "email": "michael.fischer@example.com",
                "phone": "+49 175 55667788",
                "street": "Waldweg 89",
                "city": "Frankfurt",
                "postal_code": "60311",
                "country": "Deutschland",
                "intolerances": None,
                "favorites": "Grillen, Steaks, Burger",
                "dietary_notes": "Großer Fleischliebhaber",
                "image_path": None
            },
            {
                "first_name": "Julia",
                "last_name": "Klein",
                "email": "julia.klein@example.com",
                "phone": "+49 162 99887766",
                "street": "Rosenweg 34",
                "city": "Köln",
                "postal_code": "50667",
                "country": "Deutschland",
                "intolerances": None,
                "favorites": "Süßspeisen, Kuchen, Schokolade",
                "dietary_notes": "Vegetarisch, liebt Desserts",
                "image_path": None
            },
            {
                "first_name": "David",
                "last_name": "Hoffmann",
                "email": "david.hoffmann@example.com",
                "phone": "+49 171 44556677",
                "street": "Bergstraße 56",
                "city": "Stuttgart",
                "postal_code": "70173",
                "country": "Deutschland",
                "intolerances": "Meeresfrüchte",
                "favorites": "Asiatische Küche, Curry, Nudeln",
                "dietary_notes": "Mag es scharf gewürzt",
                "image_path": None
            },
            {
                "first_name": "Lisa",
                "last_name": "Wagner",
                "email": "lisa.wagner@example.com",
                "phone": "+49 152 33221100",
                "street": "Sonnenallee 78",
                "city": "Düsseldorf",
                "postal_code": "40227",
                "country": "Deutschland",
                "intolerances": None,
                "favorites": "Salate, Smoothies, Quinoa",
                "dietary_notes": "Vegan, achtet auf Bio-Qualität",
                "image_path": None
            },
            {
                "first_name": "Peter",
                "last_name": "Becker",
                "email": "peter.becker@example.com",
                "phone": "+49 163 77889900",
                "street": "Kirchplatz 12",
                "city": "Leipzig",
                "postal_code": "04109",
                "country": "Deutschland",
                "intolerances": "Gluten",
                "favorites": "Pizza, Pasta, Italienisch",
                "dietary_notes": "Zöliakie, benötigt glutenfreie Alternativen",
                "image_path": None
            },
            {
                "first_name": "Nina",
                "last_name": "Schulz",
                "email": "nina.schulz@example.com",
                "phone": "+49 174 22334455",
                "street": "Seestraße 90",
                "city": "Dresden",
                "postal_code": "01067",
                "country": "Deutschland",
                "intolerances": None,
                "favorites": "Sushi, Ramen, Japanisch",
                "dietary_notes": "Liebt asiatische Küche",
                "image_path": None
            },
            {
                "first_name": "Markus",
                "last_name": "Richter",
                "email": "markus.richter@example.com",
                "phone": "+49 169 66778899",
                "street": "Parkweg 23",
                "city": "Hannover",
                "postal_code": "30159",
                "country": "Deutschland",
                "intolerances": "Laktose",
                "favorites": "Gegrilltes, Salate, Gemüse",
                "dietary_notes": "Laktoseintoleranz, bevorzugt leichte Kost",
                "image_path": None
            }
        ]
