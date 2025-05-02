export default function move(gameState) {
    // Initialize move safety map
    let moveSafety = {
      up: true,
      down: true,
      left: true,
      right: true
    };
  
    // Helper: Manhattan Distance between two points.
    function manhattanDistance(a, b) {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
  
    // Helper: Flood Fill to compute reachable open area from a starting cell.
    // It avoids obstacles (snake bodies, enemy bodies, hazards) and returns an integer area count.
    function getReachableArea(start, board, obstacles) {
      const { width, height } = board;
      const visited = new Set();
      const queue = [start];
      let area = 0;
  
      while (queue.length > 0) {
        const pos = queue.shift();
        if (pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height) continue;
        const key = `${pos.x},${pos.y}`;
        if (visited.has(key)) continue;
        if (obstacles.some(seg => seg.x === pos.x && seg.y === pos.y)) continue;
        visited.add(key);
        area++;
        queue.push({ x: pos.x + 1, y: pos.y });
        queue.push({ x: pos.x - 1, y: pos.y });
        queue.push({ x: pos.x, y: pos.y + 1 });
        queue.push({ x: pos.x, y: pos.y - 1 });
      }
      return area;
    }
  
    // Extract key properties from the game state.
    const food = gameState.board.food;
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    const enemySnakes = gameState.board.snakes;
    const myBody = gameState.you.body;
    const myHealth = gameState.you.health;
    const myLength = myBody.length;
  
    // Royale mode: treat hazards as deadly obstacles.
    const hazards = gameState.board.hazards || [];
  
    // Prevent reversing into your neck.
    if (myNeck.x < myHead.x) moveSafety.left = false;
    if (myNeck.x > myHead.x) moveSafety.right = false;
    if (myNeck.y < myHead.y) moveSafety.down = false;
    if (myNeck.y > myHead.y) moveSafety.up = false;
  
    // Avoid moving out of bounds.
    if (myHead.x === 0) moveSafety.left = false;
    if (myHead.y === 0) moveSafety.down = false;
    if (myHead.x === gameState.board.width - 1) moveSafety.right = false;
    if (myHead.y === gameState.board.height - 1) moveSafety.up = false;
  
    // Avoid colliding with your own body (checking adjacent segments).
    for (const segment of myBody.slice(1)) {
      if (segment.x === myHead.x && segment.y === myHead.y + 1) moveSafety.up = false;
      if (segment.x === myHead.x && segment.y === myHead.y - 1) moveSafety.down = false;
      if (segment.x === myHead.x - 1 && segment.y === myHead.y) moveSafety.left = false;
      if (segment.x === myHead.x + 1 && segment.y === myHead.y) moveSafety.right = false;
    }
  
    // Avoid colliding with enemy snake bodies.
    for (const snake of enemySnakes) {
      for (const segment of snake.body) {
        if (segment.x === myHead.x && segment.y === myHead.y + 1) moveSafety.up = false;
        if (segment.x === myHead.x && segment.y === myHead.y - 1) moveSafety.down = false;
        if (segment.x === myHead.x - 1 && segment.y === myHead.y) moveSafety.left = false;
        if (segment.x === myHead.x + 1 && segment.y === myHead.y) moveSafety.right = false;
      }
    }
  
    // Avoid hazards adjacent to your head.
    for (const hazard of hazards) {
      if (hazard.x === myHead.x && hazard.y === myHead.y + 1) moveSafety.up = false;
      if (hazard.x === myHead.x && hazard.y === myHead.y - 1) moveSafety.down = false;
      if (hazard.x === myHead.x - 1 && hazard.y === myHead.y) moveSafety.left = false;
      if (hazard.x === myHead.x + 1 && hazard.y === myHead.y) moveSafety.right = false;
    }
  
    // Define potential new head positions (1 move lookahead).
    const potentialMoves = {
      up: { x: myHead.x, y: myHead.y + 1 },
      down: { x: myHead.x, y: myHead.y - 1 },
      left: { x: myHead.x - 1, y: myHead.y },
      right: { x: myHead.x + 1, y: myHead.y }
    };
  
    // Check each move for out-of-bounds conditions.
    for (const [move, position] of Object.entries(potentialMoves)) {
      if (
        position.x < 0 ||
        position.x >= gameState.board.width ||
        position.y < 0 ||
        position.y >= gameState.board.height
      ) {
        moveSafety[move] = false;
      }
    }
  
    // Disqualify moves that directly collide with any segment of your body.
    for (const segment of myBody) {
      for (const [move, position] of Object.entries(potentialMoves)) {
        if (position.x === segment.x && position.y === segment.y) {
          moveSafety[move] = false;
        }
      }
    }
  
    // One-move lookahead simulation to check future collision with your own updated body.
    for (const [move, position] of Object.entries(potentialMoves)) {
      if (moveSafety[move]) {
        const newHead = position;
        const newBody = [newHead, ...myBody.slice(0, -1)];
        for (let i = 1; i < newBody.length; i++) {
          if (newHead.x === newBody[i].x && newHead.y === newBody[i].y) {
            moveSafety[move] = false;
          }
        }
      }
    }
  
    // Avoid self-traps by simulating one more move ahead.
    for (const [move, position] of Object.entries(potentialMoves)) {
      if (moveSafety[move]) {
        const newHead = position;
        const newBody = [newHead, ...myBody.slice(0, -1)];
        const futureMoveSafety = { up: true, down: true, left: true, right: true };
        const futurePotentialMoves = {
          up: { x: newHead.x, y: newHead.y + 1 },
          down: { x: newHead.x, y: newHead.y - 1 },
          left: { x: newHead.x - 1, y: newHead.y },
          right: { x: newHead.x + 1, y: newHead.y }
        };
  
        for (const [futureMove, futurePosition] of Object.entries(futurePotentialMoves)) {
          for (const segment of newBody) {
            if (futurePosition.x === segment.x && futurePosition.y === segment.y) {
              futureMoveSafety[futureMove] = false;
            }
          }
          if (
            futurePosition.x < 0 ||
            futurePosition.x >= gameState.board.width ||
            futurePosition.y < 0 ||
            futurePosition.y >= gameState.board.height
          ) {
            futureMoveSafety[futureMove] = false;
          }
          // Also avoid future hazards.
          for (const hazard of hazards) {
            if (futurePosition.x === hazard.x && futurePosition.y === hazard.y) {
              futureMoveSafety[futureMove] = false;
            }
          }
        }
        if (!Object.values(futureMoveSafety).some(Boolean)) {
          moveSafety[move] = false;
        }
      }
    }
  
    // ===== Additional Check for Same-Length Head-to-Head Collisions =====
    enemySnakes.forEach(snake => {
      if (snake.id === gameState.you.id) return;
      if (snake.body.length === myLength) {
        const enemyHead = snake.body[0];
        const enemyPotentialMoves = {
          up: { x: enemyHead.x, y: enemyHead.y + 1 },
          down: { x: enemyHead.x, y: enemyHead.y - 1 },
          left: { x: enemyHead.x - 1, y: enemyHead.y },
          right: { x: enemyHead.x + 1, y: enemyHead.y }
        };
        for (const [move, pos] of Object.entries(potentialMoves)) {
          for (const enemyMove of Object.values(enemyPotentialMoves)) {
            if (pos.x === enemyMove.x && pos.y === enemyMove.y) {
              moveSafety[move] = false;
            }
          }
        }
      }
    });
  
    // ===== Additional Check for Larger Snakes Head-to-Head Collisions =====
    enemySnakes.forEach(snake => {
      if (snake.id === gameState.you.id) return;
      if (snake.body.length > myLength) {
        const enemyHead = snake.body[0];
        const enemyPotentialMoves = {
          up: { x: enemyHead.x, y: enemyHead.y + 1 },
          down: { x: enemyHead.x, y: enemyHead.y - 1 },
          left: { x: enemyHead.x - 1, y: enemyHead.y },
          right: { x: enemyHead.x + 1, y: enemyHead.y }
        };
        for (const [move, pos] of Object.entries(potentialMoves)) {
          for (const enemyMove of Object.values(enemyPotentialMoves)) {
            if (pos.x === enemyMove.x && pos.y === enemyMove.y) {
              moveSafety[move] = false;
            }
          }
        }
      }
    });
    // =====================================================================
  
    // -------------------------------
    // Multi-Move Lookahead with Food & Aggressive Bonuses for Royale Mode
    // -------------------------------
    const LOOKAHEAD_DEPTH = 2;
    let enemyBodies = [];
    for (const snake of enemySnakes) {
      if (snake.id !== gameState.you.id) {
        enemyBodies = enemyBodies.concat(snake.body);
      }
    }
  
    // Helper for simulation: get safe moves for simulation (including hazards).
    function getSafeMovesForSimulation(snakeBody, board, enemyBodies) {
      const head = snakeBody[0];
      const possibleMoves = [];
      const moves = {
        up: { x: head.x, y: head.y + 1 },
        down: { x: head.x, y: head.y - 1 },
        left: { x: head.x - 1, y: head.y },
        right: { x: head.x + 1, y: head.y }
      };
  
      for (const [dir, pos] of Object.entries(moves)) {
        if (pos.x < 0 || pos.x >= board.width || pos.y < 0 || pos.y >= board.height)
          continue;
        const obstacles = snakeBody.slice(0, -1).concat(enemyBodies, hazards);
        if (obstacles.some(seg => seg.x === pos.x && seg.y === pos.y)) continue;
        possibleMoves.push(dir);
      }
      return possibleMoves;
    }
  
    // Recursive multi-move lookahead simulation.
    function simulateLookahead(snakeBody, board, enemyBodies, depth) {
      const head = snakeBody[0];
      const obstacles = snakeBody.slice(1).concat(enemyBodies, hazards);
      const currentScore = getReachableArea(head, board, obstacles);
      if (depth === 0) return currentScore;
  
      const safeMoves = getSafeMovesForSimulation(snakeBody, board, enemyBodies);
      if (safeMoves.length === 0) return -Infinity;
  
      let bestChildScore = -Infinity;
      const movesMapping = {
        up: { x: head.x, y: head.y + 1 },
        down: { x: head.x, y: head.y - 1 },
        left: { x: head.x - 1, y: head.y },
        right: { x: head.x + 1, y: head.y }
      };
  
      for (const move of safeMoves) {
        const newHead = movesMapping[move];
        const newSnakeBody = [newHead].concat(snakeBody.slice(0, snakeBody.length - 1));
        const childScore = simulateLookahead(newSnakeBody, board, enemyBodies, depth - 1);
        if (childScore > bestChildScore) bestChildScore = childScore;
      }
      const discountFactor = 0.9;
      return currentScore + discountFactor * bestChildScore;
    }
  
    // Final move selection: combine lookahead, food targeting, enemy scoring, and storm awareness.
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);
    if (safeMoves.length === 0) {
      console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
      return { move: "down" };
    }
  
    // Compute the closest food based on Manhattan distance.
    let closestFood = null;
    let minDistance = Infinity;
    if (food.length > 0) {
      for (const f of food) {
        const d = manhattanDistance(myHead, f);
        if (d < minDistance) {
          closestFood = f;
          minDistance = d;
        }
      }
    }
  
    // Dynamically adjust food weighting: if you're smaller than the largest enemy, prioritize food even more.
    let enemyMaxLength = 0;
    enemySnakes.forEach(snake => {
      if (snake.id !== gameState.you.id && snake.body.length > enemyMaxLength) {
        enemyMaxLength = snake.body.length;
      }
    });
    let FOOD_WEIGHT = myLength < enemyMaxLength ? 20 : 10;
  
    let bestScore = -Infinity;
    let bestMove = safeMoves[0];
    for (const move of safeMoves) {
      const newHead = potentialMoves[move];
      const newSnakeBody = [newHead].concat(myBody.slice(0, myBody.length - 1));
      let score = simulateLookahead(newSnakeBody, gameState.board, enemyBodies, LOOKAHEAD_DEPTH);
  
      // Food bonus: reward moves that decrease Manhattan distance to the closest food.
      if (closestFood) {
        const currentDist = manhattanDistance(myHead, closestFood);
        const newDist = manhattanDistance(newHead, closestFood);
        const foodBonus = (currentDist - newDist) * FOOD_WEIGHT;
        score += foodBonus;
      }
  
      // Food Cluster Bonus: count nearby food items (within a Manhattan distance threshold).
      let foodClusterBonus = 0;
      const FOOD_CLUSTER_RADIUS = 3;  // Tune this radius as needed.
      for (const f of food) {
        const d = manhattanDistance(newHead, f);
        if (d <= FOOD_CLUSTER_RADIUS) {
          // The closer the food, the higher the bonus.
          foodClusterBonus += (FOOD_CLUSTER_RADIUS - d) * 5;
        }
      }
      score += foodClusterBonus;
  
      // Aggressive bonus/penalty for enemy snakes.
      let enemyBonus = 0;
      for (const enemy of enemySnakes) {
        if (enemy.id === gameState.you.id) continue;
        const enemyHead = enemy.body[0];
        const currentEnemyDist = manhattanDistance(myHead, enemyHead);
        const newEnemyDist = manhattanDistance(newHead, enemyHead);
        if (enemy.body.length < myLength && newEnemyDist < currentEnemyDist) {
          enemyBonus += (currentEnemyDist - newEnemyDist) * 15;
        } else if (enemy.body.length === myLength && newEnemyDist < currentEnemyDist) {
          enemyBonus -= (currentEnemyDist - newEnemyDist) * 20;
        }
      }
      // If there is a strong food cluster bonus, reduce the enemy bonus effect so food is prioritized.
      if (foodClusterBonus > 0) {
        enemyBonus *= 0.5;
      }
      score += enemyBonus;
  
      // Optional trap bonus for steering space.
      let trapBonus = 0;
      if (
        newHead.x === 0 ||
        newHead.x === gameState.board.width - 1 ||
        newHead.y === 0 ||
        newHead.y === gameState.board.height - 1
      ) {
        trapBonus += 5;
      }
      score += trapBonus;
  
      // ===== Storm Awareness =====
      // If the game state includes storm details, add a bonus for moves that are inside the storm's safe zone
      // and a penalty for moves outside it. Even if no outcomes are safe, the snake will stick around, choosing
      // the move that maximizes survival until a safe exit appears.
      if (gameState.board.storm && gameState.board.storm.x !== undefined) {
        const stormZone = gameState.board.storm;
        // Function to determine whether a position is inside the storm's safe zone.
        function inStormSafeZone(pos) {
          return pos.x >= stormZone.x && pos.x < stormZone.x + stormZone.width &&
                 pos.y >= stormZone.y && pos.y < stormZone.y + stormZone.height;
        }
        if (inStormSafeZone(newHead)) {
          score += 50; // Bonus for being in the safe zone.
        } else {
          score -= 200; // Penalty for being outside the safe zone.
        }
      }
      // =========================
  
      console.log(
        `MOVE ${gameState.turn}: Move ${move} -> score = ${score} ` +
        `(Food bonus: ${closestFood ? (manhattanDistance(myHead, closestFood) - manhattanDistance(newHead, closestFood)) * FOOD_WEIGHT : 0}, ` +
        `Food Cluster Bonus: ${foodClusterBonus}, Enemy bonus: ${enemyBonus}, Trap bonus: ${trapBonus})`
      );
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  
    console.log(`MOVE ${gameState.turn}: Selected move ${bestMove} with overall score ${bestScore}`);
    return { move: bestMove };
  }
  