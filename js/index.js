// Player attributes
let player = {
    level: 1,
    day: 1,
    money: 100,
    intellect: 10,
    charm: 10,
    coding: 10,
    endurance: 10,
    energy: 100,
    energy_penalty: 0,
    has_job: false,
    items: [],
    getStatus() {
        return `Day: ${this.day} | Energy: ${this.energy} | Money: $${this.money} | Charm: ${this.charm}`;
    },
    updateAttributes(attrChanges) {
        for (let attr in attrChanges) {
            this[attr] += attrChanges[attr];
            if (attr === 'energy' || attr === 'money') {
                this[attr] = Math.max(0, this[attr]); // Ensure values don't go below 0
            }
        }

        if (this.day > 30) {
            this.endGame();
        }
    },
    applyPenaltyAndSleep() {
        let effectivePenalty = Math.min(this.energy_penalty, 75);  // Ensure penalty doesn't exceed 75
        this.energy = 100 - effectivePenalty;
        this.day += 1;
    },
    hasSufficientEnergy(requiredEnergy) {
        return this.energy >= requiredEnergy;
    },
    hasEnoughMoney(requiredMoney) {
        return this.money >= requiredMoney;
    },
    endGame() {
        // Logic for ending the game
        // For now, we'll simply reload the game, but you can transition to a dedicated "Game Over" scene.
        location.reload();
    }
};

class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);
    }

    createMessage() {
        // Create the message text off-screen
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.height + 50, '', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            }
        }).setOrigin(0.5, 1);
    }

    showMessage(message) {
        this.messageText.setText(message);
        this.tweens.add({
            targets: this.messageText,
            y: this.cameras.main.height - 10,
            duration: 200,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: this.messageText,
                        y: this.cameras.main.height + 50,
                        duration: 200,
                        ease: 'Sine.easeIn'
                    });
                });
            }
        });
    }
}


class MainScene extends BaseScene {
    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Blue background for home
        this.cameras.main.setBackgroundColor('#353A47');
    
        // Button to sleep
        let sleepButton = this.add.text(100, 100, 'Sleep', { fill: '#fff' }).setInteractive();
        sleepButton.on('pointerdown', this.sleep.bind(this)); // Bind 'this' context to the sleep function
    
        // Button to go to work
        let workButton = this.add.text(250, 100, 'Go to Work', { fill: '#fff' }).setInteractive();
        workButton.on('pointerdown', () => this.scene.start('WorkScene'));
    
        // Button to go to school
        let schoolButton = this.add.text(400, 100, 'Go to School', { fill: '#fff' }).setInteractive();
        schoolButton.on('pointerdown', () => this.scene.start('SchoolScene'));

        // Button to go to bar
        let barButton = this.add.text(550, 100, 'Go to the Bar', { fill: '#fff' }).setInteractive();
        barButton.on('pointerdown', () => this.scene.start('BarScene'));

        // Button to go to cafe
        let cafeButton = this.add.text(100, 200, 'Go to the Cafe', { fill: '#fff' }).setInteractive();
        cafeButton.on('pointerdown', () => this.scene.start('CafeScene'));
    
        this.statusDisplay = this.add.text(10, 10, player.getStatus(), { fill: '#fff', fontSize: '20px' });
        this.fullscreenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        
        // prepare message from baseScene
        this.createMessage();
    }    

    update() {
        // Update the player's status display
        this.statusDisplay.text = player.getStatus();
    
        // Check for fullscreen toggle
        if (Phaser.Input.Keyboard.JustDown(this.fullscreenKey)) {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        }
    }    

    sleep() {
        if (player.energy !== 100) {
            player.applyPenaltyAndSleep();
        } else {
            // use message from BaseScene
            this.showMessage("No need to sleep. You're already 100%");
        }
    }
}

class WorkScene extends BaseScene {
    constructor() {
        super({ key: 'WorkScene' });
    }

    create() {
        // Green background for work
        this.cameras.main.setBackgroundColor('#016FB9');
    
        // Button to start working
        let workActionBtn = this.add.text(100, 100, 'Work', { fill: '#fff' }).setInteractive();
    
        // Attach the event with a bound context
        workActionBtn.on('pointerdown', this.workAction.bind(this));
    
        // Button to return home
        let homeButton = this.add.text(100, 150, 'Go Home', { fill: '#fff' }).setInteractive();
        homeButton.on('pointerdown', () => this.scene.start('MainScene'));
    
        // Status Display for player's attributes
        this.statusDisplay = this.add.text(10, 10, player.getStatus(), { fill: '#fff', fontSize: '20px' });
        // prepare message from baseScene
        this.createMessage();
    }

