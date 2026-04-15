# 🚀 Joystick Space Shooter

Ein interaktives Weltraum-Spiel, das komplett im Browser läuft! Steuere deinen Raumschiff-Pfeil mit einem virtuellen Joystick, weiche Asteroiden aus und sammle Punkte.

## 🎮 Spielmechanik

- **Joystick-Steuerung**: Berühre und bewege den Joystick am unteren Bildschirmrand
- **Asteroiden vermeiden**: Asteroiden spawnen außerhalb des Bildschirms und fliegen auf dich zu
- **3-Leben-System**: Bei Kollision verlierst du ein Leben und wirst kurz unverwundbar
- **Score-System**: Sammle Punkte, indem du Asteroiden ausweichst
- **Responsive Design**: Funktioniert auf Desktop und Mobile-Geräten

## 🎯 Features

- **Touch & Mouse Support**: Vollständige Unterstützung für Touchscreens und Maus
- **Dynamische Bewegung**: Sterne und Asteroiden bewegen sich relativ zur Joystick-Bewegung
- **Realistische Physik**: Quadratische Beschleunigung für authentisches Fluggefühl
- **Visuelle Effekte**: Blinken bei Unverwundbarkeit, schöne Partikeleffekte
- **Game Over Screen**: Mit Restart-Funktionalität

## 🛠️ Technologie

- **HTML5 Canvas**: Für flüssige 2D-Grafiken
- **Vanilla JavaScript**: Keine Frameworks, pure Performance
- **CSS3**: Responsive Design mit modernen Features
- **Touch Events**: Native Mobile-Unterstützung

## 🚀 Live Demo

Spiele das Spiel direkt in deinem Browser: [GitHub Pages Link]

## 📱 Steuerung

### Mobile/Touch
- Berühre den Joystick-Bereich am unteren Bildschirmrand
- Bewege den Finger, um die Flugrichtung zu steuern
- Bei Game Over: Berühre den Joystick oder den Restart-Button

### Desktop
- Klicke und halte den Joystick-Bereich
- Bewege die Maus, um die Flugrichtung zu steuern
- Bei Game Over: Klicke den Restart-Button

## 🎨 Code-Struktur

```
├── index.html      # HTML-Struktur
├── styles.css      # Styling & Responsive Design
├── script.js       # Hauptlogik & Event-Handling
├── joystick.js     # Joystick-Klasse
├── arrow.js        # Raumschiff-Pfeil-Klasse
├── stars.js        # Sternenfeld-Hintergrund
└── asteroids.js    # Asteroiden-Management
```

## 🔧 Lokale Entwicklung

1. Repository klonen:
   ```bash
   git clone https://github.com/Niklas-1999/Joycon-Space-Shooter.git
   cd Joycon-Space-Shooter
   ```

2. Mit einem lokalen Server öffnen (z.B. Live Server in VS Code)

3. Oder einfach `index.html` im Browser öffnen

## 📈 Performance

- 60 FPS Animation Loop
- Optimierte Canvas-Rendering
- Effiziente Kollisionserkennung
- Responsive für alle Bildschirmgrößen

## 🤝 Beitragen

Pull Requests sind willkommen! Für größere Änderungen bitte zuerst ein Issue erstellen.

## 📄 Lizenz

Dieses Projekt ist Open Source - siehe [LICENSE](LICENSE) Datei für Details.

---

**Viel Spaß beim Spielen! 🌟**