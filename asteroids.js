// ============ ASTEROID MANAGER KLASSE ============
class AsteroidManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.asteroids = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.0; // Sekunden zwischen Spawns
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

        // Zufällige Größe (50-150 Pixel) - increased by 400%
        const size = Math.random() * 100 + 50;

        // Zufällige Geschwindigkeit (screen-relative, pro Sekunde)
        const minDimension = Math.min(this.width, this.height);
        const speed = (Math.random() * 0.025 + 0.015) * minDimension; // 1.5-4.0 % der kleineren Dimension pro Sekunde

        // Spawn-Position: AUSSERHALB des sichtbaren Bereichs (mit extra Margin)
        // Account for camera offset so asteroids spawn off-screen relative to current view
        const margin = size + 100; // Extra Abstand ausserhalb des Bildschirms
        const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let renderedX, renderedY, direction;

        // First, determine rendered position (screen space)
        switch (side) {
            case 0: // Oben - weit ausserhalb
                renderedX = Math.random() * this.width;
                renderedY = -size - margin;
                direction = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2; // Nach unten
                break;
            case 1: // Rechts - weit ausserhalb
                renderedX = this.width + size + margin;
                renderedY = Math.random() * this.height;
                direction = Math.PI + (Math.random() - 0.5) * Math.PI / 2; // Nach links
                break;
            case 2: // Unten - weit ausserhalb
                renderedX = Math.random() * this.width;
                renderedY = this.height + size + margin;
                direction = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2; // Nach oben
                break;
            case 3: // Links - weit ausserhalb
                renderedX = -size - margin;
                renderedY = Math.random() * this.height;
                direction = (Math.random() - 0.5) * Math.PI / 2; // Nach rechts
                break;
        }

        // Convert rendered position to world position: world = rendered - offset
        const x = renderedX - this.offsetX;
        const y = renderedY - this.offsetY;

        const sides = 6 + Math.floor(Math.random() * 4);
        const shape = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const radius = size * (0.7 + Math.random() * 0.6);
            shape.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }

        this.asteroids.push({
            x: x,
            y: y,
            size: size,
            speed: speed,
            direction: direction,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.5 * 1.5, // 50% faster rotation
            shape: shape,
            spawnTime: Date.now() // Track spawn time for minimum lifespan
        });
    }

    update(joystickAngle, joystickDistance, maxDistance, delta) {
        // Bewegung relativ zum Joystick (wie Sterne)
        if (joystickDistance > 0 && delta > 0) {
            const ratio = joystickDistance / maxDistance;
            const speed = ratio * ratio * 0.3 * Math.min(this.width, this.height); // relative Geschwindigkeit pro Sekunde
            const rad = joystickAngle * Math.PI / 180;

            this.offsetX -= Math.cos(rad) * speed * delta;
            this.offsetY -= Math.sin(rad) * speed * delta;
        }

        // Wrap around für unendliche Bewegung
        if (Math.abs(this.offsetX) > this.width) {
            this.offsetX = this.offsetX % this.width;
        }
        if (Math.abs(this.offsetY) > this.height) {
            this.offsetY = this.offsetY % this.height;
        }

        // Spawn neue Asteroiden
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }

        // Update alle Asteroiden
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];

            // Bewegung
            asteroid.x += Math.cos(asteroid.direction) * asteroid.speed * delta;
            asteroid.y += Math.sin(asteroid.direction) * asteroid.speed * delta;

            // Sehr langsame Rotation (1% der ursprünglichen Geschwindigkeit)
            asteroid.rotation += asteroid.rotationSpeed * delta;

            // Calculate rendered position (with camera offset)
            let renderedX = asteroid.x + this.offsetX;
            let renderedY = asteroid.y + this.offsetY;

            // Wrap around for rendering but don't remove yet
            if (renderedX < 0) renderedX += this.width;
            if (renderedX > this.width) renderedX -= this.width;
            if (renderedY < 0) renderedY += this.height;
            if (renderedY > this.height) renderedY -= this.height;

            // Entferne Asteroiden nur wenn weit außerhalb des sichtbaren Bereichs AND after minimum lifespan
            const margin = 150; // Margin for off-screen despawning
            const minLifespanMs = 10000; // 10 seconds minimum lifespan
            const hasMinimumLifespan = Date.now() - asteroid.spawnTime > minLifespanMs;
            
            if (hasMinimumLifespan &&
                (renderedX < -asteroid.size - margin ||
                renderedX > this.width + asteroid.size + margin ||
                renderedY < -asteroid.size - margin ||
                renderedY > this.height + asteroid.size + margin)) {
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

            const dx = x - arrowX;
            const dy = y - arrowY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.size + arrowRadius) {
                return true; // Kollision!
            }
        }
        return false;
    }

    hitLaser(laserX, laserY, laserRadius) {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            let x = asteroid.x + this.offsetX;
            let y = asteroid.y + this.offsetY;

            const dx = x - laserX;
            const dy = y - laserY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < asteroid.size + laserRadius) {
                this.asteroids.splice(i, 1);
                return true;
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

            // Don't wrap around - asteroids should not appear on opposite side of screen
            // Only draw if reasonably close to screen (with margin)
            const margin = 200;
            if (x < -margin || x > this.width + margin || y < -margin || y > this.height + margin) {
                ctx.restore();
                continue;
            }

            ctx.translate(x, y);
            ctx.rotate(asteroid.rotation);

            // Asteroid als unregelmäßiges Polygon zeichnen
            ctx.fillStyle = 'rgba(139, 69, 19, 1)'; // Braune Farbe - fully opaque
            ctx.strokeStyle = 'rgba(101, 67, 33, 1)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            const shape = asteroid.shape;
            for (let i = 0; i < shape.length; i++) {
                const px = shape[i].x;
                const py = shape[i].y;

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