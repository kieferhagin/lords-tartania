game.gui.BottomMenuBar = game.gui.MenuBar.extend({
    init: function(){
        this.parent(5, 5, 545, 70);

        this._addMenuItems();
    },
    _addMenuItems: function(){
        this._addItem('inventory', 'Inventory', game.inventoryWindow);
        this._addItem('equipment', 'Equipment', game.equipmentWindow);
    },
    _addItem: function(id, title, closableWindow){
        var item = this.addMenuItem({title: title, image: 'data/img/gui/icon/'+id+'.png'}, function(){
            closableWindow.toggle();
        });

        closableWindow.visibilityChanged.addHandler(function(e){
            e.visible ? item.addClass('active') : item.removeClass('active');
        });

        return item;
    }
})