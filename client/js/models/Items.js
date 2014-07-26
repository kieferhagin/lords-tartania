(function() {

    game.itemDefinitions = {
        "coins": createItem("coins", {
            imageUrl: 'currency/coins.png',
            name: 'Coin',
            pluralName: 'Coins',
            maxStackSize: 1000000
        }),
        "ringmail": createItem("ringmail", {
            imageUrl: 'equippable/torso/ringmail.png',
            name: 'Ring Mail',
            maxStackSize: 1,
            isEquippable: true,
            equipSlot: 'torso'
        })
    };

    function createItem(id, properties, handler){
        return new game.models.ItemDefinition(id, properties, handler);
    }

})();



