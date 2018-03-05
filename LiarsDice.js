const dieTypes = [
    "Ones",
    "Twos",
    "Threes",
    "Fours",
    "Fives",
    "Sixes"
];
window.onload = function() {
    let diceInPlay = 0;
    let allDice = [];
    let gameOutput = document.getElementById("gameOutput");
    function writeMessageToOutput(prefix, message, color) {
        this.prefix = prefix || '> ';
        this.message = message || 'null';
        this.color = color || "#000000";
        gameOutput.innerHTML += "<span style='color: " + this.color + "'>" + (this.prefix + this.message) + "</span><br>";
        gameOutput.scrollTop = gameOutput.scrollHeight;
    }

    function Dice() {
        this.dieColor = "Black";
        this.currentSide = 1;
    }
    Dice.prototype.roll = function () {
        this.currentSide = Math.floor((Math.random() * 6) + 1);
        switch (this.currentSide) {
            case 1:
                this.dieColor = "Tomato";
                break;
            case 2:
                this.dieColor = "Orange";
                break;
            case 3:
                this.dieColor = "DodgerBlue";
                break;
            case 4:
                this.dieColor = "MediumSeaGreen";
                break;
            case 5:
                this.dieColor = "SlateBlue";
                break;
            case 6:
                this.dieColor = "Violet";
                break;
        }
    };

    function Player(playerName, playerColor, isHuman) {
        this.name = playerName;
        this.hand = [];
        this.diceLeft = 5;
        this.isHuman = isHuman;
        this.isInGame = true;
        this.playerColor = playerColor;
    }
    Player.prototype.clearHand = function() {
        this.hand = [];
    };
    Player.prototype.buildHand = function () {
        for (let i = 0; i < this.diceLeft; i++) {
            this.hand.push(new Dice());
            allDice.push(this.hand[i]);
            diceInPlay++;
        }
    };
    Player.prototype.rollHand = function (numShakes) {
        for (let i = 0; i < numShakes; i++) {
            for (let j = 0; j < this.hand.length; j++) {
                this.hand[j].roll();
            }
        }
    };

    function Bid(holder, type, count) {
        this.holder = holder;
        this.type = type || "Ones";
        this.count = count || 1;
    }
    Bid.prototype.parseType = function () {
        switch(this.type) {
            case "Ones":
                return 1;
            case "Twos":
                return 2;
            case "Threes":
                return 3;
            case "Fours":
                return 4;
            case "Fives":
                return 5;
            case "Six":
                return 6;
        }
    };

    let allPlayers = [];
    let currentPlayer = null;
    let previousBid = null;
    let canvas = document.getElementById("diceGame");
    let ctx = canvas.getContext("2d");
    let hideDice = true;
    function setupGame(playerFirst) {
        // Create the players for the game.
        allPlayers.push(
            new Player("You (Human)", "#ffffff", true),
            new Player("Professor Plum", "#9415ff", false),
            new Player("Mrs. Peacock", "#2b4dff", false),
            new Player("Colonel Mustard", "#fff51e", false)
        );
        allPlayers.forEach(function(player) {
            player.buildHand(5);
            player.rollHand(3);
            writeMessageToOutput(player.name, " joined the game.", player.playerColor);
        });
        if(playerFirst)
            for (let i = 0; i < allPlayers.length; i++) {
                if(allPlayers[i].isHuman) {
                    currentPlayer = allPlayers[i];
                }
            }
        else
            currentPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
        writeMessageToOutput(currentPlayer.name, " begins the game.", currentPlayer.playerColor);
        executeTurn();
    }

    function resetGame() {
        allDice = [];
        diceInPlay = 0;
        previousBid = new Bid(null, null, 1);
        hideDice = true;
        updateScene();
        allPlayers.forEach(function(player) {
            player.clearHand();
            player.buildHand();
            player.rollHand(3);
        });
        updateScene();
        checkGame();
        gameOutput.innerHTML = "";
        writeMessageToOutput("GameMaster> ", currentPlayer.name + " starts the next round.", "#ff0a00");
        setTimeout(executeTurn, 8000);
    }

    function updateScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.font = "25px Arial";
        ctx.save();
        for (let i = 0; i < allPlayers.length; i++) {
            let playerHand = allPlayers[i].hand;
            for (let j = 0; j < playerHand.length; j++) {
                if(hideDice) {
                    if(i === 0) {
                        ctx.beginPath();
                        ctx.fillStyle = playerHand[j].dieColor;
                        ctx.rect((j + 1) * 55, (i + 1) * 100, 50, 50);
                        ctx.fill();
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.fillStyle = "#000000";
                        ctx.fillText(playerHand[j].currentSide, ((j + 1) * 55) + 18, ((i + 1) * 100) + 32);
                    } else {
                        ctx.beginPath();
                        ctx.fillStyle = "#a1a1a1";
                        ctx.rect((j + 1) * 55, (i + 1) * 100, 50, 50);
                        ctx.fill();
                        ctx.stroke();
                    }
                } else {
                    ctx.beginPath();
                    ctx.fillStyle = playerHand[j].dieColor;
                    ctx.rect((j + 1) * 55, (i + 1) * 100, 50, 50);
                    ctx.fill();
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.fillStyle = "#000000";
                    ctx.fillText(playerHand[j].currentSide, ((j + 1) * 55) + 18, ((i + 1) * 100) + 32);
                }
            }
            ctx.restore();

            ctx.beginPath();
            ctx.fillStyle = allPlayers[i].playerColor;
            ctx.fillText(allPlayers[i].name, 25, ((i + 1) * 100) - 5);
        }
    }

    let wait = true;
    function executeTurn() {
        updateScene();
        if(currentPlayer !== null) {
            if(currentPlayer.isHuman) {
                // Wait for player to hit "Place Bid" button or "Challenge Bid"
                bidPlaceButton.disabled = false;
                if(previousBid !== null) {
                    if(previousBid.holder !== null) {
                        if(previousBid.holder !== currentPlayer)
                            bidChallengeButton.disabled = false;
                    } else {
                        bidChallengeButton.disabled = true;
                    }
                }
                if(wait) {
                    console.log("Waiting on user...");
                    setTimeout(executeTurn, 500);
                } else {
                    bidPlaceButton.disabled = true;
                    bidChallengeButton.disabled = true;
                    setNextPlayerTurn();
                    checkGame();
                    executeTurn();
                }
            } else {
                window.setTimeout(executeAITurn, 5000);
            }
        } else
            console.log("Current player was null!!!");
    }

    function executeAITurn() {
        // First, we're going to want to see if the AI should challenge the previous bid.
        // This is done by taking the amount of dice left in play and what our current head bid would need to be.
        console.log("Executing AI turn for " + currentPlayer.name);
        // Typically, someone will challenge a bid if the amount is greater than their perceived hand.
        if(previousBid.holder !== null && Math.floor(Math.random() * diceInPlay) % currentPlayer.hand.length === 0) {
            console.log("AI " + currentPlayer.name + " may challenge the previous bid.");
            // With 20 dice in play and the player has 5 dice, there is a 25% chance the AI will challenge the bid. (5, 10, 15, 20)
            // Now, the AI will check if the number bet is equal to the previous bid. If it is, the challenge is forfeited. Otherwise, challenge the bid.
            let dieCount = 0;
            for (let i = 0; i < currentPlayer.hand.length; i++) {
                if(currentPlayer.hand[i].currentSide === previousBid.parseType()) {
                    dieCount++;
                }
            }
            if(dieCount !== previousBid.count && previousBid.holder !== currentPlayer) {
                // Challenge!
                console.log("AI " + currentPlayer.name + " WILL challenge the previous bid.");
                writeMessageToOutput(currentPlayer.name, " has challenged the previous bid placed by " + previousBid.holder.name + "!", currentPlayer.playerColor);
                challengePreviousBid();
            } else {
                console.log("AI " + currentPlayer.name + " decided not to challenge, they will place a bid instead.");
                previousBid = new Bid(
                    currentPlayer,
                    dieTypes[Math.floor(Math.random() * dieTypes.length)],
                    Math.floor(Math.random() * ((+previousBid.count + 1) - +previousBid.count + 1)) + +previousBid.count
                );
                writeMessageToOutput(previousBid.holder.name, " claims there are " + previousBid.count + " " + previousBid.type, currentPlayer.playerColor);
                setNextPlayerTurn();
                checkGame();
                setTimeout(executeTurn, 3000);
            }
        } else {
            // Place a bid greater than the previous count.
            console.log("AI " + currentPlayer.name + " will place a bid.");
            previousBid = new Bid(
                currentPlayer,
                dieTypes[Math.floor(Math.random() * dieTypes.length)],
                Math.floor(Math.random() * ((+previousBid.count + 1) - +previousBid.count + 1)) + +previousBid.count
            );
            writeMessageToOutput(previousBid.holder.name, " claims there are " + previousBid.count + " " + previousBid.type, currentPlayer.playerColor);
            setNextPlayerTurn();
            checkGame();
            setTimeout(executeTurn, 3000);
        }
    }

    function challengePreviousBid() {
        // A bid has been challenged! If the bid is matched or exceeded, the bidder is safe.
        console.log("Executing challenge on bid. Made by " + currentPlayer.name + ".");

        // Reveal all dice.
        hideDice = false;
        updateScene();

        bidPlaceButton.disabled = true;
        bidChallengeButton.disabled = true;

        let dieCount = 0;
        for (let i = 0; i < allDice.length; i++) {
            if(allDice[i].currentSide === previousBid.count) {
                dieCount++;
            }
        }
        if(dieCount >= previousBid.count) {
            console.log("The bidder is safe. The loser is " + currentPlayer.name + ".");
            // Bidder is safe!
            writeMessageToOutput(currentPlayer.name, " challenge has failed! The bidder is safe!", "#4cff00");
            writeMessageToOutput("GameMaster> ", "The game will now reset in five seconds.", "#ff0a00");
            setTimeout(resetGame, 5000);
        } else {
            console.log("The challenger wins. The loser is " + previousBid.holder.name + ". They will start the next round.");
            // Challenger wins!
            writeMessageToOutput(currentPlayer.name, " challenge has succeeded!", "#ff5d00");
            writeMessageToOutput("GameMaster> ", previousBid.holder.name + " will now lose one dice.", "#ff0a00");
            previousBid.holder.diceLeft--;
            currentPlayer = previousBid.holder;
            setTimeout(resetGame, 5000);
        }
    }

    function checkGame() {
        let numPlayersLeft = allPlayers.length;
        for (let i = 0; i < allPlayers.length; i++) {
            if(allPlayers[i].hand.length === 0) {
                let player = allPlayers[i];
                allPlayers.splice(i, 1);
                numPlayersLeft--;
                player.isInGame = false;
                writeMessageToOutput(player.name, " has been eliminated.", player.playerColor);
                updateScene();
            }
        }
        return numPlayersLeft;
    }

    function setNextPlayerTurn() {
        let playerIndex = 0;
        for (let i = 0; i < allPlayers.length; i++) {
            if(currentPlayer === allPlayers[i]) {
                playerIndex = i;
                break;
            }
        }
        if(playerIndex + 1 > allPlayers.length - 1)
            currentPlayer = allPlayers[0];
        else
            currentPlayer = allPlayers[playerIndex + 1];
        if(currentPlayer.isHuman) {
            console.log("Current player has been set to the human. System will now wait for human input.");
            wait = true;
        } else
            console.log("Current player is set to an AI. System will now execute normally.");
        writeMessageToOutput(currentPlayer.name, " will now begin their turn.", currentPlayer.playerColor);
    }

    let startGameButton = document.getElementById("startGame");
    startGameButton.onclick = function () {
        setupGame(true);
        updateScene();
        startGameButton.disabled = true;
    };

    // Bid system components
    let bidPlaceButton = document.getElementById("placeBid");
    let bidCounter = document.getElementById("bidCounter");
    let bidType = document.getElementById("bidType");
    let bidChallengeButton = document.getElementById("challengeBid");
    bidPlaceButton.disabled = true;
    bidChallengeButton.disabled = true;
    bidCounter.onchange = function () {
        if(previousBid === null) {
            if(bidCounter.value <= 0 || bidCounter.value > diceInPlay) {
                bidCounter.value = 1;
                writeMessageToOutput("GameMaster> ", "Number of dice in bid is invalid.", "#ff0a00");
            }
        } else {
            if(+bidCounter.value <= previousBid.count || +bidCounter.value > diceInPlay) {
                bidCounter.value = previousBid.count;
                writeMessageToOutput("GameMaster> ", "Number of dice in bid is invalid.", "#ff0a00");
            }
        }
    };
    bidPlaceButton.onclick = function () {
        previousBid = new Bid(currentPlayer, bidType.value, +bidCounter.value);
        writeMessageToOutput(previousBid.holder.name, " claim there are " + previousBid.count + " " + previousBid.type, currentPlayer.playerColor);
        wait = false;
    };
    bidChallengeButton.onclick = function() {
        if(previousBid !== null) {
            if(previousBid.holder !== currentPlayer)
                challengePreviousBid();
            else
                writeMessageToOutput("GameMaster> ", "Cannot challenge own bid.", "#ff0a00");
        } else
            writeMessageToOutput("GameMaster> ", "Cannot challenge. No previous bid has been made.", "#ff0a00");
    };

    // Debug stuff
    let redrawButton = document.getElementById("redraw");
    redrawButton.onclick = function () {
        updateScene();
    };

}