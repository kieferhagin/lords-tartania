game.LivingEntity = me.ObjectEntity.extend({
    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.alwaysUpdate = true;
        this.name = this.name || settings.name || 'Unknown';
        this.isCollidable = true;
        this.targetMoveTile = null;
        this.stats = {
            hp: {max: 50, current: 10},
            pp: {max: 25, current: 25},
            level: 1,
            attackRange: 96,
            healthRegeneration: 4000
        };

        this.attackSpeed = 3000;
        this.healthBarDisplayTime = 8000;

        this.timeSinceLastAttack = 0;
        this.timeSinceLastDamage = 0;
        this.timeSinceLastHealthRegen = 0;
        this.autoAttack = true;

        this.infoFont = new me.Font('Tahoma', 14, 'white');

        this.damageDisplay = new game.FloatingDamageIndicator(this, new me.Font('Tahoma', 18, '#FF4D4D'));

        this.healthChanged = new game.Event();
        this.killedEnemy = new game.Event();
    },
    draw: function(context){
        this.parent(context);

        if (this.timeSinceLastDamage <= this.healthBarDisplayTime || this.isTarget)
            this.drawHealthBar(context, 32);

        this.drawName(context);

        this.damageDisplay.draw(context);
    },
    drawName: function(context){
        var nameLabelText = this.name + ' (Lvl ' + this.stats.level +')';
        var nameLabelDimensions = this.infoFont.measureText(context, nameLabelText);
        var collisionShape = this.shapes[0];
        var offsetX = (nameLabelDimensions.width - collisionShape.width) / 2;
		this.infoFont.draw(context, nameLabelText, this.pos.x - offsetX, this.pos.y - 20);
    },
    drawHealthBar: function(context, totalBarWidth){
        var healthPercent = this.stats.hp.current / this.stats.hp.max;
        var barX = (this.getShape().width - totalBarWidth) / 2 + this.pos.x;

        context.fillStyle = 'red';
        context.fillRect(barX, this.pos.y - 30, totalBarWidth * healthPercent, 5);
    },
    update: function(delta){
        if (!this.pathFollower)
            this.pathFollower = this.buildPathFollower();

        if (this.activeTarget && !this.activeTarget.alive)
            this.clearTarget();

        if (this.shouldMove()){
            try {
                this.pathFollower.moveToTile(this.targetMoveTile);
            } catch (err){ }

            this.targetMoveTile = null;
        }

        this.incrementTimers(delta);

        this.damageDisplay.update(delta);

        if (this.timeSinceLastHealthRegen >= this.stats.healthRegeneration)
            this.heal(1);

        if (this.shouldAttack())
            this.attack();

        return this.parent(delta);
    },
    buildPathFollower: function() {
        var self = this;
        return new PathFollower(me, this, me.Tween.Easing.Linear.None, 350, function(stepPos){
            var currentTilePos = getTileCoordsFromWorld(self.pos);
            var stepTilePos = getTileCoordsFromWorld(stepPos);
            var xDifference = currentTilePos.x - stepTilePos.x;

            //self.flipX(xDifference >= 1);
        });
    },
    shouldMove: function() {
        return this.targetMoveTile !== null && !this.isFrozen;
    },
    shouldAttack: function() {
        return this.activeTarget && this.timeSinceLastAttack >= this.attackSpeed;
    },
    incrementTimers: function(delta) {
        if (this.timeSinceLastAttack <= this.attackSpeed)
            this.timeSinceLastAttack += delta;

        if (this.timeSinceLastDamage <= this.healthBarDisplayTime)
            this.timeSinceLastDamage += delta;

        if (this.timeSinceLastHealthRegen <= this.stats.healthRegeneration)
            this.timeSinceLastHealthRegen += delta;
    },
    getCenter: function(){
        var shape = this.getShape();
        var centerX = this.pos.x + shape.width / 2;
        var centerY = this.pos.y + shape.height / 2;

        return {x: centerX, y: centerY};
    },
    moveToNearestAdjacentTile: function(targetPos){
        var targetTile = getTileCoordsFromWorld(targetPos);
        var currentTile = getTileCoordsFromWorld(this.pos);
        var x = targetTile.x;
        var y = targetTile.y;

        var xDifference = currentTile.x - targetTile.x;
        var yDifference = currentTile.y - targetTile.y;

        if (xDifference >= 1)
            x = targetTile.x + 1;
        else if (xDifference <= -1)
            x = targetTile.x - 1;

        if (yDifference >= 1)
            y = targetTile.y + 1;
        else if (yDifference <= -1)
            y = targetTile.y - 1;

        this.moveToTile({x:x, y:y});
    },
    moveToRandomTile: function(rangeMin, rangeMax){
        var currentX = Math.floor(this.pos.x / 64);
        var currentY = Math.floor(this.pos.y / 64);

        var randomX = randomIntFromInterval(-1, 1) + currentX;
        var randomY = randomIntFromInterval(-1, 1) + currentY;

        this.moveToTile({x: randomX, y: randomY});
    },
    moveToTile: function(tilePos){
        this.targetMoveTile = tilePos;
    },
    setTarget: function(target){
        this.clearTarget();
        target.isTarget = true;
        this.activeTarget = target;
        this.moveToNearestAdjacentTile(target.pos);
    },
    clearTarget: function(){
        if (this.activeTarget){
            this.activeTarget.isTarget = false;
            this.activeTarget = null;
        }
    },
    attack: function(){
        if (this.activeTarget){
            this.timeSinceLastAttack = 0;
            this.moveToNearestAdjacentTile(this.activeTarget.pos);

            var center = this.getCenter();
            var targetCenter = this.activeTarget.getCenter();

            var distance = lineDistance(center, targetCenter);

            if (distance <= this.stats.attackRange)
                this.activeTarget.takeDamage(this, this.calculateDamage());
        }
    },
    calculateDamage: function(){
        return randomIntFromInterval(0, 5);
    },
    takeDamage: function(attacker, amount){
        this.setCurrentHp(Math.max(0, this.stats.hp.current - amount));
        this.damageDisplay.addDamageToQueue(amount);
        this.timeSinceLastDamage = 0;
        game.textWindow.addStatusMessage(attacker.name + ' hit ' + this.name + ' for ' + amount + ' damage!');

        if (this.autoAttack && !this.activeTarget)
            this.setTarget(attacker);

        if (this.stats.hp.current <= 0){
            this.stats.hp.current = 0;
            this.die(attacker);
        }
    },
    die: function(attacker){
        me.game.world.removeChild(this);
        this.clearTarget();

        game.textWindow.addStatusMessage(this.name + ' has died!');

        var xpReward = this._calculateXpReward(attacker);

        attacker.killedEnemy.fire({xp: xpReward, killed: this});

        this.alive = false;
    },
    _calculateXpReward: function(attacker){
        var levelDiff = this.stats.level - attacker.stats.level;
        var xp = (this.stats.level * 25) + (levelDiff * 5);

        return Math.max(0, xp);
    },
    heal: function(amount){
        this.timeSinceLastHealthRegen = 0;
        var adjustedHp = this.stats.hp.current + amount;
        this.setCurrentHp(Math.min(adjustedHp, this.stats.hp.max));
    },
    setCurrentHp: function(value){
        this.stats.hp.current = value;
        this.healthChanged.fire({
            entity: this,
            hp: this.stats.hp
        });
    }
});

