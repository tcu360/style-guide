/* Initialize Tabletop so it can be fed to Backbone */
var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0AgBobkwxAgsVdHpfSjVFX29aeU92cVBCbGJMVXVyVHc&output=html';
var spreadsheet_sheet = 'Sheet1';
var storage = Tabletop.init({
	key: public_spreadsheet_url,
	wait: true
});

/* Setup the Backbone models and specify use of Backbone.tabletopSync */
var StyleEntry = Backbone.Model.extend({
	idAttribute: 'item',
	tabletop: {
		instance: storage,
		sheet: spreadsheet_sheet
	},
	sync: Backbone.tabletopSync
});

/* Setup the Backbone collection and again specify use of Backbone.tabletopSync */
var StyleEntries = Backbone.Collection.extend({
	model: StyleEntry,
	comparator: function(entry) {
		return entry.get('item').toLowerCase();
	},
	tabletop: {
		instance: storage,
		sheet: spreadsheet_sheet
	},
	sync: Backbone.tabletopSync
});

/* Backbone view for single entries */
var SingleEntryView = Backbone.View.extend({
	tagname: 'div',
	className: 'entry',
	template: _.template("<p><strong><%= item %></strong>: <%= entry %></p>"),

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

/* Backbone view for multiple entries */
var MultipleEntriesView = Backbone.View.extend({
	lastLetter: "",
	letterBlock: _.template('<li class="divider"><%= letter %></li>'),

	render: function(){
		this.collection.forEach(this.renderSingle, this);
		return this;
	},
	renderSingle: function(styleEntry){
		var singleEntryView = new SingleEntryView({model: styleEntry});
		var currentLetter = styleEntry.get('item').toUpperCase()[0];
		if(this.lastLetter != currentLetter) {
			this.$el.append(this.letterBlock({letter: currentLetter}));
			this.lastLetter = currentLetter;
		}
		this.$el.append(singleEntryView.render().el);
	}
});

/* Backbone views for letters nav */
var LettersView = Backbone.View.extend({
	template: _.template('<a href="#"><%= letter %></a>'),

	render: function(){
		/* Reduce the collection so we just have an array of letters */
		var letters = [], lastLetter;
		this.collection.forEach(function(styleEntry, currentLetter) {
			var currentLetter = styleEntry.get('item').toUpperCase()[0];
			if(lastLetter != currentLetter) {
				lastLetter = currentLetter;
				this.$el.append(this.template({letter: currentLetter}));
			}
		}, this);
		return this;
	}
});

$(function() {
	/* Pull the entries from Google Spreadsheets */
	var styleEntries = new StyleEntries();
	styleEntries.fetch({
		success: renderAll
	});

	/* And render them all */
	function renderAll() {
		var multipleEntriesView = new MultipleEntriesView({collection: styleEntries});
		$("#entries").html(multipleEntriesView.render().el);

		var lettersView = new LettersView({collection: styleEntries});
		$("#jumps").html(lettersView.render().el);
	}
});