var game = {
    gui: {},
	data : {
		username: 'Joemommabob'
	},
	onload : function () {
        var bestResolution = me.device.isMobile ?
            this.getBestMobileResolution()
            : this.getBestDesktopResolution();

        var videoWasInitialized = me.video.init("screen",
            bestResolution.width,
            bestResolution.height,
            true, window.devicePixelRatio);

        if (!videoWasInitialized)
            return alert('Your browser does not support HTML5 canvas.');

        if (this.isDebugMode())
            this.initializeDebugMenu();

        this.disablePausingOnBlur();

        this.initializePlugins();
        this.initializeAudio();
        this.startLoading();
    },
	loaded : function () {
		me.state.set(me.state.MENU, new game.TitleScreen());
		me.state.set(me.state.PLAY, new game.PlayScreen());

        me.pool.register('mainPlayer', game.PlayerEntity, true);
        me.pool.register('ghost', game.NpcEntity, true);
        me.pool.register('torch', game.AnimatedTile, true);
        me.pool.register('teleport', game.TeleportEntity, true);
        me.pool.register('itemDrop', game.ItemDrop, true);

		// Start the game.
		me.state.change(me.state.PLAY);

        me.network = network;
        network.init();
	},
    getBestDesktopResolution: function(){
        var screenWidth = window.screen.width;

        if (screenWidth < 960)
            return {width: 640, height: 416};

        return {width: 960, height: 640};
    },
    getBestMobileResolution: function(){
        return {width: window.screen.height, height: window.screen.width};
    },
    initializeDebugMenu: function(){
        window.onReady(function () {
            me.plugin.register(debugPanel, "debug");
        });
    },
    initializePlugins: function(){
        me.plugin.register(aStarPlugin, "astar");
    },
    initializeAudio: function(){
        me.audio.init("mp3,ogg");
    },
    disablePausingOnBlur: function(){
        me.sys.stopOnBlur = false;
        me.sys.pauseOnBlur = false;
    },
    startLoading: function(){
        me.loader.onload = this.loaded.bind(this);
        me.loader.preload(game.resources);

        me.state.change(me.state.LOADING);
    },
    isDebugMode: function(){
        return document.location.hash === '#debug'
    }
};