    update() {
        this.statusDisplay.text = player.getStatus();
    }
    
    workAction() {
        if (player.hasSufficientEnergy(20)) {
            player.updateAttributes({
                money: 50,
                energy: -20
            });
        } else {
            // use message from baseScene
            this.showMessage("Not enough energy to work!");
        }
    }
    
}

class SchoolScene extends BaseScene {
    constructor() {
        super({ key: 'SchoolScene' });
    }

    create() {
        // Orange background for school
        this.cameras.main.setBackgroundColor('#93BEDF');
    
        // Button to study
        let studyButton = this.add.text(100, 100, 'Study', { fill: '#fff' }).setInteractive();
    
        // Bind 'this' to the studyAction method when setting up the event handler
        studyButton.on('pointerdown', this.studyAction.bind(this));
    
        // Button to return home
        let homeButton = this.add.text(100, 150, 'Go Home', { fill: '#fff' }).setInteractive();
        homeButton.on('pointerdown', () => this.scene.start('MainScene'));
    
        // Status Display for player's attributes
        this.statusDisplay = this.add.text(10, 10, player.getStatus(), { fill: '#fff', fontSize: '20px' });
    
        this.createMessage();
    }    

    update() {
        this.statusDisplay.text = player.getStatus();
    }

    studyAction() {
        if (player.hasSufficientEnergy(25)) {
            player.updateAttributes({
                intellect: 5,
                coding: 5,
                energy: -25
            });
        } else {
            this.showMessage("Not enough energy to study!");
        }
    }
}

class BarScene extends BaseScene {
    constructor() {
        super({ key: 'BarScene' });
    }

    create() {
        // Orange background for school
        this.cameras.main.setBackgroundColor('#016FB9');
    
        // Button to study
        let drinkButton = this.add.text(100, 100, 'Drink', { fill: '#fff' }).setInteractive();
    
        // Bind 'this' to the studyAction method when setting up the event handler
        drinkButton.on('pointerdown', this.drinkAction.bind(this));
    
        // Button to return home
        let homeButton = this.add.text(100, 150, 'Go Home', { fill: '#fff' }).setInteractive();
        homeButton.on('pointerdown', () => this.scene.start('MainScene'));
    
        // Status Display for player's attributes
        this.statusDisplay = this.add.text(10, 10, player.getStatus(), { fill: '#fff', fontSize: '20px' });
    
        this.createMessage();
    }    

    update() {
        this.statusDisplay.text = player.getStatus();
    }

    drinkAction() {
        if (player.hasSufficientEnergy(25) && player.hasEnoughMoney(10)) {
            player.updateAttributes({
                charm: 5,
                money: -10,
                energy: -25,
            });
        } 
        if (!player.hasSufficientEnergy(25)) {
            this.showMessage("Not enough energy to drink!");
        } else if (!player.hasEnoughMoney(10)) {
            this.showMessage("Not enough money to drink!")
        }
    }
}

class CafeScene extends BaseScene {
    constructor() {
        super({ key: 'CafeScene' });
    }

    create() {
        // Orange background for school
        this.cameras.main.setBackgroundColor('#016FB9');
    
        // Button to study
        let converseButton = this.add.text(100, 100, 'Converse', { fill: '#fff' }).setInteractive();
    
        // Bind 'this' to the studyAction method when setting up the event handler
        converseButton.on('pointerdown', this.converseAction.bind(this));
    
        // Button to return home
        let homeButton = this.add.text(100, 150, 'Go Home', { fill: '#fff' }).setInteractive();
        homeButton.on('pointerdown', () => this.scene.start('MainScene'));
    
        // Status Display for player's attributes
        this.statusDisplay = this.add.text(10, 10, player.getStatus(), { fill: '#fff', fontSize: '20px' });
    
        this.createMessage();
    }    

    update() {
        this.statusDisplay.text = player.getStatus();
    }

    converseAction() {
        if (player.hasSufficientEnergy(25)) {
            player.updateAttributes({
                intellect: 5,
                energy: -25,
            });
        } else {
            this.showMessage("Not enough energy to converse!")
        }
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800, // initial width
    height: 600, // initial height
    scene: [MainScene, WorkScene, SchoolScene, BarScene, CafeScene], // other configurations
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Instantiate the game
let game = new Phaser.Game(config);

