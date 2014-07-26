game.AnimatedTile = me.ObjectEntity.extend({
    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.renderable.addAnimation(settings.name, [0, 1], 1000);
    }
});

game.ItemDrop = me.ObjectEntity.extend({
    init: function(x, y, settings){
        if (!settings.item)
            throw 'settings.item is required';

        settings.image = settings.item.data.image;

        this.parent(x, y, settings);
        this.item = settings.item;

        this.contextMenuHandler = new game.gui.ContextMenuHandler(this,
            [
                {title: "Pickup", identifier: "pickup"},
                {title: "Examine", identifier: "examine"}
            ], true);

        me.input.registerPointerEvent('pointerdown', this, this.contextMenuHandler.clickHandler);
    }
});