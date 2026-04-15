// ============ ASTEROID MANAGER KLASSE ============
class AsteroidManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.asteroids = [];
        this.spawnTimer = 0;
        this.spawnInterval = 60; // Alle 60 Frames (ca. 1 Sekunde bei 60 FPS)
        this.maxAsteroids = 8;
        this.score = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    reset() {
        this.asteroids = [];
        this.spawnTimer = 0;
        this.score = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    spawnAsteroid() {
        if (this.asteroids.length >= this.maxAsteroids) return;

        // Zufällige Größe (10-30 Pixel)
        const size = Math.random() * 20 + 10;

        // Zufällige Geschwindigkeit (1-4 Pixel pro Frame)
        const speed = Math.random() * 3 + 1;

        // Spawn-Position: AUßERHALB des sichtbaren Bereichs (mit extra Margin)
        const margin = 50; // Extra Abstand außerhalb des Bildschirms
        const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let x, y, direction;

        switch (side) {
            case 0: // Oben - weit außerhalb
                x = Math.random() * this.width;
                y = -size - margin;
                direction = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2; // Nach unten
                break;
            case 1: // Rechts - weit außerhalb
                x = this.width + size + margin;
                y = Math.random() * this.height;
                direction = Math.PI + (Math.random() - 0.5) * Math.PI / 2; // Nach links
                break;
            case 2: // Unten - weit außerhalb
                x = Math.random() * this.width;
                y = this.height + size + margin;
                direction = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2; // Nach oben
                break;
            case 3: // Links - weit außerhalb
                x = -size - margin;
                y = Math.random() * this.height;
                direction = (Math.random() - 0.5) * Math.PI / 2; // Nach rechts
                break;
        }

        this.asteroids.push({
            x: x,
            y: y,
            size: size,
            speed: speed,
            direction: direction,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }

    update(joystickAngle, joystickDistance, maxDistance) {
        // Bewegung relativ zum Joystick (wie Sterne)
        if (joystickDistance > 0) {
            const ratio = joystickDistance / maxDistance;
            const speed = ratio * ratio * 12; // Gleiche Geschwindigkeit wie Sterne
            const rad = joystickAngle * Math.PI / 180;

            this.offsetX -= Math.cos(rad) * speed;
            this.offsetY -= Math.sin(rad) * speed;
        }

        // Wrap around für unendliche Bewegung
        if (Math.abs(this.offsetX) > this.width) {
            this.offsetX = this.offsetX % this.width;
        }
        if (Math.abs(this.offsetY) > this.height) {
            this.offsetY = this.offsetY % this.height;
        }

        // Spawn neue Asteroiden
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }

        // Update alle Asteroiden
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];

            // Bewegung
            asteroid.x += Math.cos(asteroid.direction) * asteroid.speed;
            asteroid.y += Math.sin(asteroid.direction) * asteroid.speed;

            // Sehr langsame Rotation (1% der ursprünglichen Geschwindigkeit)
            asteroid.rotation += asteroid.rotationSpeed * 0.01;

            // Entferne Asteroiden weit außerhalb des sichtbaren Bereichs
            const margin = 100; // Großer Margin für Despawning
            if (asteroid.x < -asteroid.size - margin ||
                asteroid.x > this.width + asteroid.size + margin ||
                asteroid.y < -asteroid.size - margin ||
                asteroid.y > this.height + asteroid.size + margin) {
                this.asteroids.splice(i, 1);
                this.score += 10; // Punkte für ausgewichenen Asteroiden
            }
        }
    }

    checkCollision(arrowX, arrowY, arrowRadius) {
        for (let asteroid of this.asteroids) {
            // Position mit Offset (wie beim Zeichnen)
            let x = asteroid.x + this.offsetX;
            let y = asteroid.y + this.offsetY;

            // Wrap around für Kollisionsprüfung
            if (x < 0) x += this.width;
            if (x > this.width) x -= this.width;
            if (y < 0) y += this.height;
            if (y > this.height) y -= this.height;

            const dx = x - arrowX;
            const dy = y - arrowY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.size + arrowRadius) {
                return true; // Kollision!
            }
        }
        return false;
    }

    draw(ctx) {
        ctx.save();

        for (let asteroid of this.asteroids) {
            ctx.save();
            
            // Position mit Offset (wie Sterne)
            let x = asteroid.x + this.offsetX;
            let y = asteroid.y + this.offsetY;

            // Wrap around
            if (x < 0) x += this.width;
            if (x > this.width) x -= this.width;
            if (y < 0) y += this.height;
            if (y > this.height) y -= this.height;

            ctx.translate(x, y);
            ctx.rotate(asteroid.rotation);

            // Asteroid als unregelmäßiges Polygon zeichnen
            ctx.fillStyle = 'rgba(139, 69, 19, 0.8)'; // Braune Farbe
            ctx.strokeStyle = 'rgba(101, 67, 33, 1)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            const sides = 6 + Math.floor(Math.random() * 4); // 6-9 Seiten
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const radius = asteroid.size * (0.7 + Math.random() * 0.6); // Unregelmäßige Form
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;

                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();
    }
}