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


    for (const snake of gameState.board.snakes) {
        const enemyHead = snake.body[0];
        const enemyBody = snake.body;
   
        // positions near the enemy head
        const headAdjacentPositions = [
            { x: enemyHead.x, y: enemyHead.y + 1, direction: "up" },
            { x: enemyHead.x, y: enemyHead.y - 1, direction: "down" },
            { x: enemyHead.x - 1, y: enemyHead.y, direction: "left" },
            { x: enemyHead.x + 1, y: enemyHead.y, direction: "right" }
        ];
   
        for (const pos of headAdjacentPositions) {
            if (pos.x === myHead.x && pos.y === myHead.y) {
                moveSafety[pos.direction] = false;
                console.log(`Avoid ${pos.direction}: ENEMY HEAD nearby`);
            }
        }
   
        // dont go there
        const dangerZonePositions = [
            { x: enemyHead.x, y: enemyHead.y + 2, direction: "up" },
            { x: enemyHead.x, y: enemyHead.y - 2, direction: "down" },
            { x: enemyHead.x - 2, y: enemyHead.y, direction: "left" },
            { x: enemyHead.x + 2, y: enemyHead.y, direction: "right" }
        ];
   
        for (const pos of dangerZonePositions) {
            if (pos.x === myHead.x && pos.y === myHead.y) {
                prioritizeMove[pos.direction] -= 10;
                console.log(`Avoid ${pos.direction}: danger zone near ENEMY HEAD`);
            }
        }
   
        // diagonal positions near the enemy head
        const diagonalPositions = [
            { x: enemyHead.x - 1, y: enemyHead.y - 1, directions: ["down", "left"] },
            { x: enemyHead.x + 1, y: enemyHead.y + 1, directions: ["up", "right"] },
            { x: enemyHead.x - 1, y: enemyHead.y + 1, directions: ["up", "left"] },
            { x: enemyHead.x + 1, y: enemyHead.y - 1, directions: ["down", "right"] }
        ];
   
        for (const pos of diagonalPositions) {
            if (pos.x === myHead.x && pos.y === myHead.y) {
                for (const dir of pos.directions) {
                    prioritizeMove[dir] -= 10;
                }
                console.log(`Avoid diagonal: ${pos.directions.join(" and ")} near ENEMY HEAD`);
            }
        }
   
        // // diagonal positions near enemy body
        for (let i = 1; i < enemyBody.length; i++) {
            const segment = enemyBody[i];
   
            if (segment.x === myHead.x && segment.y === myHead.y + 1) {
                moveSafety.up = false;
                console.log("Avoid up: enemy body collision");
            }
            if (segment.x === myHead.x && segment.y === myHead.y - 1) {
                moveSafety.down = false;
                console.log("Avoid down: enemy body collision");
            }
            if (segment.x === myHead.x - 1 && segment.y === myHead.y) {
                moveSafety.left = false;
                console.log("Avoid left: enemy body collision");
            }
            if (segment.x === myHead.x + 1 && segment.y === myHead.y) {
                moveSafety.right = false;
                console.log("Avoid right: enemy body collision");
            }
        }
    }


   
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board
    if (health < 100 && findFood.length > 0) {
        for (let i = 0; i < findFood.length; i++) {
            const food = findFood[i];
            const distanceUp = food.y - myHead.y;
            const distanceDown = myHead.y - food.y;
            const distanceLeft = myHead.x - food.x;
            const distanceRight = food.x - myHead.x;
           
            if (distanceUp > 0) {
                prioritizeMove.up += 10;
                console.log("Prioritize up: food");        
            }
            if (distanceDown > 0) {
                prioritizeMove.down += 10;
                console.log("Prioritize down: food");
            }
            if (distanceLeft > 0) {
                prioritizeMove.left += 10;
                console.log("Prioritize left: food");
            }
            if (distanceRight > 0) {
                prioritizeMove.right += 10;
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


    // Follow tail when health is above 90
        if (health > 90 || hazards.length > 0) {
            const tail = myBody[myBody.length - 1];
            const tailMoves = [];


        if (tail.x < myHead.x && moveSafety.left) {
            prioritizeMove.left += 10;
            tailMoves.push("left");
        }
        if (tail.x > myHead.x && moveSafety.right) {
            prioritizeMove.right += 10;
            tailMoves.push("right");
        }
        if (tail.y < myHead.y && moveSafety.down) {
            prioritizeMove.down += 10;
            tailMoves.push("down");
        }
        if (tail.y > myHead.y && moveSafety.up) {
            prioritizeMove.up += 10;
            tailMoves.push("up");
        }
        //if detect
        if (tailMoves.length > 0) {
            const nextMove = tailMoves[Math.floor(Math.random() * tailMoves.length)];
            console.log(`MOVE ${gameState.turn}: Following tail with move ${nextMove}`);
            return { move: nextMove };
        }


        //avoid dead ends
        const safeTailMoves = tailMoves.filter(move => {
            const position = {
                left: { x: myHead.x - 1, y: myHead.y },
                right: { x: myHead.x + 1, y: myHead.y },
                down: { x: myHead.x, y: myHead.y - 1 },
                up: { x: myHead.x, y: myHead.y + 1 }
            }[move];
            const openSpaces = findOpenSpaces(position, myBody, gameState.board, hazards);
            return openSpaces > 2;
        });
   
        // follow tail if safe moves exist
        if (safeTailMoves.length > 0) {
            const nextMove = safeTailMoves[Math.floor(Math.random() * safeTailMoves.length)];
            console.log(`MOVE ${gameState.turn}: Following tail with move ${nextMove}`);
            return { move: nextMove };
        }
    }
   
    // count open spaces
    function findOpenSpaces(start, snakeBody, board, hazards) {
        const visited = new Set();
        const stack = [start];
        let openSpaces = 0;
   
        while (stack.length > 0) {
            const current = stack.pop();
            const key = `${current.x},${current.y}`;
   
            if (visited.has(key)) continue;
            visited.add(key);
   
            // Check boundaries and obstacles
            if (
                current.x < 0 || current.x >= board.width ||
                current.y < 0 || current.y >= board.height ||
                snakeBody.some(segment => segment.x === current.x && segment.y === current.y) ||
                hazards.some(hazard => hazard.x === current.x && hazard.y === current.y) ||
                board.snakes.flatMap(snake => snake.body).some(segment => segment.x === current.x && segment.y === current.y)
            ) {
                continue;
            }
   
            openSpaces++;
            stack.push(
                { x: current.x, y: current.y + 1 }, // up
                { x: current.x, y: current.y - 1 }, // down
                { x: current.x - 1, y: current.y }, // left
                { x: current.x + 1, y: current.y }  // right
            );
        }
   
        return openSpaces;
    }
   


    // Are there any safe moves left?
   
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);
    if (safeMoves.length === 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
        return { move: "down" };
    }


    const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    console.log(`MOVE ${gameState.turn}: Random safe move ${nextMove}`);
    return { move: nextMove };
}



