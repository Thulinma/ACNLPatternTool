$(function(){

  var goingToRefresh = false;
  function triggerRefresh(){
    if (goingToRefresh){clearTimeout(goingToRefresh);}
    goingToRefresh = setTimeout(function(){ACNL.qr($("#qr"));}, 3000);
  }
  
  function noRefresh(){
    if (goingToRefresh){clearTimeout(goingToRefresh);}
    goingToRefresh = false;
  }
  
  var chosen_color = 0;

  function newIcon(data){
    ACNL.load(data);
    for (var i = 0; i < 15; i++){
      $("#col"+i).css("background-color", ACNL.getColor(i));
    }
    chosen_color = 0;
    $(".col_pal").attr("class", "col_pal").each(function(){
      if ($(this).data("color") == ACNL.getIndex(chosen_color)){
        $(this).attr("class", "col_pal picked");
      }
    });
    $("#icon_title").val(ACNL.getTitle());
    $("#icon_creator").val(ACNL.getCreator());
    $("#icon_creator_id").val(ACNL.getCreatorID());
    $("#icon_town").val(ACNL.getTown());
    $("#icon_town_id").val(ACNL.getTownID());
    ACNL.draw($("#acnl_icon")[0]);
    ACNL.draw($("#acnl_icon_zoom")[0]);
    ACNL.draw($("#acnl_icon_zoomier")[0]);
    triggerRefresh();
  };
  
  $("#icon_title").keyup(function(){
    if ($(this).val().length > 20){
      $(this).val($(this).val().substr(0, 20));
    }
    ACNL.setTitle($(this).val());
    triggerRefresh();
  });

  $("#icon_creator").keyup(function(){
    if ($(this).val().length > 10){
      $(this).val($(this).val().substr(0, 10));
    }
    ACNL.setCreator($(this).val());
    triggerRefresh();
  });

  $("#icon_town").keyup(function(){
    if ($(this).val().length > 10){
      $(this).val($(this).val().substr(0, 10));
    }
    ACNL.setTown($(this).val());
    triggerRefresh();
  });

  $("#icon_creator_id").keyup(function(){
    ACNL.setCreatorID($(this).val());
    triggerRefresh();
  });

  $("#icon_town_id").keyup(function(){
    ACNL.setTownID($(this).val());
    triggerRefresh();
  });

  $("#unknown_id").keyup(function(){
    ACNL.setUnknownID($(this).val());
    triggerRefresh();
  });

  $("#acnl_gen").click(function(){
    ACNL.download();
  });
  
  var drawing = false;
  $("#acnl_icon, #acnl_icon_zoom, #acnl_icon_zoomier").click(function(e){
    var xpos = 0, ypos = 0;
    if (e.offsetX == undefined){
      xpos = e.pageX-$(e.target).offset().left;
      ypos = e.pageY-$(e.target).offset().top;
    }else{
      xpos = e.offsetX;
      ypos = e.offsetY;
    }
    var x = Math.floor(xpos / ($(this).width() / ACNL.getWidth()));
    var y = Math.floor(ypos / ($(this).height() / ACNL.getWidth()));
    ACNL.setColor(x, y, chosen_color);
    triggerRefresh();
  }).mousemove(function(e){
    if (drawing && e.which == 1){
      noRefresh();
      var xpos = 0, ypos = 0;
      if (e.offsetX == undefined){
        xpos = e.pageX-$(e.target).offset().left;
        ypos = e.pageY-$(e.target).offset().top;
      }else{
        xpos = e.offsetX;
        ypos = e.offsetY;
      }
      var x = Math.floor(xpos / ($(this).width() / ACNL.getWidth()));
      var y = Math.floor(ypos / ($(this).height() / ACNL.getWidth()));
      ACNL.setColor(x, y, chosen_color);
    }
  }).mouseup(function(){
    drawing = false;
    triggerRefresh();
  }).mousedown(function(){
    drawing = true;
  });
  
  for (var i = 0; i < 15; i++){
    $("#col"+i).data("col", i).click(function(){
      $(".col_block").attr("class", "col_block");
      $(this).attr("class", "col_block picked");
      chosen_color = $(this).data("col");
      $(".col_pal").attr("class", "col_pal").each(function(){
        if ($(this).data("color") == ACNL.getIndex(chosen_color)){
          $(this).attr("class", "col_pal picked");
        }
      });
    });
  }

  $(".question").click(function(){
    $(this).children(".ans").toggle();
  });
  $(".ans").hide();
  
  function create_block(p){
    var block = $("<div>").attr("class", "col_pal_block");
    for (var i = 0; i < 9; i++){
      block.append($("<div>").attr("class", "col_pal").css("background-color", ACNL.getPal(p+i)).data("color", p+i));
    }
    return block;
  };
  
  for (var i = 0x00; i < 0xFF; i += 0x10){
    $("#color_pal").append(create_block(i));
  }
  var grey_row = $("<div>").attr("class", "col_pal_row");
  for (var i = 0; i < 15; i++){
    grey_row.append($("<div>").attr("class", "col_pal").css("background-color", ACNL.getPal((i << 4) + 0x0F)).data("color", (i << 4) + 0x0F));
  }
  $("#color_pal").append(grey_row);
  $(".col_pal").click(function(){
    $(".col_pal").attr("class", "col_pal");
    $(this).attr("class", "col_pal picked");
    var newindex = $(this).data("color");
    ACNL.setIndex(chosen_color, newindex);
    $("#col"+chosen_color).css("background-color", ACNL.getColor(chosen_color));
    triggerRefresh();
  });

  /*
  $(".pattern_preset").each(function(){
    var name = $(this).data("name");
    var pattern = $(this).data("pattern");
    $("#load_pattern").append($("<option>").text(name).attr("value", pattern));
    $(this).remove();
  });

  $("#load_pattern").change(function(){
    newIcon(window.atob($("#load_pattern").val()));
  }).change();
  */

  newIcon(window.atob("RQBtAHAAdAB5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVAG4AawBuAG8AdwBuAAAAAAAAAAAAVQBuAGsAbgBvAHcAbgAAAAAAAABeCw8fLz9PX29/j5+vv8/f73YKCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="));

  $("#creator_copy").click(function(){
    ACNL.copyCreator();
    $("#creator_copy").val("Creator copied!");
    setTimeout(function(){$("#creator_copy").val("Copy creator");}, 1000);
    $("#creator_paste").val("Paste creator ("+ACNL.getCreator()+" / "+ACNL.getTown()+")");
  });

  $("#creator_paste").click(function(){
    ACNL.pasteCreator();
    $("#icon_creator").val(ACNL.getCreator());
    $("#icon_creator_id").val(ACNL.getCreatorID());
    $("#icon_town").val(ACNL.getTown());
    $("#icon_town_id").val(ACNL.getTownID());
    triggerRefresh();
  });
  
  var multi_icon = "";
  function parseFiles(files){
    if (files[0].type.match('image.*')){
      var r = new FileReader();
      r.onload = function(re) {
        qrcode.callback = function(r){
          
          if (r.length < 0x21C){
            alert("Sorry, I can't recognize this as a valid pattern. :-(");
            return;
          }
          
          if (r.length == 0x26C){//regular pattern
            newIcon(r);
            return;
          }
          if (r.length == 0x21C){//multi-part pattern
            multi_icon += r;
            if (multi_icon.length == 0x21C){alert("Please input the second code next."); return;}
            if (multi_icon.length == 0x438){alert("Please input the third code next."); return;}
            if (multi_icon.length == 0x654){alert("Please input the last code next."); return;}
            if (multi_icon.length == 0x870){newIcon(multi_icon); multi_icon = ""; return;}
            multi_icon = "";
            alert("Something, somewhere, went terribly wrong. Please start over. :-(");
            return;
          }
          
          alert("Whoah! That code doesn't look right, but I think I can fix it, attempting fix...");
          
          if (r[0x68] == 0xA){
            newIcon(r);
            return;
          }else{
            multi_icon += r.substr(0, 0x21C);
            if (multi_icon.length == 0x21C){alert("Please input the second code next."); return;}
            if (multi_icon.length == 0x438){alert("Please input the third code next."); return;}
            if (multi_icon.length == 0x654){alert("Please input the last code next."); return;}
            if (multi_icon.length == 0x870){newIcon(multi_icon); multi_icon = ""; return;}
            multi_icon = "";
            alert("Something, somewhere, went terribly wrong. Please start over. :-(");
            return;
          }
          
        };
        qrcode.decode(re.target.result);
      }
      r.readAsDataURL(files[0]);
    }else{
      //assume ACNL file
      var r = new FileReader();
      r.onload = function(re) { 
        newIcon(re.target.result);
      }
      r.readAsBinaryString(files[0]);
    }
  };
  
  $("#files").change(function(e){
    parseFiles(e.target.files);
    $("#files").val("");
  });
  
  function palette_top(imgdata){
    var palette = [];
    for (var i = 0; i < 256; i++){palette.push({"n":i, "c":0});}
    function myPal(r, g, b){
      var best = 120;//there's no worse best score than 119
      var bestno = 0;
      for (var i = 0; i < 256; i++){
        var toMatch = ACNL.getPal(i);
        if (toMatch.length < 7){continue;}
        var x = parseInt(toMatch.substr(1, 2), 16);
        var y = parseInt(toMatch.substr(3, 2), 16);
        var z = parseInt(toMatch.substr(5, 2), 16);
        var match = Math.abs(x - r) + Math.abs(y - g) + Math.abs(z - b);
        if (match < best){
          best = match;
          bestno = i;
        }
      }
      palette[bestno].c++;
    };
    for (var i = 0; i < 4096; i+=4){myPal(imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]);}
    palette.sort(function(a, b){
      if (a.c > b.c){return -1;}
      if (a.c < b.c){return 1;}
      return 0;
    });
    while (palette.length > 15){palette.pop();}
    for (var i = 0; i < 15; i++){
      ACNL.setIndex(i, palette[i].n);
    }
  };
  
  function reColorize(imgdata){
    function myIndex(r, g, b){
      var best = 255*3;
      var bestno = 0;
      for (var i = 0; i < 15; i++){
        var toMatch = ACNL.getPal(ACNL.getIndex(i));
        if (toMatch.length < 7){continue;}
        var x = parseInt(toMatch.substr(1, 2), 16);
        var y = parseInt(toMatch.substr(3, 2), 16);
        var z = parseInt(toMatch.substr(5, 2), 16);
        var match = Math.abs(x - r) + Math.abs(y - g) + Math.abs(z - b);
        if (match < best){
          best = match;
          bestno = i;
        }
      }
      return bestno;
    };
    for (var i = 0; i < 4096; i+=4){
      var x = Math.floor(i / 4) % 32;
      var y = Math.floor(Math.floor(i / 4) / 32);
      ACNL.setColor(x, y, myIndex(imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]));
    }
    for (var i = 0; i < 15; i++){
      $("#col"+i).css("background-color", ACNL.getColor(i));
    }
    chosen_color = 0;
    $(".col_pal").attr("class", "col_pal").each(function(){
      if ($(this).data("color") == ACNL.getIndex(chosen_color)){
        $(this).attr("class", "col_pal picked");
      }
    });
  };

  function palette_lowest(imgdata){
    var palette = [];
    var prepixels = [];
    for (var i = 0; i < 256; i++){palette.push({"n":i, "c":0});}
    function myPal(pixel, r, g, b){
      var matches = {};
      var best = 120;//there's no worse best score than 119
      var bestno = 0;
      for (var i = 0; i < 256; i++){
        var toMatch = ACNL.getPal(i);
        if (toMatch.length < 7){continue;}
        var x = parseInt(toMatch.substr(1, 2), 16);
        var y = parseInt(toMatch.substr(3, 2), 16);
        var z = parseInt(toMatch.substr(5, 2), 16);
        var match = Math.abs(x - r) + Math.abs(y - g) + Math.abs(z - b);
        if (match < best){
          best = match;
          bestno = i;
        }
        if (match < 120){//this way, we get 1 or more matches, guaranteed
          matches[i.toString()] = match;
        }
      }
      palette[bestno].c++;
      prepixels[pixel] = matches;
    };
    for (var i = 0; i < 4096; i+=4){myPal(i/4, imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]);}
    palette.sort(function(a, b){
      if (a.c > b.c){return -1;}
      if (a.c < b.c){return 1;}
      return 0;
    });
    while (palette.length > 40){palette.pop();}
    var best_chosen = [];
    var scor_chosen = 0x200000;//we can always do better than this
    alert("Optimizing happens after you click ok - please stand by as this might take a while.");
    for (var z = 0; z < 4000 && palette.length > 16; z++){
      var chosen_ones = [];
      //pick random colors out of the top 40
      while (chosen_ones.length < 15 && chosen_ones.length < palette.length){
        var next = palette[Math.floor(Math.random()*palette.length)].n;
        if ($.inArray(next, chosen_ones) != -1){continue;}
        chosen_ones.push(next);
      }
      //score this random selection
      var curr_score = 0;
      for (var p in prepixels){
        var low_pixel = 750;
        for (var m in prepixels[p]){
          if ($.inArray(parseInt(m), chosen_ones) == -1){continue;}
          if (prepixels[p][m] < low_pixel){low_pixel = prepixels[p][m];}
        }
        curr_score += low_pixel;
        if (curr_score >= scor_chosen){break;}
      }
      if (curr_score < scor_chosen){
        scor_chosen = curr_score;
        best_chosen = chosen_ones;
      }
    }
    
    for (var i = 0; i < 15 && i < best_chosen.length; i++){
      ACNL.setIndex(i, best_chosen[i]);
    }
  };
  
  function palette_grey(imgdata){
    for (var i = 0; i < 15; i++){
      ACNL.setIndex(i, 0x10*i + 0xF);
    }
  };

  function palette_sepia(imgdata){
    for (var i = 0; i < 9; i++){
      ACNL.setIndex(i, 0x30 + i);
    }
    for (var i = 9; i < 15; i++){
      ACNL.setIndex(i, 0x60 + i - 6);
    }
  };
  
  $("#img_files").change(function(e){
    if (e.target.files[0].type.match('image.*')){
      var r = new FileReader();
      r.onload = function(re) {
        var img = new Image();
        img.onload = function(){
          var canvas_convert = document.createElement('canvas');
          canvas_convert.width = 32;
          canvas_convert.height = 32;
          var ctx_convert = canvas_convert.getContext("2d");
          ctx_convert.drawImage(img,0,0,32,32);
          var imgdata = ctx_convert.getImageData(0, 0, 32, 32);
          switch ($("#conv_meth").val()){
            case "top": palette_top(imgdata); break;
            case "lowest": palette_lowest(imgdata); break;
            case "grey": palette_grey(imgdata); break;
            case "sepia": palette_sepia(imgdata); break;
          }
          reColorize(imgdata);
          triggerRefresh();
        }
        img.src = re.target.result;
      }
      r.readAsDataURL(e.target.files[0]);
    }
    $("#img_files").val("");
  });
  
  $("#zoomin").click(function(){
    var s = Math.floor($("#acnl_icon_zoomier")[0].width / 64)*64;
    $("#acnl_icon_zoomier")[0].width = s+64;
    $("#acnl_icon_zoomier")[0].height = s+64;
    ACNL.draw($("#acnl_icon_zoomier")[0]);
  });
  $("#zoomout").click(function(){
    var s = Math.floor($("#acnl_icon_zoomier")[0].width / 64)*64;
    if (s < 256){s = 256;}
    $("#acnl_icon_zoomier")[0].width = s-64;
    $("#acnl_icon_zoomier")[0].height = s-64;
    ACNL.draw($("#acnl_icon_zoomier")[0]);
  });

  //load drag and drop support?
  //Doesn't work yet, for unknown reasons.
  // TODO: Look into this sometime.
  //$("#qr, #acnl_icon_zoomier").bind("dragenter dragover", function(e){e.originalEvent.dataTransfer.dropEffect = 'copy';console.log(e);}, false).bind("drop", function(e){console.log("drop", e);parseFiles(e.originalEvent.dataTransfer.files);}, false);



});

