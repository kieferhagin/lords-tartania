game.PlayerEntity = game.LivingEntity.extend({
    init: function(x, y, settings){
        this.parent(x, y, settings);

        this._paperdollSettings = {
            gender: 'male',
            skin: 'light',
            hair: 'short',
            hairColor: 'brown'
        };

        this.renderable = new me.ObjectContainer(0, 0, 64, 64);

        this.stats.xp = {
            total: 0,
            nextLevel: 100,
            lastLevel: 0
        };

        this.stats.hp.current = 50;

        this.inventory = new game.models.Inventory(24);
        this.equipment = new game.models.Equipment(['torso']);

        this.autoAttack = true;

        me.game.onLevelLoaded = this.levelLoaded.bind(this);

        this.name = game.data.username;

        this.isPersistent = true;
        this.isFrozen = false;

        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        me.input.registerPointerEvent('pointerdown', me.game.viewport, function(e){
            if (e.button === 0) {
                var mousePos = me.input.mouse.pos;

                this.moveToTile(getTileCoordsFromScreen(mousePos.x, mousePos.y));
                this.clearTarget();

                game.contextMenu.hide();
            }
        }.bind(this));

        this.xpChanged = new game.Event();
        this.levelChanged = new game.Event();
        this.paperdollChanged = new game.Event();

        this.killedEnemy.addHandler(function(e){
            this.stats.xp.total += e.xp;

            while (this.stats.xp.total >= this.stats.xp.nextLevel)
                this.gainedLevel();

            this.xpChanged.fire({xp: this.stats.xp});
        }.bind(this));

        this.equipment.itemEquipped.addHandler(function(e){
            var itemData = e.item.data;
            this._paperdollSettings[itemData.equipSlot] = itemData.id;

            this.setPaperdoll(this._paperdollSettings);
        }.bind(this));

        this.equipment.itemUnequipped.addHandler(function(e){
            var itemData = e.item.data;
            this._paperdollSettings[itemData.equipSlot] = null;

            this.setPaperdoll(this._paperdollSettings);
        }.bind(this));
    },
    setPaperdoll: function(settings){
        this._paperdollSettings = settings;
        this.renderable = new me.ObjectContainer(0, 0, 64, 64);

        var baseImage = "base_"+settings.gender+"_"+settings.skin;
        var baseLayer = this._createDollLayer(me.loader.getImage(baseImage));
        this.renderable.addChild(baseLayer, 0);

        if (settings.hair !== 'bald'){
            var hairImage = "hair_"+settings.hair+"_"+settings.hairColor;
            var hairLayer = this._createDollLayer(me.loader.getImage(hairImage));
            this.renderable.addChild(hairLayer, 1);
        }

        if (settings.torso){
            var torsoImage = "item_"+settings.torso;
            var torsoLayer = this._createDollLayer(me.loader.getImage(torsoImage));
            this.renderable.addChild(torsoLayer, 2);
        }

        this.paperdollChanged.fire({paperdoll: this.getPaperdoll()})
    },
    _createDollLayer: function(image){
        return new me.SpriteObject(0, 0, image, 64, 64);
    },
    getPaperdoll: function(){
        var settings = this._paperdollSettings;
        var previewSettings = [
            { id: 'base', isBody: true, components: [ settings.gender, settings.skin ] },
            { id: 'hair', isBody: true, components: [ settings.hair, settings.hairColor ] }
        ];

        if (settings.torso)
            previewSettings.push({id: 'torso', components: [ settings.torso ]});

        return previewSettings;
    },
    update: function(delta){
        return this.parent(delta);
    },
    teleport: function(toPos){
        this.isFrozen = true;
        this.teleportTo = toPos;
    },
    levelLoaded: function(level){
        if (this.teleportTo){
            this.pos.x = this.teleportTo.x;
            this.pos.y = this.teleportTo.y;

            this.teleportTo = null;
            this.isFrozen = false;

            this.pathFollower.stop();
        }
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },
    contextMenuSelected: function(context, action){
        if (action === 'attack'){
            this.setTarget(context);
        }
        if (action === 'pickup'){
            context.item.pickup(this);
        }
        if (action === 'equip'){
            this.equipment.equipItem(context.item, this.inventory);
        }
        if (action === 'unequip'){
            this.equipment.unequipSlot(context.item.data.equipSlot, this.inventory);
        }
    },
    calculateDamage: function(){
        return randomIntFromInterval(0, 20);
    },
    gainedLevel: function(){
        this.stats.level++;
        var xp = this.stats.xp;
        xp.lastLevel = xp.nextLevel;
        xp.nextLevel = xp.nextLevel + (Math.floor(75 * Math.pow(1.1, this.stats.level)));


        this.levelChanged.fire({level: this.stats.level});
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

        if (xDifference+yDifference === 0)
            x = targetTile.x - 1;

        this.moveToTile({x:x, y:y});
    }
});

