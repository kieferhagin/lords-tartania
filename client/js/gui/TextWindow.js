game.gui.TextWindow = game.gui.ActionWindow.extend({
    init: function(){
        var pos = me.video.getPos();

        var tabs = [
            {id: 'chat', title: 'Chat'},
            {id: 'status', title: 'Status'},
            {id: 'all', title: 'All'}
        ];

        window.addEventListener('resize', function(){
            var pos = me.video.getPos();
            this.moveWindow(pos.left + 5, 5);
        }.bind(this));

        this.parent(tabs, pos.left + 5, 5, 400, 200);
    },
    addChatMessage: function(from, messageText){
        var messageHtml = from + ': ' + messageText;

        this.addMessageToMultiple(['chat', 'all'], messageHtml);
    },
    addStatusMessage: function(statusText){
        this.addMessageToMultiple(['status', 'all'], statusText);
    }
});