/*global Tabletop:false, Backbone:false, _:false, Handlebars: false*/

/* Initialize Tabletop so it can be fed to Backbone */
var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0AgBobkwxAgsVdHpfSjVFX29aeU92cVBCbGJMVXVyVHc&output=html';
var spreadsheet_sheet = 'Sheet1';
var storage = Tabletop.init({
	key: public_spreadsheet_url,
	wait: true
});

/* Setup the Backbone models and specify use of Backbone.tabletopSync */
var StyleEntry = Backbone.Model.extend({
	constructor: function(attributes, options) {
		attributes.id = encodeURI(attributes.item).toLowerCase();
		Backbone.Model.apply(this, arguments);
	},
	tabletop: {
		instance: storage,
		sheet: spreadsheet_sheet
	},
	sync: Backbone.tabletopSync
});

/* Setup the Backbone collection and again specify use of Backbone.tabletopSync */
var StyleEntries = Backbone.Collection.extend({
	model: StyleEntry,
	comparator: function(styleEntry) {
		return styleEntry.get('item').toLowerCase();
	},
	tabletop: {
		instance: storage,
		sheet: spreadsheet_sheet
	},
	sync: Backbone.tabletopSync
});

/* Backbone view for single entries */
var SingleEntryView = Backbone.View.extend({
	tagname: 'li',
	initialize: function() {
		var source = $("#entry-template").html();
		this.template = Handlebars.compile(source);
		Handlebars.registerHelper('seeAlsoUrl', function(seeAlso) {
			return "/entry/" + encodeURI(seeAlso).toLowerCase();
		});
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

/* Backbone view for multiple entries */
var MultipleEntriesView = Backbone.View.extend({
	lastLetter: "",

	initialize: function() {
		var source = $('#divider-template').html();
		this.letterBlock = Handlebars.compile(source);
	},
	render: function(){
		this.empty();
		this.collection.forEach(this.renderSingle, this);
		return this;
	},
	renderSingle: function(styleEntry){
		var singleEntryView = new SingleEntryView({model: styleEntry});
		var currentLetter = styleEntry.get('item').toUpperCase()[0];
		if(this.lastLetter !== currentLetter) {
			this.$el.append(this.letterBlock({letter: currentLetter}));
			this.lastLetter = currentLetter;
		}
		this.$el.append(singleEntryView.render().el);
	},
	empty: function(){
		this.lastLetter = '';
		this.$el.html('');
	},
	filterByLetter: function(letter) {
		this.empty();
		this.collection.forEach(function(styleEntry) {
			if(letter.toLowerCase() === styleEntry.get('item').toLowerCase()[0]) {
				this.renderSingle(styleEntry);
			}
		}, this);
	},
	filterByString: function(search) {
		this.empty();
		this.collection.forEach(function(styleEntry) {
			search = search.toLowerCase();
			if(~styleEntry.get('item').toLowerCase().indexOf(search) || ~styleEntry.get('entry').toLowerCase().indexOf(search)){
				this.renderSingle(styleEntry);
			}
		}, this);
	}
});

/* Backbone views for letters nav */
var LettersView = Backbone.View.extend({
	tagName: "span",

	initialize: function() {
		var source = $('#letter-template').html();
		this.template = Handlebars.compile(source);
	},
	render: function(){
		/* Reduce the collection so we just have an array of letters */
		var lastLetter;
		this.collection.forEach(function(styleEntry, currentLetter) {
			var currentLetter = styleEntry.get('item').toUpperCase()[0];
			if(lastLetter !== currentLetter) {
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
		"letter/:letter" : "letter",
		"entry/*entry" : "entry",
		"search/*search" : "search"
	},
	initialize: function() {
		$("#filter").on("keyup", this, _.debounce(function(e) {
			var searchUrl = "search/" + encodeURI($(this).val());
			e.data.navigate(searchUrl, {trigger: true});
		}, 350));
	},
	launch: function() {
		Backbone.history.start({pushState: true});
		lettersView.render();
		$("body").removeClass("loading");
		$("#jumps").prepend(lettersView.el);
	},
	index: function() {
		multipleEntriesView.render();
		$("#terms").html(multipleEntriesView.el);
	},
	letter: function(letter) {
		multipleEntriesView.filterByLetter(letter);
		$("#terms").html(multipleEntriesView.el);
	},
	entry: function(entry) {
		var styleEntry = styleEntries.get(encodeURI(entry));
		var singleEntryView = new SingleEntryView({model : styleEntry});
		singleEntryView.render();
		$("#terms").html(singleEntryView.el);
	},
	search: function(search) {
		if(search) {
			multipleEntriesView.filterByString(search);
			$("#terms").html(multipleEntriesView.el);
		}
		else {
			this.navigate("", {trigger: true});
		}
	}
}))();

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