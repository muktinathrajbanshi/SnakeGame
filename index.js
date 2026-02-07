const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const canvasSize = 400;

let snake = [{x: 8 * box, y: 8 * box}];
let direction = 'RIGHT';
let score = 0;

// Load fruit images
const fruitImages = {
  apple: new Image(),
  banana: new Image(),
  grapes: new Image(),
  orange: new Image(),
  watermelon: new Image()
};

// Set image sources (you need to have these images in your project folder)
fruitImages.apple.src = 'fruits/apple.png';
fruitImages.banana.src = 'fruits/banana.png';
fruitImages.grapes.src = 'fruits/grapes.png';
fruitImages.orange.src = 'fruits/orange.png';
fruitImages.watermelon.src = 'fruits/watermelon.png';

// List of fruits
const fruits = [
  {name: 'apple', img: fruitImages.apple},
  {name: 'banana', img: fruitImages.banana},
  {name: 'grapes', img: fruitImages.grapes},
  {name: 'orange', img: fruitImages.orange},
  {name: 'watermelon', img: fruitImages.watermelon}
];

// Generate random fruit
let food = randomFruit();

function randomFruit() {
  const fruit = fruits[Math.floor(Math.random() * fruits.length)];
  return {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box,
    img: fruit.img
  };
}

// Draw everything
function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? 'lime' : 'green';
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw fruit image
  ctx.drawImage(food.img, food.x, food.y, box, box);

  document.getElementById('score').innerText = 'Score: ' + score;
}

// Snake controls
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  else if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});

// Collision check
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}

// Update game state
function update() {
  let head = {x: snake[0].x, y: snake[0].y};

  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // Game over
  if (
    head.x < 0 || head.x >= canvasSize ||
    head.y < 0 || head.y >= canvasSize ||
    collision(head, snake)
  ) {
    clearInterval(game);
    alert('Game Over! Your score: ' + score);
    location.reload();
  }

  snake.unshift(head);

  // Eating fruit
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomFruit();
  } else {
    snake.pop();
  }

  draw();
}

// Start game
const game = setInterval(update, 150);
