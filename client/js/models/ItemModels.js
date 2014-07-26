(function (_) {
    game.models = game.models || {};

    game.models.Equipment = Object.extend({
        init: function (slotIds) {
            this._slots = {};

            for (var i = 0; i < slotIds.length; i++)
                this._slots[slotIds[i]] = null;

            this.itemEquipped = new game.Event();
            this.itemUnequipped = new game.Event();
        },
        equipItem: function (item, inventory) {
            if (!item.data.isEquippable)
                throw 'Item is not equippable';

            var itemSlot = item.data.equipSlot;

            if (!itemSlot)
                throw 'Item does not have an equipSlot property';

            inventory.removeItem(item.data.id, 1);

            if (this._slots[itemSlot]){
                var slotted = this._slots[itemSlot];
                inventory.addItem(slotted);
            }

            this._slots[itemSlot] = item;

            this.itemEquipped.fire({item: item});
        },
        unequipSlot: function(slotId, inventory){
            if (this._slots[slotId]){
                if (inventory.findFreeSlot() === -1)
                    return false;

                var item = this._slots[slotId];
                this._slots[slotId] = null;
                inventory.addItem(item);

                this.itemUnequipped.fire({item: item});

                return true;
            }

            return false;
        }
    });

    game.models.Inventory = Object.extend({
        init: function (slotCount) {
            this._slots = [];

            for (var i = 0; i < slotCount; i++)
                this._slots.push(null);

            this.itemAdded = new game.Event();
            this.itemRemoved = new game.Event();
        },
        removeItem: function(id, amount){
            if (!amount)
                amount = 1;

            var matchingIndexes = this.findItemSlotIndexesById(id);

            if (matchingIndexes.length > 0){
                var firstIndex = matchingIndexes[0];
                var amountLeftToTake = this._slots[firstIndex].takeAmount(amount);

                this._slots[firstIndex] = null;

                this.itemRemoved.fire({slotIndex: firstIndex});

                if (amountLeftToTake > 0)
                    this.removeItem(id, amountLeftToTake);
            }
        },
        addItem: function (item) {
            var maxItemCount = item.data.maxStackSize;

            for (var i = 0; i < this._slots.length; i++) {
                var slottedItem = this._slots[i];

                if (slottedItem && slottedItem.data.id === item.data.id) {
                    var takeAmount = item.count;
                    var newSlottedCount = slottedItem.count + takeAmount;

                    if (newSlottedCount > maxItemCount)
                        takeAmount = maxItemCount - slottedItem.count;

                    item.takeAmount(takeAmount);
                    slottedItem.addAmount(takeAmount);

                    this.itemAdded.fire({item: slottedItem, amount: takeAmount, slotIndex: i});

                    if (item.count <= 0)
                        return true;
                }
            }

            for (var i = 0; i < this._slots.length; i++){
                if (!this._slots[i])
                    this._slots[i] = item;

                this.itemAdded.fire({item: item, amount: item.count, slotIndex: i});
                return true;
            }

            return false;
        },
        findItemSlotIndexesById: function(id){
            var indexes = [];

            for (var i = 0; i < this._slots.length; i++){
                if (this._slots[i] && this._slots[i].data.id === id)
                    indexes.push(i);
            }

            return indexes;
        },
        findFreeSlot: function(){
            for (var i = 0; i < this._slots.length; i++){
                if (!this._slots[i])
                    return i;
            }

            return -1;
        }
    });

    game.models.ItemDefinition = Object.extend({
        init: function (id, properties, pickupHandler) {
            for (var key in properties){
                if (properties.hasOwnProperty(key))
                    this[key] = properties[key];
            }

            this.id = id;
            this.name = properties.name || "UNKNOWN";
            this.pluralName = properties.pluralName || this.name;
            this.maxStackSize = properties.maxStackSize || 32;
            this.pickupHandler = pickupHandler || function (player, item) {
                player.inventory.addItem(item);
            }
        }
    });

    game.models.Item = Object.extend({
        init: function (itemDefinition, count) {
            if (count > itemDefinition.maxStackSize)
                count = Math.max(1, itemDefinition.maxStackSize);

            this.count = count;
            this.data = itemDefinition;
        },
        pickup: function (player) {
            this.data.pickupHandler(player, this);
        },
        takeAmount: function (amount) {
            var diff = amount - this.count;

            this.count -= amount;
            this.count = Math.max(0, this.count);

            return diff;
        },
        addAmount: function (amount) {
            this.count += amount;
            this.count = Math.min(this.data.maxStackSize, this.count);
        }
    });
})(_);