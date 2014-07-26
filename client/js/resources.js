game.resources = [

    {name:"standard", type:"image", src: "data/img/map/standard.png"},
    {name:"standard2", type:"image", src: "data/img/map/standard2.png"},
    {name:"building_exterior", type:"image", src: "data/img/map/building_exterior.png"},
    {name:"meta_tiles", type:"image", src: "data/img/map/meta_tiles.png"},
    {name:"warrior", type:"image", src:"data/img/sprite/warrior.png"},
    {name:"ghost", type:"image", src:"data/img/sprite/ghost.png"},
    {name:"arrow", type:"image", src:"data/img/animated_tile/arrow_down.png"},

    {name:"torch", type:"image", src:"data/img/animated_tile/torch.png"},

    {name:"coins", type:"image", src: "data/img/item/currency/coins.png"},
    {name:"ringmail", type:"image", src:"data/img/item/equippable/torso/ringmail.png"},

	/* Atlases 
	 * @example
	 * {name: "example_tps", type: "tps", src: "data/img/example_tps.json"},
	 */
		
	/* Maps. 
	 * @example
	 * {name: "example01", type: "tmx", src: "data/map/example01.tmx"},
	 * {name: "example01", type: "tmx", src: "data/map/example01.json"},
 	 */

    {name:"test_map", type:"tmx", src:"data/map/test_map.tmx"},
    {name:"test_map3", type:"tmx", src:"data/map/test_map3.tmx"},
    {name:"forest_test", type:"tmx", src:"data/map/forest_test.tmx"},
    {name:"shop_test", type:"tmx", src:"data/map/shop_test.tmx"},
    {name:"secret_room", type:"tmx", src:"data/map/secret_room.tmx"}

	/* Background music. 
	 * @example
	 * {name: "example_bgm", type: "audio", src: "data/bgm/", channel : 1},
	 */	

	/* Sound effects. 
	 * @example
	 * {name: "example_sfx", type: "audio", src: "data/sfx/", channel : 2}
	 */
];

(function(res){
    var paperdollDir = 'data/img/sprite/player';

    createBases();
    createHairs();
    createItems();

    function createBases(){
        var baseDir = paperdollDir+'/base/';

        var skinTypes = ['pale', 'light', 'tan', 'dark'];

        for (var i = 0; i < skinTypes.length; i++){
            var skinType = skinTypes[i];
            var male = createImage("base_male_"+skinType, baseDir+"male/"+skinType+".png");
            var female = createImage("base_female_"+skinType, baseDir+"female/"+skinType+".png");

            res.push(male, female);
        }
    }

    function createHairs(){
        var hairDir = paperdollDir+'/hair/';

        var hairTypes = ['fancy', 'long', 'medium', 'short', 'short2', 'up', 'up2'];
        var hairColors = ['black', 'blue', 'brown', 'cyan', 'green', 'orange', 'purple', 'red', 'yellow'];

        for (var i = 0; i < hairTypes.length; i++){
            var hairType = hairTypes[i];

            for (var j = 0; j < hairColors.length; j++){
                var hairColor = hairColors[j];

                var layer = createImage("hair_"+hairType+"_"+hairColor, hairDir+hairType+'/'+hairColor+'.png');
                res.push(layer);
            }
        }
    }

    function createItems(){
        var itemDir = 'data/img/item/';

        var itemDefinitions = game.itemDefinitions;

        for (var itemId in itemDefinitions){
            if (itemDefinitions.hasOwnProperty(itemId)){
                var item = itemDefinitions[itemId];
                var imageUrl = itemDir + item.imageUrl;

                item.image = 'item_'+itemId;
                var image = createImage(item.image, imageUrl);
                res.push(image);
            }
        }
    }

    function createImage(name, src){
        return {name: name, type: "image", src: src};
    }
})(game.resources);