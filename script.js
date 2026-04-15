// ============ HAUPT-PROGRAM ============
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ============ GLOBALE VARIABLEN ============
let joystick;
let arrow;
let starField;
let asteroidManager;
let gameOver = false;
let score = 0;
let lives = 3;
let invulnerable = false;
let invulnerableTimer = 0;
let invulnerableDuration = 3; // Sekunden
let lastTimestamp = 0;
let animationId = null;
let lasers = []; // Aktive Laserstrahlen
let joystickTouchId = null; // ID des Fingers, der den Joystick steuert

// ============ RESPONSIVE DIMENSIONEN ============
function getJoystickDimensions() {
    const isMobile = window.innerWidth < 768;
    const isSmallMobile = window.innerWidth < 480;

    let radius, offsetX, offsetY;

    if (isSmallMobile) {
        radius = 60;
        offsetX = window.innerWidth / 2;
        offsetY = window.innerHeight - 100;
    } else if (isMobile) {
        radius = 90;
        offsetX = window.innerWidth / 2;
        offsetY = window.innerHeight - 120;
    } else {
        radius = 120;
        offsetX = window.innerWidth / 2;
        offsetY = window.innerHeight - 150;
    }

    return { radius, offsetX, offsetY };
}

// ============ OBJEKTE INITIALISIEREN ============
function initializeObjects() {
    const dims = getJoystickDimensions();
    joystick = new Joystick(dims.offsetX, dims.offsetY, dims.radius);
    arrow = new Arrow(window.innerWidth / 2, window.innerHeight / 2);
    starField = new StarField(window.innerWidth, window.innerHeight, 300);
    asteroidManager = new AsteroidManager(window.innerWidth, window.innerHeight);
    updateHearts(); // Herzen initialisieren
}

initializeObjects();

// Herzen nochmal sicherheitshalber initialisieren
updateHearts();

// ============ CANVAS RESIZE HANDLING ============
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeObjects();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ============ TOUCH-EVENT HANDLER ============
function handleTouchStart(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (!joystick.isActive && joystick.isInside(x, y)) {
        joystickTouchId = touch.identifier;
        joystick.setInitialTouch(x, y);
        if (gameOver) resetGame();
        updateStatus('Aktiv');
    } else if (!gameOver) {
        shootLaser();
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!joystick.isActive || joystickTouchId === null) return;

    const touch = Array.from(e.touches).find(t => t.identifier === joystickTouchId);
    if (!touch) return;

    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    joystick.move(x, y);
    arrow.setAngle(joystick.angle);
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!joystick.isActive || joystickTouchId === null) return;

    const endedJoystickTouch = Array.from(e.changedTouches).some(t => t.identifier === joystickTouchId);
    if (endedJoystickTouch) {
        joystick.endTouch();
        joystickTouchId = null;
        // arrow.setAngle(0); // Removed: arrow should stay in last direction
        if (!gameOver) updateStatus('Bereit');
    }
}

// ============ MAUS-EVENT HANDLER (für Desktop) ============
let mouseDown = false;

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (joystick.setInitialTouch(x, y)) {
        mouseDown = true;
        if (gameOver) resetGame();
        updateStatus('Aktiv (Maus)');
    } else if (!gameOver) {
        shootLaser();
    }
}

function handleMouseMove(e) {
    if (!mouseDown || !joystick.isActive) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    joystick.move(x, y);
    arrow.setAngle(joystick.angle);
}

function handleMouseUp() {
    mouseDown = false;
    if (joystick.isActive) {
        joystick.endTouch();
        // arrow.setAngle(0); // Removed: arrow should stay in last direction
        if (!gameOver) updateStatus('Bereit');
    }
}

// ============ TASTATUR HANDLER ============
function handleKeyDown(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameOver) {
            shootLaser();
        }
    }
}

// ============ EVENT LISTENER REGISTRIEREN ============
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
document.addEventListener('keydown', handleKeyDown);

// Restart Button Event Listener
document.getElementById('restartButton').addEventListener('click', resetGame);

// ============ LEBENSSYSTEM ============
function updateHearts() {
    for (let i = 1; i <= 3; i++) {
        const heart = document.getElementById(`heart${i}`);
        if (i <= lives) {
            heart.classList.remove('heart-lost');
        } else {
            heart.classList.add('heart-lost');
        }
    }
}

