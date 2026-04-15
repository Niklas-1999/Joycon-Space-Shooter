// ============ JOYSTICK KLASSE ============
class Joystick {
    constructor(x, y, radius) {
        this.centerX = x;
        this.centerY = y;
        this.radius = radius;
        this.deadzone = radius * 0.1; // 10% Deadzone
        
        // Touch-Punkte
        this.initialTouchX = null;
        this.initialTouchY = null;
        this.currentTouchX = null;
        this.currentTouchY = null;
        
        // Berechnung
        this.angle = 0; // in Grad
        this.distance = 0; // 0 bis radius
        this.isActive = false;
    }

    // Prüfe ob ein Punkt innerhalb des Joysticks liegt
    isInside(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }

    // Setze den initialen Touch-Punkt
    setInitialTouch(x, y) {
        if (this.isInside(x, y)) {
            this.initialTouchX = x;
            this.initialTouchY = y;
            this.currentTouchX = x;
            this.currentTouchY = y;
            this.isActive = true;
            return true;
        }
        return false;
    }

    // Aktualisiere den Touch-Punkt während Bewegung
    move(x, y) {
        if (!this.isActive) return false;
        
        this.currentTouchX = x;
        this.currentTouchY = y;
        
        // Berechne Winkel vom Zentrum zum aktuellen Punkt
        const dx = this.currentTouchX - this.centerX;
        const dy = this.currentTouchY - this.centerY;
        
        // Berechne Winkel: 0° = rechts, 90° = unten, 180° = links, 270° = oben
        this.angle = Math.atan2(dy, dx) * 180 / Math.PI;
        // Normalisiere auf 0-360
        if (this.angle < 0) this.angle += 360;
        
        // Berechne Distanz (mit Begrenzung auf Radius)
        let distance = Math.sqrt(dx * dx + dy * dy);
        this.distance = Math.min(distance, this.radius);
        
        return true;
    }

    // Beende den Touch
    endTouch() {
        this.isActive = false;
        this.initialTouchX = null;
        this.initialTouchY = null;
        this.currentTouchX = null;
        this.currentTouchY = null;
        this.angle = 0;
        this.distance = 0;
    }

    // Zeichne den Joystick
    draw(ctx) {
        // Äußerer Kreis (Joystick Base)
        ctx.save();
        ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inneres Deadzone-Kreis
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.deadzone, 0, Math.PI * 2);
        ctx.stroke();

        // Wenn aktiv, zeichne die Touchpunkte
        if (this.isActive) {
            // Initialer Touchpunkt (Mini-Kreis in der Mitte)
            ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(this.initialTouchX, this.initialTouchY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 200, 0, 1)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Aktueller Touchpunkt
            ctx.fillStyle = 'rgba(0, 255, 100, 0.8)';
            ctx.beginPath();
            ctx.arc(this.currentTouchX, this.currentTouchY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 255, 100, 1)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Linie zwischen initialer und aktuellem Punkt
            ctx.strokeStyle = 'rgba(0, 255, 100, 0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.initialTouchX, this.initialTouchY);
            ctx.lineTo(this.currentTouchX, this.currentTouchY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Linie vom Zentrum zum aktuellen Punkt
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.currentTouchX, this.currentTouchY);
            ctx.stroke();

            // Winkel-Indikator (Linie in Richtung des Winkels)
            const angleRad = this.angle * Math.PI / 180;
            const lineEndX = this.centerX + Math.cos(angleRad) * (this.radius * 0.8);
            const lineEndY = this.centerY + Math.sin(angleRad) * (this.radius * 0.8);
            ctx.strokeStyle = 'rgba(100, 255, 100, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.stroke();
        }

        ctx.restore();
    }
}
