(function() {
    game.PlayScreen = me.ScreenObject.extend({
        onResetEvent: function() {
            me.levelDirector.loadLevel('forest_test');

            var player = createPlayer();
            me.game.mainPlayer = player;

            game.contextMenu = createContextMenu(player);
            game.textWindow = new game.gui.TextWindow();
            game.statusWindow = new game.gui.StatusWindow(player, 5, 5);
            game.inventoryWindow = createInventoryMenu(player);
            game.equipmentWindow = createEquipmentMenu(player);
            game.menuBar = new game.gui.BottomMenuBar();
            game.characterDesigner = new game.gui.CharacterDesigner.DesignerWindow(null, function(settings){
                player.setPaperdoll(settings);
            });
            game.characterDesigner.show();

            me.game.world.addChild(game.statusWindow);
            me.game.world.addChild(game.contextMenu);
            me.game.world.addChild(game.textWindow);
            me.game.world.addChild(game.menuBar);
            me.game.world.addChild(game.characterDesigner);
            me.game.world.addChild(game.inventoryWindow);
            me.game.world.addChild(game.equipmentWindow);
            me.game.world.addChild(player);

            var itemDef = game.itemDefinitions['ringmail'];
            var item = new game.models.Item(itemDef, 1);
            player.inventory.addItem(item);
        },
        onDestroyEvent: function() {
            me.game.world.removeChild(game.statusWindow);
            me.game.world.removeChild(game.contextMenu);
            me.game.world.removeChild(game.textWindow);
            me.game.world.removeChild(game.menuBar);
            me.game.world.removeChild(game.characterDesigner);
            me.game.world.removeChild(game.inventoryWindow);
            me.game.world.removeChild(game.equipmentWindow);
            me.game.world.removeChild(me.game.mainPlayer);
        }
    });

    function createPlayer(){
        var settings = {
            spritewidth: 64,
            spriteheight: 64,
            width: 64,
            height: 64,
            image: 'warrior'
        };

        var player = me.pool.pull('mainPlayer', 640, 640, settings);
        player.z = 7;
        player.addShape(new me.Rect({x: 0, y: 0}, 64, 64));

        return player;
    }

    function createContextMenu(player){
        if (typeof(player.contextMenuSelected) !== 'function')
            throw 'Player object must have a function contextMenuSelected';

        return new game.gui.ContextMenu(function(context, action){
            player.contextMenuSelected(context, action);
        });
    }

    function createInventoryMenu(player){
        return new game.gui.InventoryWindow(player, 80, 5, 545, 260);
    }

    function createEquipmentMenu(player){
        return new game.gui.EquipmentWindow(player, 5, 110, 400, 320);
    }

})();