$(document).ready(function() {
    $("#searchbox").select();
    $("#averbo-title").css("font-size",$("body").width()/4);
    function search(force){
	var searchstring = $("#searchbox").val();
	if (!force && searchstring.length < 3) return;			     
	$.ajax({
            url: '/search',
            dataType: "jsonp",
            jsonpCallback: "_testcb",
            cache: false,
            timeout: 5000,
	    data: {"sq" : searchstring},
            success: function(data) {
		var d = JSON.parse(data);
		if (d.results.indexOf(":-(") != -1) {
		    $("#searchbox").focus(function() {$("#searchbox").select();});
		    $("#searchbox").focus();
		}
		$("#resultat").html(d.results.replace(/%%%/g,"\""));
            },
            error: function(jqXHR, textStatus, errorThrown) {
		alert('error ' + textStatus + " " + errorThrown);
            }
	});
    };
    
    $('#searchbox').keyup(function(e) {
	clearTimeout($.data(this, 'timer'));
	if (e.keyCode == 13) {
	    search(true);
	    $(this).focus(function() {$(this).select();});
	    $(this).focus();
	}
	else { $(this).data('timer', setTimeout(search, 500)); }
    });
});