game.FloatingDamageIndicator = Object.extend({
    init: function(entity, font, offsetPerSecond, maxYOffset, maxVisibleCount){
        this.entity = entity;
        this.font = font;
        this.offsetPerSecond = offsetPerSecond || 100;
        this.maxYOffset = maxYOffset || 100;
        this.maxVisibleCount = maxVisibleCount || 5;

        this.damageQueue = [];
        this.displaying = [];
    },
    addDamageToQueue: function(damage){
        var startPos = {x: this.entity.pos.x, y: this.entity.pos.y};
        var xOffset = randomIntFromInterval(0, this.entity.getShape().width);
        this.damageQueue.push({damage: damage, xOffset: xOffset, yOffset: 0, startPos: startPos});
    },
    draw: function(context){
        for(var i = 0; i < this.displaying.length; i++){
            var damageObj = this.displaying[i];
            var x = damageObj.startPos.x + damageObj.xOffset;
            var y = damageObj.startPos.y - damageObj.yOffset;

            this.font.draw(context, damageObj.damage.toString(), x, y);
        }
    },
    update: function(delta){
        this.updateCurrentlyDisplayed(delta);
        this.processQueue();
    },
    updateCurrentlyDisplayed: function(delta){
        for(var i = 0; i < this.displaying.length; i++) {
            var damageObj = this.displaying[i];
            if (damageObj.yOffset >= this.maxYOffset){
                this.displaying.splice(i, 1);
                i--;
            } else {
                damageObj.yOffset += this.offsetPerSecond * (delta / 1000);
            }
        }
    },
    processQueue: function(){
        for(var i = 0; i < this.damageQueue.length; i++){
            var damageObj = this.damageQueue[i];
            if (this.displaying.length < this.maxVisibleCount){
                this.displaying.push(damageObj);
                this.damageQueue.splice(i, 1);
                i--;
            }
        }
    }
});