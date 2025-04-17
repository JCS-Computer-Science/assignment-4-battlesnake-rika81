export default function move(gameState){
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };

    let prioritizeMove = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
    };
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    const findFood = gameState.board.food;
    const health = gameState.you.health;
    const hazards = gameState.board.hazards;

    
    // We've included code to prevent your Battlesnake from moving backwards
    
    if (myNeck.x < myHead.x) {  // Neck is left of head, don't move left
        moveSafety.left = false;
        
    } else if (myNeck.x > myHead.x) { // Neck is right of head, don't move right
        moveSafety.right = false;
        
    } else if (myNeck.y < myHead.y) { // Neck is below head, don't move down
        moveSafety.down = false;
        
    } else if (myNeck.y > myHead.y) { // Neck is above head, don't move up
        moveSafety.up = false;
    }
    
    // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
    // gameState.board contains an object representing the game board including its width and height
    // https://docs.battlesnake.com/api/objects/board
    if (myHead.x == 0){ 
        moveSafety.left = false;
        console.log("Do not move left, out of bounds")
    }

    if (myHead.y == 0){
        moveSafety.down = false;
        console.log("Do not move down, out of bounds")
    }

    if (myHead.x == gameState.board.width - 1){
        moveSafety.right = false;
        console.log("Do not move right, out of bounds")
    }

    if (myHead.y == gameState.board.height - 1){
        moveSafety.up = false;
        console.log("Do not move up, out of bounds")
    }
    //avoid bounds I created if necessary

    if (myHead.x == 1){
        prioritizeMove.left = -5;
        console.log("Do not moooove left, out of bounds")
    }

    if (myHead.y == 1){
        prioritizeMove.down = -5;
        console.log("Do not moooove down, out of bounds")
    }

    if (myHead.x == boardWidth - 2){
        prioritizeMove.right = -5;
        console.log("Do not moooove right, out of bounds")
    }

    if (myHead.y == boardHeight - 2){
        prioritizeMove.up = -5;
        console.log("Do not moooove up, out of bounds")
    }


    // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
    // gameState.you contains an object representing your snake, including its coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    const myBody = gameState.you.body;
    for (let i = 1; i < myBody.length - 1; i++){
        
        const avoid = myBody[i];
        if (avoid.x == myHead.x - 1 && avoid.y == myHead.y){
            moveSafety.left = false;
            console.log("Do not move left, self-collision")
        }

        if (avoid.x == myHead.x && avoid.y == myHead.y - 1){
            moveSafety.down = false;
            console.log("Do not move down, self-collision")
        }

        if (avoid.x == myHead.x + 1 && avoid.y == myHead.y){
            moveSafety.right = false;
            console.log("Do not move right, self-collision")
        }

        if (avoid.x == myHead.x && avoid.y == myHead.y + 1){
            moveSafety.up = false;
            console.log("Do not move up, self-collision")
        }
    }
    
    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake

    for (let i = 0; i < gameState.board.snakes.length; i++) {
        const snake = gameState.board.snakes[i];
        const enemyHead = snake.body[0];
        const enemyBody = snake.body

        //Dont collide with heads
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y + 1){
            moveSafety.up = false;
            console.log("Dont go up, ENEMY HEAD");  
        }
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y - 1){
            moveSafety.down = false;
            console.log("Dont go down, ENEMY HEAD");
        }
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y){
            moveSafety.left = false;  
            console.log("Dont go left, ENEMY HEAD");          
        }
        if (enemyHead.x == myHead.x + 1 && enemyHead.y === myHead.y){
            moveSafety.right = false;  
            console.log("Dont go right, ENEMY HEAD");          
        }
        //Avoid other spots
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y + 2){
            prioritizeMove.up = -10;
            console.log("Avoid up, ENEMY HEAD");
        }
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y - 2){
            prioritizeMove.down = -10;
            console.log("Avoid down, ENEMY HEAD");                
        }
        if (enemyHead.x == myHead.x - 2 && enemyHead.y === myHead.y){
            prioritizeMove.left = -10;
            console.log("Avoid left, ENEMY HEAD");
        }
        if (enemyHead.x == myHead.x + 2 && enemyHead.y === myHead.y){
            prioritizeMove.right = -10;
            console.log("Avoid right, ENEMY HEAD");
        }
        //Avoid diagonal spots
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y - 1){
            prioritizeMove.down = -10;
            prioritizeMove.left = -10;
            prioritizeMove.up += 5;
            prioritizeMove.right += 5;
            console.log("Avoid down and left, ENEMY HEAD");            
        }
        if (enemyHead.x == myHead.x + 1 && enemyHead.y === myHead.y + 1 ){
            prioritizeMove.right = -10;
            prioritizeMove.up = -10;
            prioritizeMove.down += 5;
            prioritizeMove.left += 5;
            console.log("Avoid right and up, ENEMY HEAD");            
        }
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y + 1){
            prioritizeMove.up = -10;
            prioritizeMove.left = -10;
            prioritizeMove.down += 5;
            prioritizeMove.right += 5;
            console.log("Avoid up and left, ENEMY HEAD");            
        }
        if (enemyHead.x == myHead.x + 1  && enemyHead.y === myHead.y - 1){
            prioritizeMove.down = -10;
            prioritizeMove.right= -10;
            prioritizeMove.up += 5;
            prioritizeMove.left += 5;
            console.log("Avoid down and right, ENEMY HEAD");            
        }


        //Dont collide with other bodies
        for (let i = 1; i < (enemyBody.length - 1); i++) {
  
            const avoidOthers = snake.body[i];
            if (avoidOthers.x == myHead.x && avoidOthers.y === myHead.y + 1){
                moveSafety.up = false;
                console.log("Dont go up, enemy collision");              
            }
            if (avoidOthers.x == myHead.x && avoidOthers.y === myHead.y - 1){
                moveSafety.down = false;
                console.log("Dont go down, enemy collision");
            }
            if (avoidOthers.x == myHead.x - 1 && avoidOthers.y === myHead.y){
                moveSafety.left = false;
                console.log("Dont go left, enemy collision");
            }
            if (avoidOthers.x == myHead.x + 1 && avoidOthers.y === myHead.y){
                moveSafety.right = false;  
                console.log("Dont go right, enemy collision");              
            }
        }
    }

    
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board
    if (health < 50 && findFood.length > 0) {
        for (let i = 0; i < findFood.length; i++) {
            const food = findFood[i];
            const distanceUp = food.y - myHead.y;
            const distanceDown = myHead.y - food.y;
            const distanceLeft = myHead.x - food.xv;
            const distanceRight = food.x - myHead.x;
            
            if (distanceUp > 0) {
                prioritizeMove.up += 7;
                console.log("Prioritize up: food");        
            }
            if (distanceDown > 0) {
                prioritizeMove.down += 7;
                console.log("Prioritize down: food");
            }
            if (distanceLeft > 0) {
                prioritizeMove.left += 7;
                console.log("Prioritize left: food");
            }
            if (distanceRight > 0) {
                prioritizeMove.right += 7;
                console.log("Prioritize right: food");
            }
        }
    }


    //Avoids hazards
    for (let i = 0; i < hazards.length; i++) {
        let hazard = hazards[i];
        if (hazard.x === myHead.x && hazard.y === myHead.y + 1) {
            prioritizeMove.up -= 10;
            console.log("Avoid up: hazard");
        }
        if (hazard.x === myHead.x && hazard.y === myHead.y - 1) {
            prioritizeMove.down -= 10;
            console.log("Avoid down: hazard");
        }
        if (hazard.x === myHead.x - 1 && hazard.y === myHead.y) {
            prioritizeMove.left -= 10;
            console.log("Avoid left: hazard");
        }
        if (hazard.x === myHead.x + 1 && hazard.y === myHead.y) {
            prioritizeMove.right -= 10;
            console.log("Avoid right: hazard");
        }
    }

    // Are there any safe moves left?
    
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);

    if (safeMoves.length > 0) {
        // Choose a random safe move
        const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
        console.log(`MOVE ${gameState.turn}: ${nextMove}`);
        return { move: nextMove };
    }

    // If no other safe moves, follow tail
    const queue = [[myHead]];
    const visited = new Set();
    visited.add(`${myHead.x},${myHead.y}`);

    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];

        // If we are near the tail, follow the path
        if (current.x === myTail.x && current.y === myTail.y) {
            const nextStep = path[1]; // Second step in the path is the move
            if (nextStep.x > myHead.x) return { move: "right" };
            if (nextStep.x < myHead.x) return { move: "left" };
            if (nextStep.y > myHead.y) return { move: "up" };
            if (nextStep.y < myHead.y) return { move: "down" };
        }

        const directions = ["up", "down", "left", "right"];
        for (const direction of directions) {
            const nextPosition = {
                x: current.x + (direction === "right" ? 1 : direction === "left" ? -1 : 0),
                y: current.y + (direction === "up" ? 1 : direction === "down" ? -1 : 0)
            };

            const key = `${nextPosition.x},${nextPosition.y}`;
            if (!visited.has(key) &&
                nextPosition.x >= 0 && nextPosition.x < boardWidth &&
                nextPosition.y >= 0 && nextPosition.y < boardHeight &&
                !allBodies.some(segment => segment.x === nextPosition.x && segment.y === nextPosition.y)) {
                visited.add(key);
                queue.push([...path, nextPosition]);
            }
        }
    }

    // If no path to your tail exists, don't do the move
    console.log(`MOVE ${gameState.turn}: No safe moves or path to tail! Moving down.`);
    return { move: "down" };
}