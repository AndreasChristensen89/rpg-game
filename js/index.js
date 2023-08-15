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

    create() {
        this.statusDisplay = this.add.text(10, 10, player.getStatus(), {
            fill: '#000', // Black text
            fontSize: '20px',
            backgroundColor: '#fff', // White background
            padding: {
                left: 5,
                right: 5,
                top: 5,
                bottom: 5
            }
        }).setDepth(9999); // similar to z-index
        this.fullscreenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    }

    setBackground(key) {
        let bg = this.add.image(0, 0, key).setOrigin(0, 0);
        let scaleX = this.cameras.main.width / bg.width;
        let scaleY = this.cameras.main.height / bg.height;
        let scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
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

    update() {
        this.statusDisplay.text = player.getStatus();
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

    preload() {
    this.load.image('homeBackground', 'assets/images/house_repeat.png');
    }

    create() {
        super.create();

        this.setBackground('homeBackground');
    
        let sleepButton = this.add.text(100, 100, 'Sleep', { fill: '#fff' }).setInteractive();
        sleepButton.on('pointerdown', this.sleep.bind(this)); // Bind 'this' context to the sleep function

        let downtownButton = this.add.text(250, 100, 'Head Downtown', { fill: '#fff' }).setInteractive();
        downtownButton.on('pointerdown', () => this.scene.start('DowntownScene'));
        
        // prepare message from baseScene
        this.createMessage();
    }    

    update() {
        // Update the player's status display
        this.statusDisplay.text = player.getStatus();
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

class DowntownScene extends BaseScene {
    constructor() {
        super({ key: 'DowntownScene' });
    }

    preload() {
    this.load.image('downtownBackground', 'assets/images/downtown_repeat.png');
    }

    create() {
        super.create();

        this.setBackground("downtownBackground");

        let homeButton = this.add.text(250, 100, 'Return Home', { fill: '#fff' }).setInteractive();
        homeButton.on('pointerdown', () => this.scene.start('MainScene'));

        let backAlleyButton = this.add.text(550, 100, 'Back Alley', { fill: '#fff' }).setInteractive();
        backAlleyButton.on('pointerdown', () => this.scene.start('BackAlleyScene'));
    
        let workButton = this.add.text(250, 200, 'Go to Work', { fill: '#fff' }).setInteractive();
        workButton.on('pointerdown', () => this.scene.start('WorkScene'));

        let barButton = this.add.text(400, 200, 'Go to the Bar', { fill: '#fff' }).setInteractive();
        barButton.on('pointerdown', () => this.scene.start('BarScene'));

        let cafeButton = this.add.text(550, 200, 'Go to the Cafe',{ fill: '#fff' }).setInteractive();
        cafeButton.on('pointerdown', () => this.scene.start('CafeScene'));
    
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

class WorkScene extends BaseScene {
    constructor() {
        super({ key: 'WorkScene' });
    }

    preload() {
    this.load.image('workBackground', 'assets/images/call_center.png');
    }

    create() {
        super.create();

        this.setBackground("workBackground");

        let downtownButton = this.add.text(250, 100, 'Return to Downtown', { fill: '#fff' }).setInteractive();
        downtownButton.on('pointerdown', () => this.scene.start('DowntownScene'));
    
        let workActionBtn = this.add.text(250, 200, 'Work', { fill: '#fff' }).setInteractive();
        workActionBtn.on('pointerdown', this.workAction.bind(this));
    
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

class BarScene extends BaseScene {
    constructor() {
        super({ key: 'BarScene' });
    }

    preload() {
    this.load.image('barBackground', 'assets/images/bar_repeat.png');
    }

    create() {
        super.create();

        this.setBackground("barBackground");

        let downtownButton = this.add.text(250, 100, 'Return to Downtown', { fill: '#fff' }).setInteractive();
        downtownButton.on('pointerdown', () => this.scene.start('DowntownScene'));
    
        let drinkButton = this.add.text(250, 200, 'Drink', { fill: '#fff' }).setInteractive();
        drinkButton.on('pointerdown', this.drinkAction.bind(this));
    
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

    preload() {
    this.load.image('cafeBackground', 'assets/images/cafe_repeat.png');
    }

    create() {
        super.create();

        this.setBackground('cafeBackground');

        let downtownButton = this.add.text(250, 100, 'Return to Downtown', { fill: '#fff' }).setInteractive();
        downtownButton.on('pointerdown', () => this.scene.start('DowntownScene'));
    
        // converse
        let converseButton = this.add.text(250, 200, 'Converse', { fill: '#fff' }).setInteractive();
        converseButton.on('pointerdown', this.converseAction.bind(this));

        // study
        let studyButton = this.add.text(400, 200, 'Study', { fill: '#fff' }).setInteractive();
        studyButton.on('pointerdown', this.studyAction.bind(this));

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

class BackAlleyScene extends BaseScene {
    constructor() {
        super({ key: 'BackAlleyScene' });
    }

    preload() {
    this.load.image('backAlleyBackground', 'assets/images/back_alley_repeat.png');
    }

    create() {
        super.create();

        this.setBackground('backAlleyBackground');

        let downtownButton = this.add.text(250, 100, 'Return to Downtown', { fill: '#fff' }).setInteractive();
        downtownButton.on('pointerdown', () => this.scene.start('DowntownScene'));
    
        let fightButton = this.add.text(250, 200, 'Fight for money', { fill: '#fff' }).setInteractive();
        fightButton.on('pointerdown', this.fightAction.bind(this));

        let gambleButton = this.add.text(550, 200, 'Gamble', { fill: '#fff' }).setInteractive();
        gambleButton.on('pointerdown', () => this.scene.start('GambleScene'));

        this.createMessage();
    }    

    update() {
        this.statusDisplay.text = player.getStatus();
    }

    fightAction() {
        if (player.hasSufficientEnergy(50)) {
            player.updateAttributes({
                endurance: 5,
                energy: -50
            });
        } else {
            this.showMessage("Not enough energy to fight!");
        }
    }
}

class GambleScene extends BaseScene {
    constructor() {
        super({ key: 'GambleScene' });
    }

    preload() {
    this.load.image('backAlleyBackground', 'assets/images/back_alley_repeat.png');
    }

    create() {
        super.create();
        this.setBackground('backAlleyBackground');

        let backAlleyButton = this.add.text(250, 100, 'Return to Downtown', { fill: '#fff' }).setInteractive();
        backAlleyButton.on('pointerdown', () => this.scene.start('BackAlleyScene'));

        let gambleButton = this.add.text(550, 200, 'Set 50 on bum fight', { fill: '#fff' }).setInteractive();
        gambleButton.on('pointerdown', this.gambleAction.bind(this));

        this.createMessage();
    }    

    update() {
        this.statusDisplay.text = player.getStatus();
    }

    gambleAction() {
        if (player.hasEnoughMoney(50)) {
            if (Phaser.Math.Between(1, 2)=== 1) {
                player.updateAttributes({money: 50});
                this.showMessage("Your bum won - you won 50");
            } else {
                player.updateAttributes({money: -50});
                this.showMessage("Your bum lost - you lost 50");
            }
        } else {
            this.showMessage("Not enough money to gamble!");
        }
    }
}

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1080;

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: Math.min(window.innerWidth, MAX_WIDTH),
    height: Math.min(window.innerHeight, MAX_HEIGHT),
    scene: [MainScene, DowntownScene, WorkScene, BarScene, CafeScene, BackAlleyScene, GambleScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Instantiate the game
let game = new Phaser.Game(config);

window.addEventListener('resize', function(event) {
    let w = Math.min(window.innerWidth, MAX_WIDTH);
    let h = Math.min(window.innerHeight, MAX_HEIGHT);
    game.scale.resize(w, h);
});

