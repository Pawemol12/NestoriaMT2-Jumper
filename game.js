/**
* Created By Paweł Lodzik aka Pawemol 2020
**/

function randomInt(min, max) {
	return min + Math.floor((max - min) * Math.random());
}

const PIPE_COUNT = 3;
const PIPES_PER_GROUP = 4;

var game;

var gameOptions = {
    jumperGravity: 800,
    jumperSpeed: 125,
    jumperPower: 250,
    minPipeHeight: 45,
    pipeDistance: [215, 290],
    pipeHole: [100, 135],
    localStorage_bestScore: 'bestJumperScore',
	localStorage_score: 'jumperLastScore'
}

window.onload = function() {
    var gameConfig = {
        type: Phaser.AUTO,
		scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'gameWindow',
            width: 650,
            height: 400,
        },
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }
            }
        },
        scene: [MainMenu, PlayGame, Result]
    }
	
    game = new Phaser.Game(gameConfig);
    window.focus();
}

class MainMenu extends Phaser.Scene {
	constructor(){
        super('MainMenu');
    }
    preload(){
        this.load.image('playGameButton', 'play_game.png');
		this.load.image('nestoriaLogo', 'nestoria.png');
		this.load.image('jumperLogo', 'jumper_logo.png');
		this.load.image('footer', 'footer.png');


		this.load.image('menu_background', 'menu.jpg');
    }
	create(){
		this.add.sprite(350, 200,'menu_background');
		this.add.image(350, 70, 'nestoriaLogo')
		this.add.image(350, 110, 'jumperLogo')
		this.add.image(350, 380, 'footer')

		var play_button = this.add.image(350, 180, 'playGameButton');
		play_button.setInteractive();

        play_button.once('pointerup', function () {

            this.scene.start('PlayGame');

        }, this);
	}
}

class Result extends Phaser.Scene {
    constructor(){
        super('Result');
    }
    preload(){
        this.load.image('playGameButton', 'play_game.png');
		this.load.image('nestoriaLogo', 'nestoria.png');
		this.load.image('menu_background', 'menu.jpg');
		this.load.image('jumperLogo', 'jumper_logo.png');
		this.load.image('footer', 'footer.png');
    }
	create(){
		this.add.sprite(350, 200,'menu_background');
		this.add.image(350, 70, 'nestoriaLogo');
		this.add.image(350, 110, 'jumperLogo');
		this.add.image(350, 380, 'footer')
		var play_button = this.add.image(350, 180, 'playGameButton');
		play_button.setInteractive();

        play_button.once('pointerup', function () {

            this.scene.start('PlayGame');

        }, this);
		
		var lastScore = localStorage.getItem(gameOptions.localStorage_score) == null ? 0 : localStorage.getItem(gameOptions.localStorage_score);
		this.add.text(270, 240, 'Zdobyte punkty: ' + lastScore, { font: '25px Tahoma bold', fill: '#604020' });
		
		var lastBestScore = localStorage.getItem(gameOptions.localStorage_bestScore) == null ? 0 : localStorage.getItem(gameOptions.localStorage_bestScore);
		this.add.text(270, 270, 'Rekord: ' + lastBestScore, { font: '25px Tahoma bold', fill: '#604020' });
	}
}
class PlayGame extends Phaser.Scene {
    constructor(){
        super('PlayGame');
    }
    preload(){
        this.load.image('jumper', 'jumper.png');
        this.load.image('pipe1', 'pipe1.jpg');
		this.load.image('pipe2', 'pipe2.jpg');
		this.load.image('pipe3', 'pipe3.jpg');

		this.load.image('background', 'background.jpg');
		
    }
    create(){
		this.add.sprite(350, 200,'background');
        this.pipeGroup = this.physics.add.group();
        this.pipePool = [];
        for(let i = 0; i < PIPES_PER_GROUP; i++){
			for (var a = 0; a < PIPE_COUNT - 1; a++) {
				var opt = randomInt(0, PIPE_COUNT);
				if (opt == 1) {
					this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe1'));
				}
				else if (opt == 2) {
					this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe2'));
				}
				else {
					this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe3'));
				}
			}
            this.placePipes(false);
        }
		
        this.pipeGroup.setVelocityX(-gameOptions.jumperSpeed);
        this.jumper = this.physics.add.sprite(80, game.config.height / 2, 'jumper');
        this.jumper.body.gravity.y = gameOptions.jumperGravity;
        this.input.on('pointerdown', this.flap, this);
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorage_bestScore) == null ? 0 : localStorage.getItem(gameOptions.localStorage_bestScore);
		this.scoreValueText = this.add.text(10, 5, '',{ font: '18px Tahoma', fill: '#ff9900' });
		this.maxScoreValueText = this.add.text(10, 25, '',{ font: '18px Tahoma', fill: '#ff9900' });
        this.updateScore(this.score);
    }
    updateScore(inc){
        this.score += inc;
        this.scoreValueText.text = 'Punkty: ' + this.score;
		this.maxScoreValueText.text = 'Rekord: ' + this.topScore;

    }
    placePipes(addScore){
        let rightmost = this.getRightmostPipe();
        let pipeHoleHeight = Phaser.Math.Between(gameOptions.pipeHole[0], gameOptions.pipeHole[1]);
        let pipeHolePosition = Phaser.Math.Between(gameOptions.minPipeHeight + pipeHoleHeight / 2, game.config.height - gameOptions.minPipeHeight - pipeHoleHeight / 2);
        this.pipePool[0].x = rightmost + this.pipePool[0].getBounds().width + Phaser.Math.Between(gameOptions.pipeDistance[0], gameOptions.pipeDistance[1]);
        this.pipePool[0].y = pipeHolePosition - pipeHoleHeight / 2;
        this.pipePool[0].setOrigin(0, 1);
        this.pipePool[1].x = this.pipePool[0].x;
        this.pipePool[1].y = pipeHolePosition + pipeHoleHeight / 2;
        this.pipePool[1].setOrigin(0, 0);
        this.pipePool = [];
        if(addScore){
            this.updateScore(1);
        }
    }
    flap(){
        this.jumper.body.velocity.y = -gameOptions.jumperPower;
    }
    getRightmostPipe(){
        let rightmostPipe = 0;
        this.pipeGroup.getChildren().forEach(function(pipe){
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });
        return rightmostPipe;
    }
    update(){
        this.physics.world.collide(this.jumper, this.pipeGroup, function(){
            this.die();
        }, null, this);
        if(this.jumper.y > game.config.height || this.jumper.y < 0){
            this.die();
        }
        this.pipeGroup.getChildren().forEach(function(pipe){
            if(pipe.getBounds().right < 0){
                this.pipePool.push(pipe);
                if(this.pipePool.length == 2){
                    this.placePipes(true);
                }
            }
        }, this)
    }
    die(){
        localStorage.setItem(gameOptions.localStorage_bestScore, Math.max(this.score, this.topScore));
		localStorage.setItem(gameOptions.localStorage_score, Math.max(this.score));
        this.scene.start('Result');
    }
}
