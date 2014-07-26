function getWrapper(){
    return $(me.video.getWrapper());
}

game.gui.createModalTemplate = function(options){
    var $container = $('<div class="modal fade"></div>');
    var $dialog = $('<div class="modal-dialog"></div>');
    var $content = $('<div class="modal-content"></div>');
    var $contentHeader = $('<div class="modal-header"></div>');
    var $contentHeaderTitle = $('<h4 class="modal-title"></h4>');
    var $contentBody = $('<div class="modal-body"></div>');
    var $contentFooter = $('<div class="modal-footer"></div>');
    var $closeButton = $('<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>');

    if (options.id)
        $container.attr('id', options.id);

    if (options.title)
        $contentHeaderTitle.text(options.title);

    if (options.isStatic)
        $container.data('backdrop', 'static');

    $contentHeader.append($contentHeaderTitle);

    if (options.isClosable)
        $contentHeader.append($closeButton);

    $content.append($contentHeader, $contentBody, $contentFooter);
    $dialog.append($content);
    $container.append($dialog);

    return {
        $windowContainer: $container,
        $header: $contentHeader,
        $body: $contentBody,
        $footer: $contentFooter
    };
}

game.gui.ToggleWindow = me.Renderable.extend({
    init: function(){
        this.$windowContainer = $('<div></div>');
        $(me.video.getWrapper()).append(this.$windowContainer);

        this.visibilityChanged = new game.Event();
    },
    hide: function(){
        this.$windowContainer.addClass('hidden');
        this.visibilityChanged.fire({visible: false});
    },
    show: function(){
        this.$windowContainer.removeClass('hidden');
        this.visibilityChanged.fire({visible: true});
    },
    toggle: function(){
        if (this.$windowContainer.hasClass('hidden'))
            this.show();
        else
            this.hide();
    }
});

game.gui.MenuBar = me.Renderable.extend({
    init: function(bottom, right, width, height){

        var offsetRight = me.video.getPos().right - right;
        this.$windowContainer = $('<div class="menu-bar static-ui"></div>').css({
            bottom: bottom,
            left: (offsetRight - width),
            height: height,
            width: width,
            position: "absolute"
        });

        this.$pillContainer = this._createPillContainer();

        this.$windowContainer.append(this.$pillContainer);

        getWrapper().append(this.$windowContainer);

        window.addEventListener('resize', function(){
            var offsetRight = me.video.getPos().right - right;
            this.$windowContainer.css({
                left: (offsetRight - width)
            });
        }.bind(this));
    },
    _createPillContainer: function(){
        return $('<div class="nav nav-pills multi-select-menu"></div>');
    },
    addMenuItem: function(options, handler){
        var $itemContainer = $('<li></li>');
        var $itemLink = $('<a href="#"></a>').click(handler);

        if (options.title)
            $itemLink.text(options.title);

        if (options.image){
            var $image = $('<img src="'+options.image+'" />');
            $itemLink.append($image);
        }

        $itemContainer.append($itemLink);

        this.$pillContainer.append($itemContainer);

        return $itemContainer;
    }
});

game.gui.ProgressBar = me.Renderable.extend({
    init: function(settings){
        this.settings = settings;
        var bgRadius = (settings.height / 2  + settings.padding).toString() + 'px';
        var bgHeight = (settings.height + settings.padding*2).toString() + 'px';

        this.$container = $('<div class="progress-bar"></div>').css({
            "border-radius": bgRadius,
            "background-color": settings.backgroundColor,
            "padding": settings.padding.toString() + 'px',
            "width": settings.width.toString() + 'px',
            "height": bgHeight
        });

        this.$bar = $('<div></div>').css({
            "border-radius": (settings.height / 2).toString() + 'px',
            "background-color": settings.barColor,
            "height": settings.height,
            "width": "100%",
            "text-align": "left",
            "-webkit-transition": "width 0.5s",
            "transition": "width 0.5s"
        });

        this.$percentDisplay = $('<div></div>').css({
            "position": "absolute",
            "left": 10,
            "top": settings.height / 2 - 7 - settings.padding / 2
        });

        this.$bar.append(this.$percentDisplay);

        this.$container.append(this.$bar);
    },
    update: function(current, max){
        var percent = (current / max * 100).toString() + '%';
        this.$bar.css({width: percent});
        this.$percentDisplay.text(this.settings.displayName + ': ' + current + ' / ' + max);
    },
    getContainer: function(){
        return this.$container;
    }
});

game.gui.ExperienceBar = game.gui.ProgressBar.extend({
    init: function(settings){
        this.parent(settings);
    },
    update: function(current, max, lastMax){
        var progress = current - lastMax;
        var neededProgress = max - lastMax;
        var percent = (progress / neededProgress * 100).toString() + '%';

        this.$bar.css({width: percent});
        this.$percentDisplay.text(this.settings.displayName + ': ' + current + ' / ' + max);
    }
});