function shootLaser() {
    const rad = arrow.angle * Math.PI / 180;
    const speed = Math.min(window.innerWidth, window.innerHeight) * 0.9; // pixels per second

    lasers.push({
        x: arrow.x,
        y: arrow.y,
        dx: Math.cos(rad),
        dy: Math.sin(rad),
        speed,
        radius: 4
    });
}

function updateLasers(delta) {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.x += laser.dx * laser.speed * delta;
        laser.y += laser.dy * laser.speed * delta;

        // Laser außerhalb des Bildschirms entfernen
        if (laser.x < -20 || laser.x > canvas.width + 20 || laser.y < -20 || laser.y > canvas.height + 20) {
            lasers.splice(i, 1);
            continue;
        }

        if (asteroidManager.hitLaser(laser.x, laser.y, laser.radius)) {
            lasers.splice(i, 1);
            score += 20;
        }
    }
}

function drawLasers(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
    ctx.shadowBlur = 12;

    for (const laser of lasers) {
        ctx.beginPath();
        ctx.moveTo(laser.x - laser.dx * 8, laser.y - laser.dy * 8);
        ctx.lineTo(laser.x + laser.dx * 8, laser.y + laser.dy * 8);
        ctx.stroke();
    }

    ctx.restore();
}

function loseLife() {
    if (invulnerable) return; // Schon unverwundbar

    lives--;
    updateHearts();

    if (lives <= 0) {
        // Game Over
        gameOver = true;
        document.getElementById('finalScore').textContent = score;
        document.getElementById('gameOverScreen').style.display = 'flex';
        updateStatus('GAME OVER!');
    } else {
        // Unverwundbar machen
        invulnerable = true;
        invulnerableTimer = invulnerableDuration;
        document.getElementById('canvas').classList.add('arrow-invulnerable'); // Canvas blinkt für Unverwundbarkeit
        updateStatus('Unverwundbar!');
    }
}

function updateInvulnerability(delta) {
    if (invulnerable) {
        invulnerableTimer -= delta;
        if (invulnerableTimer <= 0) {
            invulnerable = false;
            document.getElementById('canvas').classList.remove('arrow-invulnerable');
            updateStatus('Bereit');
        }
    }
}

// ============ GAME LOGIC ============
function resetGame() {
    gameOver = false;
    score = 0;
    lives = 3;
    invulnerable = false;
    invulnerableTimer = 0;
    asteroidManager.reset();
    updateHearts();
    document.getElementById('gameOverScreen').style.display = 'none';
    updateStatus('Neustart!');
    
    lastTimestamp = 0;
    animate();
}

function updateStatus(status) {
    document.getElementById('status').textContent = status;
}

function checkCollisions() {
    if (invulnerable) return false; // Unverwundbar - keine Kollision

    if (asteroidManager.checkCollision(arrow.x, arrow.y, 30)) {
        loseLife();
        return lives <= 0; // Nur Game Over wenn keine Leben mehr
    }
    return false;
}

// ============ ANIMATION LOOP ============
function animate(timestamp = 0) {
    const delta = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.05) : 0;
    lastTimestamp = timestamp;

    // Canvas löschen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hintergrund zeichnen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Unverwundbarkeit aktualisieren
    updateInvulnerability(delta);

    // Game-Objekte aktualisieren und zeichnen
    starField.update(joystick.angle, joystick.distance, joystick.radius, delta);
    starField.draw(ctx);

    asteroidManager.update(joystick.angle, joystick.distance, joystick.radius, delta);
    asteroidManager.draw(ctx);

    // Laser aktualisieren und zeichnen
    updateLasers(delta);
    drawLasers(ctx);

    // Kollisionsprüfung
    if (checkCollisions()) return;

    // UI-Elemente zeichnen
    joystick.draw(ctx);
    arrow.draw(ctx);

    // Info aktualisieren
    document.getElementById('angle').textContent = Math.round(joystick.angle) + '°';
    document.getElementById('score').textContent = score;

    animationId = requestAnimationFrame(animate);
}

animate();
