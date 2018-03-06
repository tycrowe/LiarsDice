window.onload = function() {
    /*  Game Controls
    *       startGameButton     - self explanatory
    *       placeBidButton      - uses the inputs id[bidCounter and bidType] to get the human's bid.
    *       challengeBidButton  - challenges the previous bid made by the last player.
    * */
    let startGameButton = document.getElementById("startGame");
    let placeBidButton = document.getElementById("placeBid");
    let challengeBidButton = document.getElementById("challengeBid");
    let nextTurnButton = document.getElementById("nextTurn");
    let nextRoundButton = document.getElementById("nextRound");
    placeBidButton.disabled = true;
    challengeBidButton.disabled = true;
    nextTurnButton.disabled = true;
    nextRoundButton.disabled = true;

    // Inputs
    let inputBidSize = document.getElementById("bidCounter");
    let inputBidType = document.getElementById("bidType");

    // Collections
    let allPlayers = [];                // Holds all the players in the game.
    const dieTypes = [
        "Ones",
        "Twos",
        "Threes",
        "Fours",
        "Fives",
        "Sixes"
    ];
    const randomPlayers = [
        new Player("Professor Plum", "#511587"),
        new Player("Colonel Mustard", "#fff51e"),
        new Player("Dante", "#be3f00"),
        new Player("Mrs. White", "#c0c0c0"),
        new Player("Dr. Lollipop", "#4ffff3"),
        new Player("Butler Smith", "#ff7f19"),
        new Player("Tim Stevens", "#6091ff"),
        new Player("Roger Blank", "#90ff3f"),
        new Player("Victoria Gates", "#50ffdb"),
        new Player("Hansel Olsen", "#ff3fb6"),
        new Player("Xavier Island", "#5687ff"),
        new Player("Miss Scarlet", "#ff007e"),
        new Player("Arthur Blast", "#ffa275"),
        new Player("Quail Tail", "#e6ff00"),
        new Player("Michael Poppins", "#973fff"),
        new Player("Clyde Withers", "#606060"),
        new Player("Mr. ???", "#570300"),
        new Player("Agent O", "#00ffab"),
        new Player("Loyd Evans", "#ff4600"),
        new Player("Ms. Apple", "#ff0600"),
        new Player("Amy Pith", "#ff0043")
    ];

    // Game console and associated methods.
    let gameConsole = document.getElementById("gameOutput");

    // Canvas objects
    let canvas = document.getElementById("diceGame");       // The canvas to draw on.
    let ctx = canvas.getContext("2d");                      // The context of the canvas to use.

    // Booleans
    let hideDiceFromHuman = true;                           // Sets if the dice are being hidden from the player or not.
    let gameOngoing = false;                                // Game active.
    let waiting = false;

    // Game objects
    let curPlayer = null;
    let previousBid = null;
    let numOfDiceInPlay = 0;

    /* Helper methods */
    function shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /**
     * Writes to the "console" on the web page.
     * @param prefix    The prefix of the message, usually the name of the sender.
     * @param message   The message to be sent to the console.
     * @param color     The color of the message.
     */
    function writeConsole(prefix, message, color) {
        this.prefix = prefix || '> ';
        this.message = message || 'null';
        this.color = color || "#000000";
        gameConsole.innerHTML += "<span style='color: " + this.color + "'>" + (this.prefix + this.message) + "</span><br>";
        gameConsole.scrollTop = gameConsole.scrollHeight;
    }

    /**
     * Clears the "console" by setting the inner html to an empty string.
     */
    function clearConsole() {
        gameConsole.innerHTML = "";
    }

    /**
     * Dice object, used for holding the color for drawing and the side it's currently on.
     * @constructor
     */
    function Dice() {
        this.dieColor = "Black";
        this.currentSide = 1;
    }

    /**
     * Roll function, sets the current side to a random number between one and six
     */
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

    /**
     * Creates a player object, used for the majority of the game.
     * @param playerName        The name of the player attached to this object.
     * @param playerColor       The color of the player - appears this color on canvas.
     * @param isHuman           Details if the player is human or not.
     * @constructor
     *      The name of the player.             Default = null;
     *      The player's color.                 Default = "#FFFFFF";
     *      If the player is human or not.      Default = false;
     */
    function Player(playerName, playerColor, isHuman) {
        this.name = playerName || null;
        this.isHuman = isHuman || false;
        this.playerColor = playerColor || "#FFFFFF";
        this.hand = [];
        this.diceLeft = 5;
        this.isInGame = true;
    }

    /**
     * Clears the hand of the player, empties the dice.
     */
    Player.prototype.clearHand = function() {
        this.hand = [];
    };
    /**
     * Builds a hand based on how many dice are left for the player.
     * Also adds the created dice to the allDice array in the collections.
     */
    Player.prototype.buildHand = function () {
        this.clearHand();
        for (let i = 0; i < this.diceLeft; i++) {
            this.hand.push(new Dice());
            numOfDiceInPlay++;
        }
    };
    /**
     * Rolls all dice in the hand based on the amount of shakes requested by the input.
     * Updates the value in the allDice field.
     * @param numShakes         The number of "shakes" the player will perform to achieve the dice output.
     */
    Player.prototype.rollHand = function (numShakes) {
        this.numShakes = numShakes || 3;
        for (let i = 0; i < this.numShakes; i++) {
            for (let j = 0; j < this.hand.length; j++) {
                this.hand[j].roll();
            }
        }
    };

    /**
     * The previous bid made by the last player to go, if they choose to make a bid.
     * @param holder            The bid's holder
     * @param type              The bid's type, can be ones, twos, threes, fours, fives or sixes.
     * @param count             The size of the bid.
     * @constructor
     *      The player object as the holder.
     *      The bid type as a string.
     *      The size of the bid.
     */
    function Bid(holder, type, count) {
        this.holder = holder;
        this.type = type || "Ones";
        this.count = count || 1;
    }

    /**
     * Converts the word type into the number representation.
     * @returns {number}
     */
    function parseType(word) {
        switch(word) {
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
            case "Sixes":
                return 6;
        }
    }

    /*
        BEGIN FORM INPUT
     */
    startGameButton.onclick = function() {
        startGame(false, 4);
        startGameButton.disabled = true;
    };
    placeBidButton.onclick = function () {
        if(validateBidCountInput()) {
            placeBid();
        }
    };
    challengeBidButton.onclick = function () {
        challengePreviousBid();
    };
    nextTurnButton.onclick = function() {
        doAITurn();
    };
    nextRoundButton.onclick = function () {
        newRound();
    };

    // Event catchers
    inputBidSize.onchange = function() {
        validateBidCountInput()
    };

    function validateBidCountInput() {
        if(previousBid === null) {
            let count = +inputBidSize.value;
            if(count <= 0 || count > +numOfDiceInPlay) {
                if(count <= 0) {
                    writeConsole("Game-Director > ", "Number of dice must be greater than zero.", "#ff0a00");
                    inputBidSize.value = 1;
                    return false;
                }
                else if(count > +numOfDiceInPlay) {
                    writeConsole("Game-Director > ", "Number of dice cannot be greater than the number of dice in play.", "#ff0a00");
                    inputBidSize.value = numOfDiceInPlay;
                    return false;
                }
            }
            return true;
        } else {
            let count = +inputBidSize.value;
            if(count < previousBid.count || count > +numOfDiceInPlay) {
                if(count < previousBid.count) {
                    writeConsole("Game-Director > ", "Number of dice must be equal to or greater than the previous bid's count.", "#ff0a00");
                    inputBidSize.value = previousBid.count;
                    return false;
                }
                else if(count > +numOfDiceInPlay) {
                    writeConsole("Game-Director > ", "Number of dice cannot be greater than the number of dice in play.", "#ff0a00");
                    inputBidSize.value = numOfDiceInPlay;
                    return false;
                }
            }
            return true;
        }
    }

    /**
     * Builds and starts the game. Adds the players, builds the hands, and starts the game.
     * @param randomOrder       Jumble the allPlayers collection and then draw.
     * @param maxPlayerCount    The maximum amount of players for this game. Min = 2, Max = 4. Default = 4;
     */
    function startGame(randomOrder, maxPlayerCount) {
        if(maxPlayerCount > 0 && maxPlayerCount <= 4)
            this.maxPlayerCount = maxPlayerCount;
        else
            this.maxPlayerCount = 4;
        allPlayers.push(new Player("You", "#ffffff", true));
        this.maxPlayerCount -= 1;
        for (let i = 0; i < this.maxPlayerCount; i++) {
            // Guarantee uniqueness.
            let selectedPlayer = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
            while(allPlayers.indexOf(selectedPlayer) !== -1) {
                selectedPlayer = randomPlayers[Math.floor(Math.random() * randomPlayers.length)]
            }
            allPlayers.push(randomPlayers[Math.floor(Math.random() * randomPlayers.length)]);
        }
        if(randomOrder && this.maxPlayerCount > 2) shuffle(allPlayers);
        gameOngoing = true;
        curPlayer = allPlayers[0];
        newRound();
    }

    /**
     * Starts a new round, rolls the entire hand of all players.
     */
    function newRound() {
        hideDiceFromHuman = true;
        drawGame();
        for (let i = 0; i < allPlayers.length; i++) {
            allPlayers[i].buildHand();
            allPlayers[i].rollHand();
        }
        drawGame();
        nextRoundButton.disabled = true;
        clearConsole();
        if(curPlayer !== null) {
            if(!curPlayer.isHuman) {
                nextTurnButton.disabled = false;
            } else {
                placeBidButton.disabled = false;
                challengeBidButton.disabled = previousBid === null;
                nextTurnButton.disabled = true;
            }
        }
    }

    /**
     * Places a bid based on if the current player is AI or human.
     */
    function placeBid() {
        if(curPlayer.isHuman) {
            // Current player is human, use the html5 forms as input
            previousBid = new Bid(
                curPlayer,
                inputBidType.value,
                +inputBidSize.value
            );
            waiting = false;
            writeConsole(previousBid.holder.name, " claims there are " + previousBid.count + " " + previousBid.type, curPlayer.playerColor);
            nextTurn();
        } else {
            // Current player is AI, use randoms!
            if(previousBid !== null) {
                previousBid = new Bid(
                    curPlayer,
                    dieTypes[Math.floor(Math.random() * dieTypes.length)],
                    Math.floor(Math.random() * ((+previousBid.count + 1) - +previousBid.count + 1)) + +previousBid.count
                );
            } else {
                let selectedType = dieTypes[Math.floor(Math.random() * dieTypes.length)];
                let count = 0;
                for (let i = 0; i < curPlayer.hand.length; i++) {
                    if(curPlayer.hand[i].currentSide === parseType(selectedType)) {
                        count++;
                    }
                }
                previousBid = new Bid(
                    curPlayer,
                    selectedType,
                    Math.floor(Math.random() * ((count + 3) - count)) + count
                );
            }
            writeConsole(previousBid.holder.name, " claims there are " + previousBid.count + " " + previousBid.type, curPlayer.playerColor);
            nextTurn();
        }
    }

    /**
     * Challenges the previous bid.
     * @returns {boolean}
     */
    function challengePreviousBid() {
        if(previousBid !== null) {
            placeBidButton.disabled = true;
            challengeBidButton.disabled = true;
            // A bid has been challenged.
            if(curPlayer.isHuman)
                writeConsole(curPlayer.name, " have challenged the previous bid made by " + previousBid.holder.name + "!", curPlayer.playerColor);
            else
                writeConsole(curPlayer.name, " has challenged the previous bid made by " + previousBid.holder.name + "!", curPlayer.playerColor);
            hideDiceFromHuman = false;
            drawGame();
            let diceCount = 0;
            for (let i = 0; i < allPlayers.length; i++) {
                for (let j = 0; j < allPlayers[i].hand.length; j++) {
                    if(parseType(previousBid.type) === allPlayers[i].hand[j].currentSide) {
                        diceCount++;
                    }
                }
            }
            console.log(diceCount);
            if(diceCount >= previousBid.count) {
                // Bidder wins, challenger loses.
                writeConsole(curPlayer.name, "'s challenge has failed! The bidder is safe!", "#ff0001");
            } else {
                // Challenger wins, bidder loses
                writeConsole(curPlayer.name, "'s challenge has succeeded! " + previousBid.holder.name + " will now lose one dice!", "#00ff05");
                previousBid.holder.diceLeft--;
                curPlayer = previousBid.holder;
            }
            checkGame();
            previousBid = null;
            nextTurnButton.disabled = true;
            nextRoundButton.disabled = false;
        } else {
            console.log("Previous bid was null. Cannot challenge a null bid.");
            return false;
        }
    }

    function doAITurn() {
        // First, we're going to want to see if the AI should challenge the previous bid.
        // This is done by taking the amount of dice left in play and what our current head bid would need to be.
        // Typically, someone will challenge a bid if the amount is greater than their perceived hand.
        if(previousBid !== null) {
            if (previousBid.holder !== null && Math.floor(Math.random() * numOfDiceInPlay) % curPlayer.hand.length === 0) {
                // With 20 dice in play and the player has 5 dice, there is a 25% chance the AI will challenge the bid. (5, 10, 15, 20)
                // Now, the AI will check if the number bet is equal to the previous bid. If it is, the challenge is forfeited. Otherwise, challenge the bid.
                let dieCount = 0;
                for (let i = 0; i < curPlayer.hand.length; i++) {
                    if (curPlayer.hand[i].currentSide === parseType(previousBid.type)) {
                        dieCount++;
                    }
                }
                if (dieCount !== previousBid.count && previousBid.holder !== curPlayer) {
                    // Challenge!
                    challengePreviousBid();
                } else {
                    placeBid();
                }
            } else {
                placeBid();
            }
        } else {
            placeBid();
        }
    }

    /**
     * Advances the turn to the next player. Controlled by the player for playability.
     */
    function nextTurn() {
        let playerIndex = allPlayers.indexOf(curPlayer);
        if(playerIndex + 1 > allPlayers.length - 1)
            curPlayer = allPlayers[0];
        else
            curPlayer = allPlayers[playerIndex + 1];
        if(curPlayer.isHuman) {
            placeBidButton.disabled = false;
            challengeBidButton.disabled = previousBid === null;
            nextTurnButton.disabled = true;
        } else {
            placeBidButton.disabled = true;
            challengeBidButton.disabled = true;
            nextTurnButton.disabled = false;
        }
        checkGame();
    }

    /**
     * Checks the current status of the game and returns the amount of people left.
     * @returns {number}
     */
    function checkGame() {
        let numPlayersLeft = allPlayers.length;
        for (let i = 0; i < allPlayers.length; i++) {
            if(allPlayers[i].hand.length === 0) {
                let player = allPlayers[i];
                allPlayers.splice(i, 1);
                numPlayersLeft--;
                player.isInGame = false;
                drawGame();
                if(previousBid.holder === player)
                    previousBid = null;
                writeConsole(player.name, " has been eliminated.", player.playerColor);
            }
        }
        if(numPlayersLeft === 1) {
            writeConsole(allPlayers[0].name, " has one the game!", "#fcff1b")
        }
        return numPlayersLeft;
    }

    /**
     * Draws the game to the canvas.
     * @PreCondition: allPlayers array cannot be empty.
     */
    function drawGame() {
        if(allPlayers.length > 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 1;
            ctx.font = "25px Arial";
            ctx.save();
            for (let i = 0; i < allPlayers.length; i++) {
                let playerHand = allPlayers[i].hand;
                for (let j = 0; j < playerHand.length; j++) {
                    if(hideDiceFromHuman) {
                        if(allPlayers[i].isHuman) {
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
    }
};