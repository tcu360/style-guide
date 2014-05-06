// load Web fonts
WebFontConfig = {
	google: { families: [ 'Open+Sans:400,300,700:latin' ] }
};
(function() {
	var wf = document.createElement('script');
	wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	wf.type = 'text/javascript';
	wf.async = 'true';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(wf, s);
})();
$(document).ready(function () {
	// activate search box when search link is clicked
	$('a#search-jump').click(function() {
		event.preventDefault();
		$('#live-search input').focus();
	});
	// use scrollTo when links are clicked
	$('a').click(function() {
		event.preventDefault();
		var it = $(this).attr('href');
		var offset = $('#jumps').outerHeight() + 10;
		$(document).scrollTo(it, 300, {offset:- + offset});
	});
	// activate search box when typing occurs
	$(document).keypress(function() {
	  $('#live-search input').focus();
	});
	// search feature; adapted from http://www.designchemical.com/blog/index.php/jquery/live-text-search-function-using-jquery/
	$("#filter").keyup(function(){
		// retrieve the input field text and reset the count to zero
		var filter = $(this).val(), count = 0;
		// loop through the comment list
		$("#terms li").each(function(){
			// if the list item does not contain the text phrase fade it out
			if ($(this).text().search(new RegExp(filter, "i")) < 0) {
				$(this).fadeOut();
			}
			// show the list item if the phrase matches and increase the count by 1
			else {
				$(this).show();
				count++;
			}
		});
		// if a search is entered
		if(filter != "") {
			if(count > 1) {
				$("#filter-count").text(count + ' entries found');
				// show results box
				$('#results').show();
			}
			else if(count == 1) {
				$('#filter-count').text('1 entry found');
				// show results box
				$('#results').show();
			}
			else {
				$('#filter-count').text('No entries found');
				// hide results box
				$('#results').hide();
			}
			// hide dividers
			$('li.divider').hide();
			$('#jumps a').fadeOut();
		}
		// if the search box is empty
		else {
			$('#filter-count').text("");
			$('#results').hide();
			$('li.divider').show();
			$('#jumps a').fadeIn();
		}
	});
	// show/hide search box
	var prompt = 'Search';
	$("#live-search input").on("blur", function(){
		if ($(this).val() == ""){
			$(this).val(prompt);
			$(this).addClass('empty');
		}
	}).on("focus", function(){
		if ($(this).val() == prompt){
			$(this).val("");
			$(this).removeClass('empty');
		}
	});
});
// build guide from gdocs spreadsheet
function buildGuide(data) {
	var item = "", def = "", letter = "", also = "";
	var currRow = 2; // set to first row in spreadsheet with entries
	$(data.feed.entry).each(function(index) {
		// ignore header row
		if(this.gs$cell.row != 1) {
			// append the entry if it's a new row
			if(this.gs$cell.row != currRow) {
				$('ul#terms').append('<li id="' + item.toLowerCase().replace(/ /g, "-") + '"><p><strong>' + item + '</strong>' + def + also + ' <a href="#' + item.toLowerCase().replace(/ /g, "-") + '" class="bookmark" title="Permalink">#</a></p></li>');            
				// reset variables
				also = "", def = "", item = "";
			}
			// entry name
			if(this.gs$cell.col == 1) {
				item = this.content.$t;
				// add a divider, if one is needed
				var currLetter = this.content.$t.substring(0,1).toUpperCase();
				if(currLetter != letter) {
					letter = currLetter;
					$('ul#terms').append('<li id="' + letter.toLowerCase() + '-section" class="divider">' + letter + '</li>');
					// add a link to the jump bar for each new letter
					$('#jumps').append('<a href="#' + letter.toLowerCase() + '-section">' + letter + '</a>');
				}
				currRow = this.gs$cell.row;
			}
			// entry definition
			else if(this.gs$cell.col == 2) {
				def = ': ' + this.content.$t;
				currRow = this.gs$cell.row;
			}
			// see also, if necessary
			else if(this.gs$cell.col == 3) {
				also = ' <a href="#' + this.content.$t.toLowerCase().replace(/ /g, "-") + '" class="alt">see ' + this.content.$t + '</a>';
				currRow = this.gs$cell.row;
			}
		}
	});
	// write the last row
	$('ul#terms').append('<li id="' + item.toLowerCase().replace(/ /g, "-") + '"><p><strong>' + item + '</strong>' + def + also + ' <a href="#' + item.toLowerCase().replace(/ /g, "-") + '" class="bookmark" title="Permalink">#</a></p></li>');            
}