game.gui.StatusWindow = me.Renderable.extend({
    init: function(entity, x, y){
        this.entity = entity;
        var pos = me.video.getPos();
        this.$windowContainer = this._createWindowContainer(pos.left + x, pos.top + y);

        this.$usernameField = $('<div class="username-field gui-heading">'+this.entity.name+'</div>');
        this.$levelField = $('<div class="level-field">Level: '+this.entity.stats.level+'</div>');

        this.healthBar = new game.gui.ProgressBar({
            "backgroundColor": "#000",
            "barColor": "#ff0000",
            "height": 15,
            "padding": 2,
            "width": 225,
            "displayName": "HP"
        });

        this.powerBar = new game.gui.ProgressBar({
            "backgroundColor": "#000",
            "barColor": "#0000ff",
            "height": 15,
            "padding": 2,
            "width": 225,
            "displayName": "PP"
        });

        this.experienceBar = new game.gui.ExperienceBar({
            "backgroundColor": "#000",
            "barColor": "#666",
            "height": 15,
            "padding": 2,
            "width": 225,
            "displayName": "XP"
        });

        var $healthBarContainer = this.healthBar.getContainer();
        $healthBarContainer.css({
            "position": "absolute",
            "right": 10,
            "top": 14
        });

        var $powerBarContainer = this.powerBar.getContainer();
        $powerBarContainer.css({
            "position": "absolute",
            "right": 10,
            "top": 40
        });

        var $experienceBarContainer = this.experienceBar.getContainer();
        $experienceBarContainer.css({
            "position": "absolute",
            "right": 10,
            "top": 66
        });

        me.game.mainPlayer.healthChanged.addHandler(function(args){
            this.healthBar.update(args.hp.current, args.hp.max);
        }.bind(this));

        me.game.mainPlayer.xpChanged.addHandler(function(args){
            this.experienceBar.update(args.xp.total, args.xp.nextLevel, args.xp.lastLevel);
        }.bind(this));

        me.game.mainPlayer.levelChanged.addHandler(function(args){
            this.$levelField.text("Level: " + args.level);
        }.bind(this));

        this.healthBar.update(me.game.mainPlayer.stats.hp.current, me.game.mainPlayer.stats.hp.max);
        this.powerBar.update(25, 25);
        this.experienceBar.update(me.game.mainPlayer.stats.xp.total, me.game.mainPlayer.stats.xp.nextLevel, me.game.mainPlayer.stats.xp.lastLevel);

        this.$windowContainer.append(this.$usernameField, this.$levelField,
            $healthBarContainer, $powerBarContainer, $experienceBarContainer);

        getWrapper().append(this.$windowContainer);

        window.addEventListener('resize', function(){
            var pos = me.video.getPos();
            this.moveWindow(pos.left + x, pos.top + y);
        }.bind(this));
    },
    _createWindowContainer: function(x, y){
        return $('<div class="status-window-container static-ui"></div>').css({
            position: "absolute",
            left: x,
            top: y,
            width: 400,
            height: 100
        });
    },
    moveWindow: function(left, top){
        this.$windowContainer.css({
            "left": left,
            "top": top
        });
    }
});

game.gui.TextInput = me.Renderable.extend({
    init : function (x, y, type, length) {
        this.$input = $('<input type="' + type + '" required>').css({
            "left" : x,
            "top" : y
        });

        switch (type) {
        case "text":
            this.$input
                .attr("maxlength", length)
                .attr("pattern", "[a-zA-Z0-9_\-]+");
            break;
        case "number":
            this.$input.attr("max", length);
            break;
        }

        $(me.video.getWrapper()).append(this.$input);
    },
    destroy : function () {
        this.$input.remove();
    }
});

