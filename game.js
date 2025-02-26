class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusDisplay = document.getElementById('gameStatus');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.hits = 0;
        this.gameWon = false;
        
        // Tank properties
        this.tank = {
            x: 400,
            y: 500,
            width: 60,
            height: 40,
            speed: 5,
            direction: 0
        };
        
        // Bullet properties
        this.bullet = null;
        
        // Enemy positions (Reichstag and defensive positions)
        this.enemies = [
            { x: 350, y: 100, width: 100, height: 150, hit: false }, // Reichstag
            { x: 200, y: 200, width: 40, height: 40, hit: false },   // Position 1
            { x: 400, y: 250, width: 40, height: 40, hit: false },   // Position 2
            { x: 600, y: 200, width: 40, height: 40, hit: false }    // Position 3
        ];
        
        // Flag properties
        this.flag = {
            x: 375,
            y: 50,
            width: 50,
            height: 30,
            raised: false
        };
        
        // Input handling
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        // Start game loop
        this.gameLoop();
    }
    
    update() {
        // Tank movement
        if (this.keys['ArrowLeft'] && this.tank.x > 0) {
            this.tank.x -= this.tank.speed;
            this.tank.direction = -Math.PI/2;
        }
        if (this.keys['ArrowRight'] && this.tank.x < this.canvas.width - this.tank.width) {
            this.tank.x += this.tank.speed;
            this.tank.direction = Math.PI/2;
        }
        if (this.keys['ArrowUp'] && this.tank.y > this.canvas.height/2) {
            this.tank.y -= this.tank.speed;
            this.tank.direction = 0;
        }
        if (this.keys['ArrowDown'] && this.tank.y < this.canvas.height - this.tank.height) {
            this.tank.y += this.tank.speed;
            this.tank.direction = Math.PI;
        }
        
        // Shooting
        if (this.keys[' '] && !this.bullet && !this.gameWon) {
            this.bullet = {
                x: this.tank.x + this.tank.width/2,
                y: this.tank.y,
                speed: 10,
                direction: this.tank.direction
            };
        }
        
        // Bullet movement
        if (this.bullet) {
            this.bullet.x += Math.sin(this.bullet.direction) * this.bullet.speed;
            this.bullet.y -= Math.cos(this.bullet.direction) * this.bullet.speed;
            
            // Check for collisions with enemies
            for (let enemy of this.enemies) {
                if (!enemy.hit && this.checkCollision(this.bullet, enemy)) {
                    enemy.hit = true;
                    this.bullet = null;
                    this.hits++;
                    break;
                }
            }
            
            // Remove bullet if it goes off screen
            if (this.bullet && (this.bullet.x < 0 || this.bullet.x > this.canvas.width ||
                this.bullet.y < 0 || this.bullet.y > this.canvas.height)) {
                this.bullet = null;
            }
        }
        
        // Check for victory
        if (this.hits >= 3 && !this.gameWon) {
            this.gameWon = true;
            this.raiseFlag();
        }
    }
    
    checkCollision(bullet, target) {
        return bullet.x > target.x && 
               bullet.x < target.x + target.width &&
               bullet.y > target.y && 
               bullet.y < target.y + target.height;
    }
    
    raiseFlag() {
        this.flag.raised = true;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Reichstag
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(this.enemies[0].x, this.enemies[0].y, 
                         this.enemies[0].width, this.enemies[0].height);
        
        // Draw defensive positions
        for (let i = 1; i < this.enemies.length; i++) {
            if (!this.enemies[i].hit) {
                this.ctx.fillStyle = '#844';
                this.ctx.fillRect(this.enemies[i].x, this.enemies[i].y,
                                this.enemies[i].width, this.enemies[i].height);
            }
        }
        
        // Draw tank
        this.ctx.save();
        this.ctx.translate(this.tank.x + this.tank.width/2, this.tank.y + this.tank.height/2);
        this.ctx.rotate(this.tank.direction);
        this.ctx.fillStyle = '#0a0';
        this.ctx.fillRect(-this.tank.width/2, -this.tank.height/2, 
                         this.tank.width, this.tank.height);
        this.ctx.restore();
        
        // Draw bullet
        if (this.bullet) {
            this.ctx.fillStyle = '#ff0';
            this.ctx.beginPath();
            this.ctx.arc(this.bullet.x, this.bullet.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw victory flag
        if (this.flag.raised) {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(this.flag.x, this.flag.y, this.flag.width, this.flag.height);
        }
        
        // Draw status
        this.statusDisplay.textContent = `Hits: ${this.hits}/3 ${this.gameWon ? '- Victory!' : ''}`;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};