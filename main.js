const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');

// Game state
let score = 0;
let playing = true;
let zombie = { x: 200, y: 200, size: 90 };
let speed = 2.0; // zombie drift speed

// Draw a simple "zombie" as a green circle + face
function drawZombie() {
  ctx.save();
  ctx.fillStyle = '#059669'; // body
  ctx.beginPath();
  ctx.arc(zombie.x, zombie.y, zombie.size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#111827';
  const eyeOffsetX = zombie.size * 0.15;
  const eyeOffsetY = zombie.size * -0.08;
  ctx.beginPath();
  ctx.arc(zombie.x - eyeOffsetX, zombie.y + eyeOffsetY, zombie.size * 0.07, 0, Math.PI * 2);
  ctx.arc(zombie.x + eyeOffsetX, zombie.y + eyeOffsetY, zombie.size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (stitches)
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(zombie.x - zombie.size * 0.2, zombie.y + zombie.size * 0.15);
  ctx.lineTo(zombie.x + zombie.size * 0.2, zombie.y + zombie.size * 0.15);
  ctx.stroke();
  ctx.restore();
}

function drawScore() {
  scoreEl.textContent = `Score: ${score}`;
}

function randomizeZombie() {
  zombie.x = Math.random() * (canvas.width - 100) + 50;
  zombie.y = Math.random() * (canvas.height - 100) + 50;
}

canvas.addEventListener('click', (e) => {
  if (!playing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const dx = x - zombie.x;
  const dy = y - zombie.y;
  if (Math.hypot(dx, dy) < zombie.size / 2) {
    score++;
    randomizeZombie();
  }
});

resetBtn.addEventListener('click', () => {
  score = 0;
  playing = true;
  randomizeZombie();
  drawScore();
});

function update(delta) {
  // Simple drift so zombie moves a little each frame
  zombie.x += (Math.random() - 0.5) * speed;
  zombie.y += (Math.random() - 0.5) * speed;
  // keep within bounds
  zombie.x = Math.max(50, Math.min(canvas.width - 50, zombie.x));
  zombie.y = Math.max(50, Math.min(canvas.height - 50, zombie.y));
}

let last = 0;
function loop(ts) {
  const delta = ts - last; last = ts;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update(delta);
  drawZombie();
  drawScore();
  requestAnimationFrame(loop);
}
randomizeZombie();
requestAnimationFrame(loop);
