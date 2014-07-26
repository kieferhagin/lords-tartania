game.PlayerEntity = me.ObjectEntity.extend({
    init: function(x, y, settings){
        var settings = {
            image: 'warrior',
            spritewidth: 64,
            spriteheight: 64,
            width: 64,
            height: 64
        };
        this.parent(x, y, settings);
        this.collidable = true;

        //me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },
    update: function(delta){
        console.log('update');
        return false;
    }
});