game.gui.ActionWindow = me.Renderable.extend({
    init: function(tabDefinitions, left, bottom, width, height){
        this.isMinimized = false;
        this.initialSize = {width: width, height: height};

        this.$tabHeaderContainer = this._createHeaderContainer();
        this.$tabContentContainer = this._createContentContainer(height);

        this.tabs = this._createTabs(tabDefinitions);

        for (var i = 0; i < tabDefinitions.length; i++){
            var tabDefinition = tabDefinitions[i];
            var header = this.tabs[tabDefinition.id].header;
            var content = this.tabs[tabDefinition.id].content;

            this.$tabHeaderContainer.append(header);
            this.$tabContentContainer.append(content);
        }

        this.$minimize = this._createMinimizeButton();

        this.$windowContainer = this._createWindowContainer(left, bottom, width, height);

        this.$windowContainer.append(this.$minimize,
            this.$tabHeaderContainer, this.$tabContentContainer);

        var $wrapper = getWrapper();
        $wrapper.append(this.$windowContainer);
    },
    _createHeaderContainer: function(){
        return $('<ul class="nav nav-pills"></ul>');
    },
    _createContentContainer: function(windowHeight){
        return $('<div class="tab-content"></div>').css({
            height: "" + (windowHeight - 60) + "px",
            "-webkit-transition": "height 0.5s",
            "transition": "height 0.5s"
        });
    },
    _createTabs: function(tabDefinitions){
        var tabs = {};

        for (var i = 0; i < tabDefinitions.length; i++){
            var tabDefinition = tabDefinitions[i];

            var $tabHeader = $('<li><a href="#'+tabDefinition.id+'" data-toggle="tab">'+tabDefinition.title+'</a></li>');
            var $tabContent = $('<div class="tab-pane action-window-pane" id="'+tabDefinition.id+'"></div>').css({
                height: "100%",
                overflow: "auto"
            });

            tabs[tabDefinition.id] = {};
            tabs[tabDefinition.id].header = $tabHeader;
            tabs[tabDefinition.id].content = $tabContent;

            if (i === 0){
                $tabHeader.addClass('active');
                $tabContent.addClass('active');
            }
        }

        return tabs;
    },
    _createMinimizeButton: function(){
        var $btn = $('<div><a href="#"><i class="fa fa-minus"></i></a></div>').css({
            position: "absolute",
            right: 8,
            top: 5
        }).click(function(e){
            e.preventDefault();
            if (this.isMinimized)
                this.maximize();
            else
                this.minimize();
        }.bind(this));

        $btn.$icon = $btn.find('i');

        return $btn;
    },
    _createWindowContainer: function(left, bottom, width, height){
        return $('<div class="action-window-container static-ui"></div>').css({
            "position": "absolute",
            "left": left,
            "bottom": bottom,
            "width": "" + width + "px",
            "height": "" + height + "px",
            "-webkit-transition": "height 0.5s",
            "transition": "height 0.5s"
        });
    },
    addMessage: function(tabId, message) {
        if (!this.tabs.hasOwnProperty(tabId))
            throw 'no tab with id of '+tabId+'exists.';

        var htmlMessage = $('<div class="actionMessage">'+message+'</div>');
        this.tabs[tabId].content.append(htmlMessage);
    },
    addMessageToMultiple: function(tabIds, message){
        if (!tabIds instanceof Array)
            throw 'tabIds must be an array';

        for (var i = 0; i < tabIds.length; i++)
            this.addMessage(tabIds[i], message);
    },
    moveWindow: function(left, bottom){
        this.$windowContainer.css({
            "left": left,
            "bottom": bottom
        });
    },
    minimize: function(){
        this.isMinimized = true;
        this.resize(this.initialSize.width, this.initialSize.height / 2);

        var $icon = this.$minimize.$icon;
        $icon.removeClass('fa-minus');
        $icon.addClass('fa-angle-up');
    },
    maximize: function(){
        this.isMinimized = false;
        this.resize(this.initialSize.width, this.initialSize.height);

        var $icon = this.$minimize.$icon;
        $icon.addClass('fa-minus');
        $icon.removeClass('fa-angle-up');
    },
    resize: function(width, height){
        this.$windowContainer.css({
            width: "" + width + "px",
            height: "" + height + "px"
        });

        this.$tabContentContainer.css({
            height: "" + (height - 60) + "px"
        });
    }
});

game.gui.ContextMenuHandler = Object.extend({
    init: function(context, actions, useDefault){
        this.context = context;
        this.actions = actions;
        this.useDefault = useDefault;

        this.clickHandler = this.click.bind(this);
    },
    click: function(e){
        if (e.button == 0 && this.useDefault){ // left button
            // Fire off primary action
            game.contextMenu.callback(this.context, this.actions[0].identifier);
        }
        else if (e.button === 2){ // right button
            var actionCopy = [];

            for (var i = 0; i < this.actions.length; i++)
                actionCopy.push(this.actions[i]);

            actionCopy.push("divider");
            actionCopy.push({title: "Cancel", identifier: "cancel"});

            var menuPos = {
                x: e.x,
                y: e.y + $(window).scrollTop()
            };

            game.contextMenu.display(this.context, menuPos, actionCopy);
        }
    }
});

game.gui.ContextMenu = me.Renderable.extend({
    init: function(callback){
        this.callback = callback;
        this.$menu = $('<ul class="dropdown-menu" role="menu"></ul>').css('position', 'absolute');

        this.hide();

        $(me.video.getWrapper()).append(this.$menu);
    },
    display: function(context, pos, actions){
        this.context = context;

        this.$menu.empty();

        this.$menu.css({
            left: pos.x,
            top: pos.y
        });

        for (var i = 0; i < actions.length; i++){
            var itemData = actions[i];
            var $item = $('<li></li>');

            if (typeof(itemData) === 'string' && itemData === 'divider'){
                $item.addClass('divider');
            } else {
                var $link = $('<a href="#" data-contextfunction="' + itemData.identifier + '">' + itemData.title + '</a>');
                var self = this;

                $link.click(function(e){
                    e.preventDefault();
                    var identifier = $(this).data('contextfunction');
                    self.callback(self.context, identifier);
                    self.hide();
                });

                $item.append($link);
            }

            this.$menu.append($item);
        }

        this.$menu.css('display', 'block');
    },
    hide: function(){
        this.$menu.css('display', 'none');
    }
});