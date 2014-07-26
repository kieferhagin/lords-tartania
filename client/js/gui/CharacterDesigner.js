game.gui.CharacterPreview = me.Renderable.extend({
    init: function(settings, width){
        this.$windowContainer = $('<div class="character-preview"></div>');
        this.update(settings);
        this.width = width;
    },
    _createLayerUrl: function(setting){
        var url = setting.isBody ?
            '/data/img/sprite/player/'+setting.id+'/'
            : '/data/img/item/equippable/'+setting.id+'/';

        for (var i = 0; i < setting.components.length; i++){
            url += setting.components[i];

            if (i+1 === setting.components.length)
                url += '.png';
            else
                url += '/';
        }

        return url;
    },
    _createLayer: function(url, z){
        var img = $('<img style="position: absolute; z-index: '+z+'" src="'+url+'" />');

        if (this.width)
            img.css({width: this.width});

        return img;
    },
    getContainer: function(){
        return this.$windowContainer;
    },
    update: function(settings){
        var $container = this.getContainer();
        $container.empty();

        for (var i = 0; i < settings.length; i++){
            var setting = settings[i];
            var url = this._createLayerUrl(setting);
            var layer = this._createLayer(url, i);

            $container.append(layer);
        }
    }
});

game.gui.CharacterDesigner = {};

game.gui.CharacterDesigner.PreviewPanel = me.Renderable.extend({
    init: function(settings){
        var panel = this._createPanel();
        this.$windowContainer = panel.container;

        this.characterPreview = new game.gui.CharacterPreview(settings);

        panel.body.append(this.characterPreview.getContainer());
    },
    _createPanel: function(){
        var $previewContainer = $('<div class="col-md-2"></div>');
        var $previewPanel = $('<div class="panel panel-default"></div>');
        var $previewPanelTitle = $('<div class="panel-heading"><h3 class="panel-title">Preview</h3></div>');

        var $previewPanelBody = $('<div class="panel-body" style="height: 100px"></div>');

        $previewPanel.append($previewPanelTitle, $previewPanelBody);
        $previewContainer.append($previewPanel);

        return {container: $previewContainer, body: $previewPanelBody};
    },
    update: function(settings){
        this.characterPreview.update(settings);
    },
    getContainer: function(){
        return this.$windowContainer;
    }
});

