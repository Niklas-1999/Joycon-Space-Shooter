// ============ PFEIL KLASSE ============
class Arrow {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0; // in Grad
        this.length = 40;
        this.width = 12.5;
        this.invulnerable = false;
    }

    setAngle(angle) {
        this.angle = angle;
    }

    draw(ctx, timestamp = 0) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);

        // Shield circle when invulnerable
        if (this.invulnerable) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = 'rgba(0, 100, 255, 0.5)'; // Semi-transparent blue
            ctx.beginPath();
            ctx.arc(0, 0, this.length * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Blinking effect when invulnerable
        let opacity = 1;
        if (this.invulnerable) {
            const blinkSpeed = 10; // blinks per second
            opacity = (Math.sin(timestamp * blinkSpeed * Math.PI / 1000) + 1) / 2 * 0.5 + 0.5; // 0.5 to 1
        }

        ctx.globalAlpha = opacity;

        // Pfeilspitze
        ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
        ctx.beginPath();
        ctx.moveTo(this.length, 0);
        ctx.lineTo(-this.length / 2, this.width);
        ctx.lineTo(-this.length / 3, 0);
        ctx.lineTo(-this.length / 2, -this.width);
        ctx.closePath();
        ctx.fill();

        // Pfeil Outline
        ctx.strokeStyle = 'rgba(255, 100, 100, 1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}
