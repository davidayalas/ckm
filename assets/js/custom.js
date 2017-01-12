$(document).ready(function(){

	var page = $("body").attr("id");

	switch(page){

		case "home":
			home();
			break;
		case "noticies":
			getNoticies(-1);
			break;		
		case "noticia":
			noticia();
			break;
		case "galeria":
			getGaleria();
			break;
		case "agenda":
			getAgenda(-1);
			break;
	}

	validateForm();

});

function home(){

	//NEWS
	getNoticies(3);

	//AGENDA
	getAgenda(3);

	//FLICKR
	$.getJSON("https://script.google.com/macros/s/AKfycbxWufJeg6kgXLmVOswRv3Wzreqidcel1jTqCJan-WXgCepwJX2q/exec?home=true&callback=?", function(data){
		var stb = [];
		var it;
		var src;

		for(var i=0;i<data.photoset.photo.length;i++){
			it = data.photoset.photo[i];
			src = "http://farm"+it.farm+".static.flickr.com/"+it.server+"/"+it.id+"_"+it.secret;
			stb.push('<article><a href="',src,'_b.jpg" class="image featured"><img src="',src,'_n.jpg" alt="" /></a><!--header><h3><a href="#">',it.title,'</a></h3></header--><p>',it.title,'<br />',it.description._content,'</p></article>');
			if(i>30){
				break;
			}
		}
		if(stb.length>0){
			$(stb.join("")).appendTo($(".flickr .reel"));
		}
	});

}

function getNoticies(limit){
	$.getJSON("https://script.google.com/macros/s/AKfycbyW8D0DQuB2Oy3IQ1ppUNf9vPPsKSeQmNnxna7qJEOrznQJc5g/exec?callback=?", function(data){
		var stb = [];
		var it;
		var src;
		var _date;
		for(var i=0;i<data.news.length;i++){
	 		_date = new Date(data.news[i].data);
			_date = _date.getDate() + "/" + (_date.getMonth()+1) + "/" + _date.getFullYear();
			stb.push('<article><a href="new.html?',data.news[i].id,'"><strong>',data.news[i].titol,'</strong></a><p>',_date,'<br />',data.news[i].lead,'</p></article>');
			if(i===limit){break;}
		}
		if(stb.length>0){
			$(stb.join("")).appendTo($(".news"));
		}
	});
}

function noticia(){

	var id = "";
	if(location.search){
		id=location.search.slice(1);
	}

	//NEWS
	$.getJSON("https://script.google.com/macros/s/AKfycbyW8D0DQuB2Oy3IQ1ppUNf9vPPsKSeQmNnxna7qJEOrznQJc5g/exec?callback=?&newid="+id, function(data){
		var stb = [];
		var it;
		var src;
	
		if(data.news.length===0){
			return;
		}
		var _date = new Date(data.news[0].data);
		_date = _date.getDate() + "/" + (_date.getMonth()+1) + "/" + _date.getFullYear();

		$("h1.title").html(data.news[0].titol);
		$(".date").html(_date);
		$(".lead").html(data.news[0].lead);
		$(".desc").html(data.news[0].descripcio);

		for(var i=0,z=data.news[0].imatge.length;i<z;i++){
			$('<span class="image" style="margin-left:.5em"><img src="'+data.news[0].imatge[i]+'" alt="" /></span>').appendTo($("#main .images"));

		}

	});

}

function getAgenda(limit){
	$.getJSON("https://script.google.com/macros/s/AKfycbyW8D0DQuB2Oy3IQ1ppUNf9vPPsKSeQmNnxna7qJEOrznQJc5g/exec?callback=?&agenda=true", function(data){
		var stb = [];
		var it;
		var src;
		var _date;

		for(var i=0;i<data.actes.length;i++){
			_date = new Date(data.actes[i].data);
			_date = (!data.actes[i].data_aproximada?_date.getDate() + "/":"") + (_date.getMonth()+1) + "/" + _date.getFullYear();
			stb.push('<article><strong>',data.actes[i].acte,'</strong></a><p>',_date,' ',data.actes[i].hora,' - ',data.actes[i].lloc,'</p></article>');
			if(i===limit){break;}
		}

		if(stb.length>0){
			$(stb.join("")).appendTo($(".agenda"));
		}
	});
}



/* FLICKR MANAGEMENT */

$(window).on('popstate', function(e){
	//console.log("back button")
	var page = 0;

	if(location.hash){
		page = parseInt(location.hash.slice(1))
		if(isNaN(page)){
			page = 0;
		}
	}	
	//getGaleria();
	galeriaPage(null, page);
});

