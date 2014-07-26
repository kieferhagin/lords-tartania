var ClosableWindow = game.gui.ToggleWindow.extend({
    init: function(title, clazz, css){
        this.parent();

        this.$windowContainer.addClass(clazz+" static-ui");
        this.$windowContainer.css(css);

        var header = this._createHeader(title);
        var closeButton = this._createCloseButton();

        this.$windowContainer.append(header, closeButton);

        this.hide();
    },
    _createCloseButton: function(){
        return $('<div><a href="#"><i class="fa fa-times"></i></a></div>').css({
            position: "absolute",
            top: 5,
            right: 8
        }).click(function(e){
            e.preventDefault();
            this.hide();
        }.bind(this));
    },
    _createHeader: function(title){
        return $('<div class="gui-heading"></div>').text(title);
    },
    _createSlot: function(x, y){
        var slot = new game.gui.ItemSlot(64, 64);

        slot.getContainer().css({
            position: "absolute",
            left: x,
            top: y
        });

        return slot;
    }
});

game.gui.ItemSlot = me.Renderable.extend({
    init: function(width, height, id){
        this.$windowContainer = $('<div class="item-slot static-ui"></div>').css({
            width: width,
            height: height,
            "border-radius": "8px"
        });

        if (id)
            this.$windowContainer.attr('id', id);

        this.$amount = $('<div class="item-slot-amount"></div>').css({
            position: "absolute",
            right: 5,
            top: 0
        });

        this.$windowContainer.append(this.$amount);

        this.item = null;
    },
    getContainer: function(){
        return this.$windowContainer;
    },
    setItem: function(item){
        var imageUrl = 'data/img/item/'+item.data.imageUrl;

        this.$windowContainer.css({
            "background-image": "url("+imageUrl+")"
        });

        if (item.count > 1){
            this.$amount.text(item.count.toString());
        }

        this.item = item;
    },
    clearItem: function(){
        this.item = null;
        this.$windowContainer.css({
            "background-image": "none"
        });
    },
    setHandler: function(handler){
        this.getContainer().mousedown(handler);
    }
});

game.gui.EquipmentWindow = ClosableWindow.extend({
    init: function(player, left, top, width, height){
        this.player = player;

        var offsetLeft = me.video.getPos().left + left;

        this.parent('Equipment', 'equipment-window', {
            "position": "absolute",
            "width": width,
            "height": height,
            "left": offsetLeft,
            "top": top
        });

        this.characterPreview = new game.gui.CharacterPreview(player.getPaperdoll(), 128);

        this.characterPreview.getContainer().css({
            left: 10,
            top: height / 2 - 80,
            position: "absolute"
        });

        player.paperdollChanged.addHandler(function(e){
            this.characterPreview.update(e.paperdoll);
        }.bind(this));

        this.$windowContainer.append(this.characterPreview.getContainer());

        this._slots = this._createSlots(this._createSlotDefinitions());

        player.equipment.itemEquipped.addHandler(function(e){
            this._slots[e.item.data.equipSlot].setItem(e.item);
        }.bind(this));

        player.equipment.itemUnequipped.addHandler(function(e){
            this._slots[e.item.data.equipSlot].clearItem();
        }.bind(this));
    },
    _createSlotDefinitions: function(){
        var cols = [], rows = [];

        for (var i = 0; i < 3; i++)
            cols.push(156 + 64*i);

        for (var i = 0; i < 4; i++)
            rows.push(30 + 64*i);

        return [
            {id: 'head', x: cols[1], y: rows[0]},
            {id: 'torso', x: cols[1], y: rows[1]},
            {id: 'legs', x: cols[1], y: rows[2]},
            {id: 'feet', x: cols[1], y: rows[3]},
            {id: 'back', x: cols[0], y: rows[0]},
            {id: 'left_hand', x: cols[0], y: rows[1]},
            {id: 'right_hand', x: cols[2], y: rows[1]},
            {id: 'gloves', x: cols[2], y: rows[2]}
        ];
    },
    _createSlots: function(slotData){
        var slots = {};

        for (var i = 0; i < slotData.length; i++){
            var slotDef = slotData[i];
            var slot = this._createSlot(slotDef.x, slotDef.y, slotDef.id);

            slot.setHandler(function(e){
                if (this.item){
                    game.contextMenu.display(this, {x: e.pageX, y: e.pageY}, [
                        {title: "Unequip", identifier: "unequip"}
                    ]);
                }
            }.bind(slot));

            this.$windowContainer.append(slot.getContainer());

            slots[slotDef.id] = slot;
        }

        return slots;
    }
});

game.gui.InventoryWindow = ClosableWindow.extend({
    init: function(player, bottom, right, width, height){
        this.player = player;

        var offsetRight =  me.video.getPos().right - right;

        this.parent('Inventory', 'inventory-window', {
            "position": "absolute",
            "width": width,
            "height": height,
            "bottom": bottom,
            "left": offsetRight - width
        });

        window.addEventListener('resize', function(){
            var offsetRight = me.video.getPos().right - right;
            this.$windowContainer.css({
                left: offsetRight - width
            });
        }.bind(this));

        this._slots = this._createSlots(12, 45, 3, 8);

        player.inventory.itemAdded.addHandler(function(e){
            this._slots[e.slotIndex].setItem(e.item);
        }.bind(this));

        player.inventory.itemRemoved.addHandler(function(e){
            this._slots[e.slotIndex].clearItem();
        }.bind(this));
    },
    _createSlots: function(startX, startY, rows, cols){
        var slots = [];

        for (var col = 0; col < cols; col++){
            var x = startX + col * 64;

            for (var row = 0; row < rows; row++){
                var y = startY + row * 64;

                var slot = this._createSlot(x, y);

                slot.setHandler(function(e){
                    if (this.item && this.item.data.isEquippable){
                        game.contextMenu.display(this, {x: e.pageX, y: e.pageY}, [
                            {title: "Equip", identifier: "equip"}
                        ]);
                    }
                }.bind(slot));

                this.$windowContainer.append(slot.getContainer());

                slots.push(slot);
            }
        }

        return slots;
    }
});