game.NpcEntity = game.LivingEntity.extend({
    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.moveInterval = 3000;
        this.timeSinceLastMove = 0;
        this.isHostile = settings.isHostile;
        this.isTarget = false;

        this.contextMenuHandler = new game.gui.ContextMenuHandler(this,
            [
                {title: "Attack", identifier: "attack"},
                {title: "Examine", identifier: "examine"}
            ], true);

        me.input.registerPointerEvent('pointerdown', this, this.contextMenuHandler.clickHandler);
    },
    update: function(delta){
        this.timeSinceLastMove += delta;

        if (this.timeSinceLastMove >= this.moveInterval){
            this.timeSinceLastMove = 0;

            if (this.isPlayerDetected()) {
                this.setTarget(me.game.mainPlayer);
            } else {
                this.clearTarget();
                this.moveToRandomTile(-1, 1);
            }
        }
        return this.parent(delta);
    },
    draw: function(context){
        if (this.isTarget){
            var shape = this.getShape();
            context.strokeStyle = this.isHostile ? 'red' : 'yellow';

            drawEllipse(context,
                this.pos.x + shape.width / 2,
                this.pos.y + shape.height - 10,
                shape.width / 2,
                10);
        }

		this.parent(context);
    },
    isPlayerDetected: function(){
        if (!me.game.mainPlayer.alive)
            return false;
        var tileRadius = 3;
        var pixelRadius = tileRadius*64;

        var distance = lineDistance(me.game.mainPlayer.pos, this.pos);
        return distance <= pixelRadius;
    },
    die: function(attacker){
        this.parent(attacker);

        me.input.releasePointerEvent('pointerdown', this);

        var itemDef = game.itemDefinitions['coins'];
        var item = new game.models.Item(itemDef, 1);

        var drop = me.pool.pull('itemDrop', this.pos.x, this.pos.y, {
            spritewidth: 64,
            spriteheight: 64,
            width: 64,
            height: 64,
            item: item
        });

        drop.z = 6;
        drop.addShape(new me.Rect({x: 0, y: 0}, 32, 32));
        me.game.world.addChild(drop);
    }
});

game.TeleportEntity = me.LevelEntity.extend({
    init: function(x, y, settings){
        this.teleportX = settings.toX*64;
        this.teleportY = settings.toY*64;
        this.hasArrow = settings.hasArrow;

        if (this.hasArrow){
            settings.image = 'arrow';
        }

        this.parent(x, y, settings);

        if (this.hasArrow)
            this.renderable.addAnimation('arrow', [0, 1, 2, 1], 1000);

        this.teleporting = false;
    },
    goTo: function(level){
        this.teleporting = true;
        me.game.mainPlayer.teleport({x: this.teleportX, y: this.teleportY});
        this.parent(level);
    },
    update: function(delta){
        this.parent(delta);

        var player = me.game.mainPlayer;

        if (!this.teleporting && this.pos.x === player.pos.x
            && this.pos.y === player.pos.y){
            this.goTo();
        }
    }
});

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function getTileCoordsFromScreen(screenX, screenY){
    var worldPos = me.game.viewport.localToWorld(screenX, screenY);
    return getTileCoordsFromWorld(worldPos);
}

function getTileCoordsFromWorld(worldPos){
    var tileX = Math.floor(worldPos.x / 64);
    var tileY = Math.floor(worldPos.y / 64);

    return {x:tileX, y:tileY};
}

function lineDistance(point1, point2){
  var xs;
  var ys;

  xs = point2.x - point1.x;
  xs = xs * xs;

  ys = point2.y - point1.y;
  ys = ys * ys;

  return Math.sqrt( xs + ys );
}

function drawEllipse(context, cx, cy, rx, ry){
    context.save(); // save state
    context.beginPath();

    context.translate(cx-rx, cy-ry);
    context.scale(rx, ry);
    context.arc(1, 1, 1, 0, 2 * Math.PI, false);

    context.restore(); // restore to original state
    context.stroke();
}