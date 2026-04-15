// ============ PFEIL KLASSE ============
class Arrow {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0; // in Grad
        this.length = 80;
        this.width = 25;
    }

    setAngle(angle) {
        this.angle = angle;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);

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