function getGaleria(serverpage){

	var page = 0;
	window.ckm_fotospage = 20;
	window.ckm_server_perpage = window.ckm_server_perpage || 100;

	if(location.hash){
		page = parseInt(location.hash.slice(1))
		if(isNaN(page)){
			page = 0;
		}
	}	

	window.ckm_currentpage = page;

	if(page>0 && !serverpage){
		serverpage = Math.ceil((ckm_fotospage*(page+1))/ckm_server_perpage);
	}else{
		serverpage = serverpage || 1;
	}

	//FLICKR
	$.getJSON("https://script.google.com/macros/s/AKfycbxWufJeg6kgXLmVOswRv3Wzreqidcel1jTqCJan-WXgCepwJX2q/exec?callback=?&page="+serverpage, function(data){

		if(!data || !data.photoset || !data.photoset.total || data.photoset.total===0){
			return;
		}

		window["galeriaFotos_"+serverpage] = data.photoset;
		window.ckm_server_perpage = data.photoset.perpage;
		window.ckm_gallery_pages = Math.ceil(data.photoset.total/ckm_fotospage);

		if(serverpage===1){
			galeriaPage(null, ckm_currentpage);
		}else{
			//console.log(data.photoset)
			drawGaleriaPage(data.photoset)		
		}
	});

}

function galeriaPage(_add, page){

	window.ckm_currentpage = window.ckm_currentpage || 0;

	console.log("galeriaPage " + _add + " " +page)
	console.log("current " + ckm_currentpage)

	if(_add){
		ckm_currentpage += _add;
		history.pushState({"page":(ckm_currentpage)}, "page " + (ckm_currentpage), "#" + (ckm_currentpage));
	}else{
		ckm_currentpage = page;
	}

	console.log(ckm_currentpage)

	var new_server_page = Math.ceil((ckm_fotospage*(ckm_currentpage+1))/ckm_server_perpage);
	if(!window["galeriaFotos_"+new_server_page]){
		console.log("get new server page " + new_server_page)
		getGaleria(new_server_page)
	}else{
		drawGaleriaPage(window["galeriaFotos_"+new_server_page])
	}	

	return false;
}

function drawGaleriaPage(galeria){
	var stb = [];
	var it;
	var src;
	var src_thumb;
	var cssclass = "";
	
	var real_server_page = Math.ceil((ckm_fotospage*(ckm_currentpage+1))/ckm_server_perpage);
	var inici = (ckm_currentpage*ckm_fotospage)-((real_server_page-1)*ckm_server_perpage);
	var limit = inici+ckm_fotospage;

	if(limit>galeria.perpage){
		limit = galeria.perpage;
	}

	$(".uniform div").remove();


	console.log("server-->"+real_server_page)
	console.log("client-->"+ckm_currentpage)

	for(var i=inici;i<limit;i++){
		if(!galeria.photo[i]){
			break;
		}
		it = galeria.photo[i];
		if(it.media==="photo"){
			src = "http://farm"+it.farm+".static.flickr.com/"+it.server+"/"+it.id+"_"+it.secret+"_b.jpg";
			src_thumb = "http://farm"+it.farm+".static.flickr.com/"+it.server+"/"+it.id+"_"+it.secret+"_q.jpg";
		}else{
			src = "https://www.flickr.com/photos/ckmontmelo/"+it.id+"/player/";
			src_thumb = "http://farm"+it.farm+".static.flickr.com/"+it.server+"/"+it.id+"_"+it.secret+"_q.jpg";
		}


		console.log(src)
		//stb.push('<article><a href="',src,'_b.jpg" class="image featured"><img src="',src,'_n.jpg" alt="" /></a><!--header><h3><a href="#">',it.title,'</a></h3></header--><p>',it.title,'<br />',it.description._content,'</p></article>');
		cssclass = ((i+1)%4===0?"3u$":"3u");
		stb.push('<div class="',cssclass,' 12u(xsmall)"><span class="image fit small-font"><a class="align-center" href="',src,'"><img src="',src_thumb,'" alt="',it.title,'" /></a><p>',it.title,'</p></span></div>');
	}

	if(stb.length>0){
		$(stb.join("")).appendTo($(".uniform"));
	}

	if($(".backpage").size()===0){
		$("<div class='12u align-center'><a href='#' class='backpage' onclick='return galeriaPage(-1)'>&lt; anterior</a>&nbsp;&nbsp;<a href='#' class='nextpage' onclick='return galeriaPage(1)'>següent &gt;</a></div>").appendTo($(".uniform"));
	}

	if(ckm_currentpage+1>=ckm_gallery_pages){
		$(".nextpage").addClass("disabled");
	}else{
		$(".nextpage").removeClass("disabled");
	}

	if(ckm_currentpage===0){
		$(".backpage").addClass("disabled");
	}else{
		$(".backpage").removeClass("disabled");
	}	
}

function validateForm(){
  $("form#contacte").validate({
    // Specify validation rules
    rules: {
      // The key name on the left side is the name attribute
      // of an input field. Validation rules are defined
      // on the right side
      nom: "required",
      email: {
        required: true,
        email: true
      },
      missatge: {
        required: true,
        minlength: 50
      }
    },

    // Specify validation error messages
    messages: {
      nom: "Introduïu el vostre nom",
      email: "Introduïu un correu electrònic vàlid",
      missatge: {
        required: "Introduïu el vostre missatge",
        minlength: "El vostre missatge ha de contenir 50 caràcters com a mínim"
      }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      form.submit();
    }
  });

}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-89927337-1', 'auto');
ga('send', 'pageview');
