function PathFollower(melon, sprite, easing, timePerStepMS, onStepStart){
    var collisionMap = melon.game.collisionMap;

    this.tileDimensions = {
        width: collisionMap.tilewidth,
        height: collisionMap.tileheight
    };

    this.melon = melon;
    this.sprite = sprite;
    this.easing = easing;
    this.timePerStepMS = timePerStepMS;
    this.onStepStart = onStepStart;

    this.activeTweens = [];
    this.activePath = null;
}

PathFollower.prototype.moveToTile = function(tilePos){
    this.stop();

    var currentPosition = this.sprite.pos;
    var targetPosition = {
        x: tilePos.x * this.tileDimensions.width,
        y: tilePos.y * this.tileDimensions.height
    };

    this.activePath = me.astar.search(currentPosition.x, currentPosition.y, targetPosition.x, targetPosition.y).reverse();
    this.activeTweens = buildTweens(this.melon, this.sprite, this.activePath, this.easing, this.timePerStepMS, this.onStepStart);

    if (this.activeTweens.length > 0){
        this.activeTweens[0].start();
    }
}

function buildTweens(melon, sprite, path, easing, timePerStepMS, onStepStart){
    var tweens = [];

    for (var i = 0; i < path.length; i++){
        var pathStep = path[i];

        var tween = new melon.Tween(sprite.pos).to(pathStep.pos, timePerStepMS).onStart(function(){
            onStepStart(pathStep.pos);
        });

        tween.easing(easing || melon.Tween.Easing.Linear.None);

        tweens.push(tween);

        // If this isn't the first tween, chain this one to the one before it
        if (i > 0)
            tweens[i - 1].chain(tween);
    }

    return tweens;
}

PathFollower.prototype.stop = function(){
    if (this.activeTweens.length > 0){
        for (var i = 0; i < this.activeTweens.length; i++){
            this.activeTweens[i].stop();
        }
    }

    this.activeTweens = [];
    this.activePath = null;
}