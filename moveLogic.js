export default function move(gameState){
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };

    let movePriorities = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
    };
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    
    // We've included code to prevent your Battlesnake from moving backwards
    
    if (myNeck.x < myHead.x) {        // Neck is left of head, don't move left
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
        movePriorities.left = -5;
        console.log("Do not move left, out of bounds")
    }

    if (myHead.y == 1){
        movePriorities.down = -5;
        console.log("Do not move down, out of bounds")
    }

    if (myHead.x == boardWidth - 2){
        movePriorities.right = -5;
        console.log("Do not move right, out of bounds")
    }

    if (myHead.y == boardHeight - 2){
        movePriorities.up = -5;
        console.log("Do not move up, out of bounds")
    }


    // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
    // gameState.you contains an object representing your snake, including its coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    const myBody = gameState.you.body;
    for (let i = 1; i < myBody.length - 1; i++){
        
        const avoidSelf = myBody[i];
        if (avoidSelf.x == myHead.x - 1 && avoidSelf.y == myHead.y){
            moveSafety.left = false;
            console.log("Do not move left, self-collision")
        }

        if (avoidSelf.x == myHead.x && avoidSelf.y == myHead.y - 1){
            moveSafety.down = false;
            console.log("Do not move down, self-collision")
        }

        if (avoidSelf.x == myHead.x + 1 && avoidSelf.y == myHead.y){
            moveSafety.right = false;
            console.log("Do not move right, self-collision")
        }

        if (avoidSelf.x == myHead.x && avoidSelf.y == myHead.y + 1){
            moveSafety.up = false;
            console.log("Do not move up, self-collision")
        }
    }
    
    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    
    // Are there any safe moves left?
    
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);
    if (safeMoves.length == 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
        return { move: "down" };
    }
    
    // Choose a random move from the safe moves
    const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board


    
    console.log(`MOVE ${gameState.turn}: ${nextMove}`)
    return { move: nextMove };
}