game.gui.CharacterDesigner.DesignerWindow = me.Renderable.extend({
    init: function(settings, finishedHandler){
        this.settings = settings || {
            gender: 'male',
            skin: 'light',
            hair: 'short',
            hairColor: 'brown'
        };

        this._finishedHandler = finishedHandler;

        this.panels = {};

        this._modal = game.gui.createModalTemplate({
            title: "Character Designer",
            isClosable: false,
            id: "characterDesigner",
            isStatic: true
        });

        var panelDeclarations = this._generatePanelData(
            this._genderChanged.bind(this),
            this._hairColorChanged.bind(this)
        );

        var $modalBody = this._modal.$body;
        var $rowContainer = $('<div class="row"></div>');

        var $panelContainer = $('<div class="col-md-10"></div>');
        var $panelGroup = $('<div class="panel-group" id="characterDesigner"></div>');

        for (var i = 0; i < panelDeclarations.length; i++){
            var panelData = panelDeclarations[i];
            var panel = this._createPanel("characterDesigner", panelData, i === 0);

            $panelGroup.append(panel.container);

            this.panels[panelData.id] = panel;
        }

        $panelContainer.append($panelGroup);

        this.previewPanel = new game.gui.CharacterDesigner.PreviewPanel(this._generatePreviewSettings());

        $rowContainer.append($panelContainer, this.previewPanel.getContainer());

        $modalBody.append($rowContainer);

        var $modalFooter = this._modal.$footer;

        var $doneButton = $('<button class="btn btn-success pull-right">Finished</button>');
        $doneButton.click(function(e){
            this._finishedHandler(this.settings);
            this._modal.$windowContainer.modal('hide');
        }.bind(this));

        $modalFooter.append($doneButton);

        getWrapper().parent().append(this._modal.$windowContainer);
    },
    _generatePreviewSettings: function(){
        return [
            { id: 'base', isBody: true, components: [ this.settings.gender, this.settings.skin ] },
            { id: 'hair', isBody: true, components: [ this.settings.hair, this.settings.hairColor ] }
        ];
    },
    _genderChanged: function(e){
        var newGender = e.delegateTarget.getAttribute('id');

        if (newGender === this.settings.gender)
            return;

        this.settings.gender = newGender;

        var $skinPanelBody = this.panels['skin'].body;

        var newPanel = this._createPanel("characterDesigner", this._generateSkinData(this.settings.gender));
        $skinPanelBody.replaceWith(newPanel.body);

        this.panels['skin'] = newPanel;
    },
    _hairColorChanged: function(e){
        var newColor = e.delegateTarget.getAttribute('id');

        if (newColor === this.settings.hairColor)
            return;

        this.settings.hairColor = newColor;

        var $hairBody = this.panels['hair'].body;

        var newPanel = this._createPanel("characterDesigner", this._generateHairData(this.settings.hairColor));
        $hairBody.replaceWith(newPanel.body);

        this.panels['hair'] = newPanel;
    },
    _generatePanelData: function(genderChangedHandler, hairColorChangedHandler){
        return [
            this._generateGenderData(genderChangedHandler),
            this._generateSkinData('male'),
            this._generateHairColorData(hairColorChangedHandler),
            this._generateHairData('red')
        ];
    },
    _generateGenderData: function(changedHandler){
        var $genderPills = this._createPillContainer();
        var $malePill = this._createPill('male', 'Male', 'gender', 'male', changedHandler);
        var $femalePill = this._createPill('female', 'Female', 'gender', 'female', changedHandler);

        $genderPills.append($malePill, $femalePill);

        return {id: "gender", title: "Gender", jqueryObject: $genderPills};
    },
    _generateSkinData: function(gender){
        var $skinPills = this._createPillContainer();
        var skinTypes = [
            {text: "Pale", id: "pale"},
            {text: "Light", id: "light"},
            {text: "Tan", id: "tan"},
            {text: "Dark", id: "dark"}
        ];

        for (var i = 0; i < skinTypes.length; i++){
            var skinType = skinTypes[i];

            var $pill = this._createPill(skinType.id, skinType.text, "skin", gender+'/'+skinType.id);
            $skinPills.append($pill);
        }

        return {id: "skin", title: "Skin", jqueryObject: $skinPills};
    },
    _generateHairData: function(color){
        var $hairPills = this._createPillContainer();

        var hairTypes = [
            {text: "Bald", id: "bald"},
            {text: "Short", id: "short"},
            {text: "Short Two", id: "short2"},
            {text: "Medium", id: "medium"},
            {text: "Long", id: "long"},
            {text: "Fancy", id: "fancy"},
            {text: "Up", id: "up"},
            {text: "Up Two", id: "up2"}
        ];

        for (var i = 0; i < hairTypes.length; i++){
            var hairType = hairTypes[i];

            var $pill = this._createPill(hairType.id, hairType.text, "hair", hairType.id+'/'+color);
            $hairPills.append($pill);
        }

        return {id: "hair", title: "Hair", jqueryObject: $hairPills};
    },
    _generateHairColorData: function(changedHandler){
        var $hairColorPills = this._createPillContainer();

        var hairColors = [
            {text: "Brown", id: "brown"},
            {text: "Blond", id: "yellow"},
            {text: "Black", id: "black"},
            {text: "Red", id: "red"},
            {text: "Orange", id: "orange"},
            {text: "Green", id: "green"},
            {text: "Blue", id: "blue"},
            {text: "Cyan", id: "cyan"},
            {text: "Purple", id: "purple"}
        ];

        for (var i = 0; i < hairColors.length; i++){
            var hairColor = hairColors[i];

            var $pill = this._createPill(hairColor.id, hairColor.text, "hairColor", hairColor.id, changedHandler);
            $hairColorPills.append($pill);
        }

        return {id: "hairColor", title: "Hair Color", jqueryObject: $hairColorPills};
    },
    _createPillContainer: function(){
        return $('<ul class="nav nav-pills"></ul>');
    },
    _createPill: function(linkId, text, section, image, handler){
        var $pill = $('<li class="selection-col"></li>');
        var $link = $('<a data-toggle="pill" href="#"><div>'+text+'</div><img src="/data/img/gui/char_designer/'+section+'/'+image+'.png" /></a>');

        $link.attr('id', linkId);

        if (handler)
            $link.click(handler);

        $link.click(function(e){
            this.settings[section] = linkId;
            this.previewPanel.update(this._generatePreviewSettings());
        }.bind(this));

        if (this.settings[section] === linkId)
            $pill.addClass('active');

        $pill.append($link);

        return $pill;
    },
    _createPanel: function(parentId, panelData, selected){
        var $panel = $('<div class="panel panel-default"></div>');
        var $panelHeading = $('<div class="panel-heading"></div>');
        var $panelTitle = $('<h4 class="panel-title"></h4>');

        var $collapseLink = $('<a data-toggle="collapse"></a>');
        $collapseLink.text(panelData.title);
        $collapseLink.data('parent', '#'+parentId);
        $collapseLink.attr('href', '#'+panelData.id);

        $panelTitle.append($collapseLink);
        $panelHeading.append($panelTitle);
        $panel.append($panelHeading);

        var $panelCollapse = $('<div class="panel-collapse collapse"></div>');
        if (selected)
            $panelCollapse.addClass('in');

        var $panelBody = $('<div class="panel-body"></div>');

        if (panelData.jqueryObject){
            $panelBody.append(panelData.jqueryObject);
        }

        $panelCollapse.append($panelBody);
        $panelCollapse.attr('id', panelData.id);

        $panel.append($panelHeading, $panelCollapse);

        return {container: $panel, body: $panelBody};
    },
    show: function(){
        this._modal.$windowContainer.modal('show');
    }
});