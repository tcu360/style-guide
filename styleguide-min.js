WebFontConfig={google:{families:["Open+Sans:400,300,700:latin"]}};(function(){var a=document.createElement("script");a.src=("https:"==document.location.protocol?"https":"http")+"://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";a.type="text/javascript";a.async="true";var b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(a,b)})();$(document).ready(function(){$("a#search-jump").click(function(){event.preventDefault();$("#live-search input").focus()});$("a").click(function(){event.preventDefault();var a=$(this).attr("href");var b=$("#jumps").outerHeight()+10;$(document).scrollTo(a,300,{offset:-+b})});$(document).keypress(function(){$("#live-search input").focus()});$("#filter").keyup(function(){var a=$(this).val(),b=0;$("#terms li").each(function(){if($(this).text().search(new RegExp(a,"i"))<0){$(this).fadeOut()}else{$(this).show();b++}});if(a!=""){if(b>1){$("#filter-count").text(b+" entries found");$("#results").show()}else{if(b==1){$("#filter-count").text("1 entry found");$("#results").show()}else{$("#filter-count").text("No entries found");$("#results").hide()}}$("li.divider").hide();$("#jumps a").fadeOut()}else{$("#filter-count").text("");$("#results").hide();$("li.divider").show();$("#jumps a").fadeIn()}})});var prompt="Search";$("#live-search input").live("blur",function(){if($(this).val()==""){$(this).val(prompt);$(this).addClass("empty")}}).live("focus",function(){if($(this).val()==prompt){$(this).val("");$(this).removeClass("empty")}});function buildGuide(f){var d="",e="",c="",a="";var b=2;$(f.feed.entry).each(function(g){if(this.gs$cell.row!=1){if(this.gs$cell.row!=b){$("ul#terms").append('<li id="'+d.toLowerCase().replace(/ /g,"-")+'"><p><strong>'+d+"</strong>"+e+a+' <a href="#'+d.toLowerCase().replace(/ /g,"-")+'" class="bookmark" title="Permalink">#</a></p></li>');a="",e="",d=""}if(this.gs$cell.col==1){d=this.content.$t;var h=this.content.$t.substring(0,1).toUpperCase();if(h!=c){c=h;$("ul#terms").append('<li id="'+c.toLowerCase()+'-section" class="divider">'+c+"</li>");$("#jumps").append('<a href="#'+c.toLowerCase()+'-section">'+c+"</a>")}b=this.gs$cell.row}else{if(this.gs$cell.col==2){e=": "+this.content.$t;b=this.gs$cell.row}else{if(this.gs$cell.col==3){a=' <a href="#'+this.content.$t.toLowerCase().replace(/ /g,"-")+'" class="alt">see '+this.content.$t+"</a>";b=this.gs$cell.row}}}}});$("ul#terms").append('<li id="'+d.toLowerCase().replace(/ /g,"-")+'"><p><strong>'+d+"</strong>"+e+a+' <a href="#'+d.toLowerCase().replace(/ /g,"-")+'" class="bookmark" title="Permalink">#</a></p></li>')};