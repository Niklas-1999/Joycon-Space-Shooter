// ============ STARS KLASSE ============
class StarField {
    constructor(width, height, starCount = 200) {
        this.width = width;
        this.height = height;
        this.starCount = starCount;
        this.stars = [];
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.generateStars();
    }

    generateStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.5,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }

    update(angle, distance, maxDistance, delta) {
        // Berechne die Bewegung basierend auf Winkel und Entfernung
        if (distance > 0 && delta > 0) {
            const ratio = distance / maxDistance;
            const speed = ratio * ratio * 0.35 * Math.min(this.width, this.height); // relative Geschwindigkeit pro Sekunde
            const rad = angle * Math.PI / 180;

            // Bewegung in die entgegengesetzte Richtung (parallax-effekt)
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
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';

        for (let star of this.stars) {
            // Berechne Position mit Offset
            let x = star.x + this.offsetX;
            let y = star.y + this.offsetY;

            // Wrap around
            if (x < 0) x += this.width;
            if (x > this.width) x -= this.width;
            if (y < 0) y += this.height;
            if (y > this.height) y -= this.height;

            // Zeichne Stern
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(x, y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
