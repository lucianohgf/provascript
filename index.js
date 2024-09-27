const { createApp } = Vue;

createApp({
    data() {
        return {
            hero: {
                life: 100,
                name: "Hercules",
                sprite: "assets/mocinho.gif",
                actionsHistory: [],
                mana: 50,
                defense: false,
                potionUses: 0,
                fleeAttempts: 0
            },
            villain: {
                life: 100,
                name: "Golias",
                sprite: "assets/vilao.gif",
                actionsHistory: [],
                mana: 50,
                defense: false,
                potionUses: 0,
                fleeAttempts: 0
            },
            turn: 'hero',
            gameMessage: '',
            showModal: false,
            gameOver: false,
            winnerGif: null,
            winnerMessage: '',
            showTurnMessage: false,
            actionHistory: [],
            backgroundMusic: null,
            gameStarted: false,
            playerCount: 1
        };
    },
    mounted() {
        this.initBackgroundMusic();
    },
    methods: {
        initBackgroundMusic() {
            this.backgroundMusic = new Audio('assets/somMK.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.5;

            document.addEventListener('click', () => {
                this.backgroundMusic.play().catch(error => {
                    console.error("Erro ao reproduzir áudio:", error);
                });
            }, { once: true });
        },
        startGame(players) {
            this.playerCount = players;
            this.gameStarted = true;
        },
        showTemporaryMessage(message) {
            this.gameMessage = message;
            this.showModal = true;
            setTimeout(() => { this.showModal = false; }, 3000);
        },
        showTurnMessage(message) {
            this.gameMessage = message;
            this.showTurnMessage = true;
            setTimeout(() => { this.showTurnMessage = false; }, 3000);
        },
        calculateRandomDamage() {
            const damageOptions = [0, 5, 10, 15];
            const randomIndex = Math.floor(Math.random() * damageOptions.length);
            return damageOptions[randomIndex];
        },
        attack(isHero) {
            if (this.gameOver || this.turn !== (isHero ? 'hero' : 'villain')) return;

            const attacker = isHero ? this.hero : this.villain;
            const target = isHero ? this.villain : this.hero;

            const damage = this.calculateRandomDamage();

            if (target.defense) {
                target.life -= Math.floor(damage / 2);
                target.defense = false;
            } else {
                target.life -= damage;
            }

            this.addToHistory(`${attacker.name} atacou ${target.name} e causou ${damage} de dano.`);
            this.checkGameOver();

            if (!this.gameOver) {
                this.turn = isHero ? 'villain' : 'hero';
                if (this.turn === 'villain' && this.playerCount === 1) {
                    this.villainAction();
                }
            }
        },
        defend(isHero) {
            if (this.gameOver || this.turn !== (isHero ? 'hero' : 'villain')) return;

            const defender = isHero ? this.hero : this.villain;

            if (defender.defense) return;
            defender.defense = true;
            defender.potionUses++;
            this.addToHistory(`${defender.name} está se defendendo.`);

            setTimeout(() => { defender.defense = false; }, 2000);

            this.checkGameOver();

            if (!this.gameOver) {
                this.turn = isHero ? 'villain' : 'hero';
                if (this.turn === 'villain' && this.playerCount === 1) {
                    this.villainAction();
                }
            }
        },
        usePotion(isHero) {
            if (this.gameOver || this.turn !== (isHero ? 'hero' : 'villain')) return;

            const user = isHero ? this.hero : this.villain;

            if (user.mana >= 20) {
                user.life = Math.min(user.life + 30, 100);
                user.mana -= 20;
                user.potionUses++;
                this.addToHistory(`${user.name} usou uma poção e recuperou 30 de vida.`);
            } else {
                this.addToHistory(`${user.name} não tem mana suficiente para usar uma poção.`);
            }
            this.checkGameOver();

            if (!this.gameOver) {
                this.turn = isHero ? 'villain' : 'hero';
                if (this.turn === 'villain' && this.playerCount === 1) {
                    this.villainAction();
                }
            }
        },
        flee() {
            if (this.gameOver) return;

            const fleeingCharacter = this.turn === 'hero' ? this.hero : this.villain;
            const opponent = this.turn === 'hero' ? this.villain : this.hero;

            fleeingCharacter.fleeAttempts++;

            if (fleeingCharacter.fleeAttempts >= 3) {
                this.showTemporaryMessage(`${fleeingCharacter.name} tentou fugir pela terceira vez! ${opponent.name} venceu!`);
                this.endGame(`${opponent.name} venceu!`, this.turn !== 'hero');
            } else {
                this.showTemporaryMessage(`${fleeingCharacter.name} tentou fugir. A tentativa ${fleeingCharacter.fleeAttempts} foi registrada.`);
                this.turn = this.turn === 'hero' ? 'villain' : 'hero';
                if (this.turn === 'villain' && this.playerCount === 1) {
                    this.villainAction();
                }
            }
        },
        villainAction() {
            if (!this.gameOver && this.turn === 'villain') {
                console.log('Vilão está tomando uma decisão');

                const randomAction = Math.floor(Math.random() * 4);

                setTimeout(() => {
                    switch (randomAction) {
                        case 0:
                            this.attack(false);
                            break;
                        case 1:
                            this.defend(false);
                            break;
                        case 2:
                            if (this.villain.mana >= 20) {
                                this.usePotion(false);
                            } else {
                                this.attack(false);
                            }
                            break;
                        case 3:
                            this.flee();
                            break;
                    }
                }, 1000);
            }
        },
        addToHistory(action) {
            this.actionHistory.unshift(action);
            if (this.actionHistory.length > 10) {
                this.actionHistory.pop();
            }
        },
        checkGameOver() {
            if (this.hero.life <= 0) {
                this.endGame('O vilão venceu!', false);
            } else if (this.villain.life <= 0) {
                this.endGame('O herói venceu!', true);
            }
        },
        endGame(message, heroWon) {
            this.gameOver = true;
            this.winnerMessage = message;
            this.winnerGif = heroWon ? "assets/vitoria_mocinho.gif" : "assets/gameover.gif";
            console.log("Winner GIF:", this.winnerGif);
            this.$forceUpdate();
        },
        resetGame() {
            this.hero.life = 100;
            this.villain.life = 100;
            this.hero.mana = 50;
            this.villain.mana = 50;
            this.hero.defense = false;
            this.villain.defense = false;
            this.hero.potionUses = 0;
            this.villain.potionUses = 0;
            this.hero.fleeAttempts = 0;
            this.villain.fleeAttempts = 0;
            this.turn = 'hero';
            this.gameOver = false;
            this.gameMessage = '';
            this.actionHistory = [];
            this.winnerGif = null;
            this.winnerMessage = '';
            this.gameStarted = false;
            this.playerCount = 1;
        }
    }
}).mount('#app');