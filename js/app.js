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
	letterBlock: _.template('<li class="divider"><a href="/letter/<%= letter %>"><%= letter %></a></li>'),

	render: function(){
		this.lastLetter = '';
		this.$el.html('');
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
	},
	filterByLetter: function(letter) {
		this.$el.html('');
		this.collection.forEach(function(styleEntry) {
			if(letter.toLowerCase() == styleEntry.get('item').toLowerCase()[0]) {
				this.renderSingle(styleEntry);
			}
		}, this);
	},
});

/* Backbone views for letters nav */
var LettersView = Backbone.View.extend({
	template: _.template('<a href="/letter/<%= letter %>"><%= letter %></a>'),
	tagName: "span",

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

/* Configure Backbone router */
var app = new(Backbone.Router.extend({
	routes: {
		"" : "index",
		"letter/:letter" : "letter"
	},
	launch: function() {
		Backbone.history.start({pushState: true});
		lettersView.render();
		$("body").removeClass("loading");
		$("#letter-nav").html(lettersView.el);
	},
	index: function() {
		multipleEntriesView.render();
		$("#entries").html(multipleEntriesView.el);
	},
	letter: function(letter) {
		multipleEntriesView.filterByLetter(letter);
		$("#entries").html(multipleEntriesView.el);
	}
}));

var styleEntries, multipleEntriesView, lettersView;
$(function() {

	// Use pushState nav on all non-absolute links
	$(document).delegate("a", "click", function(e) {
		var href = $(this).attr("href");
		var protocol = this.protocol + "//";
		if (href.slice(protocol.length) !== protocol) {
			e.preventDefault();
			app.navigate(href, {trigger : true});
		}
	});

	// Fetch data with Tabletop, then start up the router/app
	styleEntries = new StyleEntries();
	styleEntries.fetch({
		success: function() {
			multipleEntriesView = new MultipleEntriesView({collection: styleEntries});
			lettersView = new LettersView({collection: styleEntries});
			app.launch();
		}
	});
});