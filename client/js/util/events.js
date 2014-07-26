game.Event = Object.extend({
    init: function(){
        this._handlers = [];
    },
    addHandler: function(handler){
        this._handlers.push(handler);
    },
    fire: function(eventArgs){
        for(var i = 0; i < this._handlers.length; i++){
            var handler = this._handlers[i];
            handler(eventArgs);
        }
    }
});