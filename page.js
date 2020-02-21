
var draw = new DrawingTool();
var copiedCreator = [];


/// Sets up everything needed for 3D rendering textures
function setup3DRender(){
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
  var renderer = new THREE.WebGLRenderer({"canvas":$("#acnl_preview")[0]});
  var texture;
  var renderCanvas = document.createElement('canvas');
  renderCanvas.width = 32;
  renderCanvas.height = 128;
  draw.addCanvas(renderCanvas);

  var renderContext = renderCanvas.getContext('2d');
  renderContext.fillStyle = "rgba(255,255,255,1)";
  renderContext.fillRect(0, 0, 32, 128);

  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.setSize(128, 128);
  camera.position.z = 15;
  camera.position.y = 30;
  camera.rotation.x = 5.6;

  var model = false;
  function animate() {
    if (model){
      model.rotation.y += 0.01;
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  /// Loads a new 3D model for the pattern
  function loadModel(path){
    if (model){
      scene.remove(model);
      model = false;
    }
    if (path == ""){
      $("#acnl_preview").hide();
      return;
    }
    $("#acnl_preview").show();
    var loader = new THREE.GLTFLoader();
    loader.load(path, function(gltf){
      model = gltf.scene.children[0];
      model.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          texture = new THREE.Texture(renderCanvas) 
          texture.needsUpdate = true;
          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false;
          texture.magFilter = THREE.NearestFilter;
          child.material = new THREE.MeshBasicMaterial({map:texture});
        }
      });
      scene.add(model);
    }, undefined, function(){
      $("#acnl_preview").hide();
    });
  }

  //If the type of pattern changes, change the model too
  draw.onLoad((d) => {
    function getTypeModel(n){
      switch (n){
        case 0: return "dress_long.gltf";
        case 1: return "dress_half.gltf";
        case 2: return "dress_none.gltf";
        case 3: return "shirt_long.gltf";
        case 4: return "shirt_half.gltf";
        case 5: return "shirt_none.gltf";
        default: return "";
      }
    }
    loadModel(getTypeModel(d.pattern.patternType));
  });
}


$(function(){

  draw.onLoad(function(d){
    //Set up current palette display
    for (var i = 0; i < 15; i++){$("#col"+i).css("background-color", d.getPalette(i));}
    $(".col_pal").attr("class", "col_pal").each(function(){
      if ($(this).data("color") == draw.color){
        $(this).attr("class", "col_pal picked");
      }
    });
    //Load the edit fields with their current values
    $("#icon_title").val(d.title);
    $("#icon_creator").val(d.creator[0]);
    $("#icon_creator_id").val(d.creator[1]);
    $("#icon_town").val(d.town[0]);
    $("#icon_town_id").val(d.town[1]);
    $("#icon_type").val(d.patternType);
  });
 
  //When edit fields are changed, update the pattern's values to match
  $("#icon_title").keyup(function(){draw.title = $(this).val();});
  $("#icon_creator").keyup(function(){draw.creator = $(this).val();});
  $("#icon_town").keyup(function(){draw.town = $(this).val();});
  $("#icon_creator_id").keyup(function(){draw.creator = parseInt($(this).val());});
  $("#icon_town_id").keyup(function(){draw.town = parseInt($(this).val());});

  //Download button
  $("#acnl_gen").click(function(){
    try{
      var blob = new Blob([draw.toBytes()], {"type": "application/octet-stream"});
      saveAs(blob, draw.title+".acnl");
    }catch(e){
      alert("Failed to save file. Try using a different browser. :-(");
    }
  });
 
  //Current palette buttons, change the current color selection in the drawing tool when clicked
  for (var i = 0; i < 15; i++){
    $("#col"+i).data("col", i).click(function(){
      $(".col_block").attr("class", "col_block");
      $(this).attr("class", "col_block picked");
      draw.color = parseInt($(this).data("col"));
      $(".col_pal").attr("class", "col_pal").each(function(){
        if ($(this).data("color") == draw.color){
          $(this).attr("class", "col_pal picked");
        }
      });
    });
  }

  //FAQ display
  $(".question").click(function(){
    $(this).children(".ans").toggle();
  });
  $(".ans").hide();
 
  //Dynamically creates a 3x3 grid of one color set from the palette
  function create_block(p){
    var block = $("<div>").attr("class", "col_pal_block");
    for (let i = 0; i < 9; i++){
      let c = ACNLFormat.paletteColors[p+i];
      block.append($("<div>").attr("class", "col_pal").css("background-color", c).data("color", c));
    }
    return block;
  };
  
  //Create all color sets
  for (var i = 0x00; i < 0xFF; i += 0x10){
    $("#color_pal").append(create_block(i));
  }

  //Add the grey color set
  var grey_row = $("<div>").attr("class", "col_pal_row");
  for (let i = 0; i < 15; i++){
    let c = ACNLFormat.paletteColors[(i << 4) + 0x0F];
    grey_row.append($("<div>").attr("class", "col_pal").css("background-color", c).data("color", c));
  }
  $("#color_pal").append(grey_row);

  //If any palette set color is clicked, set the currently selected palette color to it
  $(".col_pal").click(function(){
    $(".col_pal").attr("class", "col_pal");
    $(this).attr("class", "col_pal picked");
    draw.setPalette(draw.currentColor, $(this).data("color"));
    $("#col"+draw.currentColor).css("background-color", draw.color);
  });

  //We have three configured pattern displays, the last of which has a grid
  draw.addCanvas($("#acnl_icon")[0]);
  draw.addCanvas($("#acnl_icon_zoom")[0]);
  draw.addCanvas($("#acnl_icon_zoomier")[0], {grid:true});
  setup3DRender(); 
  
  //Load an empty pattern
  draw.load(null);

  //Copy/paste buttons
  $("#creator_copy").click(function(){
    copiedCreator = [draw.creator, draw.town];
    $("#creator_copy").val("Creator copied!");
    setTimeout(function(){$("#creator_copy").val("Copy creator");}, 1000);
    $("#creator_paste").val("Paste creator ("+copiedCreator[0][0]+" / "+copiedCreator[1][0]+")");
  });
  $("#creator_paste").click(function(){
    [draw.creator, draw.town] = copiedCreator;
    $("#icon_creator").val(draw.creator[0]);
    $("#icon_creator_id").val(draw.creator[1]);
    $("#icon_town").val(draw.town[0]);
    $("#icon_town_id").val(draw.town[1]);
  });

  //Renders QR code(s) to the #qr element
  $("#qr_gen").click(function(){
    let obj = $("#qr");
    let data = draw.toString();
    obj.html("");
    if (draw.width == 64){
      obj.qrcode({"correctLevel":0, "text":data.substr(0, 0x21C), "render":"canvas", "width":512, "height":512, "multipart_num":0, "multipart_total":3, "multipart_parity":0x77});
      obj.qrcode({"correctLevel":0, "text":data.substr(0x21C, 0x21C), "render":"canvas", "width":512, "height":512, "multipart_num":1, "multipart_total":3, "multipart_parity":0x77});
      obj.qrcode({"correctLevel":0, "text":data.substr(0x21C*2, 0x21C), "render":"canvas", "width":512, "height":512, "multipart_num":2, "multipart_total":3, "multipart_parity":0x77});
      obj.qrcode({"correctLevel":0, "text":data.substr(0x21C*3, 0x21C), "render":"canvas", "width":512, "height":512, "multipart_num":3, "multipart_total":3, "multipart_parity":0x77});
    }else{
      obj.qrcode({"correctLevel":0, "text":data, "render":"canvas", "width":512, "height":512});
    }
  });

  //Pattern type change
  $("#icon_type").change(function(){
    draw.patternType = $("#icon_type").val();
  });

  //Zoom controls
  $("#zoomin").click(function(){
    var s = Math.floor($("#acnl_icon_zoomier")[0].width / 64)*64;
    $("#acnl_icon_zoomier")[0].width = s+64;
    $("#acnl_icon_zoomier")[0].height = s+64;
    draw.render();
  });
  $("#zoomout").click(function(){
    var s = Math.floor($("#acnl_icon_zoomier")[0].width / 64)*64;
    if (s < 256){s = 256;}
    $("#acnl_icon_zoomier")[0].width = s-64;
    $("#acnl_icon_zoomier")[0].height = s-64;
    draw.render();
  });

 
  //Handle uploaded files (ACNL or QR code image)
  var multi_icon = "";
  function parseFiles(files){
    if (files[0].type.match('image.*')){
      //Assume QR code image
      var r = new FileReader();
      r.onload = function(re) {
        qrcode.callback = function(r){
          
          if (r.length < 0x21C){
            alert("Sorry, I can't recognize this as a valid pattern. :-(");
            return;
          }
          
          if (r.length == 0x26C){//regular pattern
            draw.load(r);
            return;
          }
          if (r.length == 0x21C){//multi-part pattern
            multi_icon += r;
            if (multi_icon.length == 0x21C){alert("Please input the second code next."); return;}
            if (multi_icon.length == 0x438){alert("Please input the third code next."); return;}
            if (multi_icon.length == 0x654){alert("Please input the last code next."); return;}
            if (multi_icon.length == 0x870){draw.load(multi_icon); multi_icon = ""; return;}
            multi_icon = "";
            alert("Something, somewhere, went terribly wrong. Please start over. :-(");
            return;
          }
          
          alert("Whoah! That code doesn't look right, but I think I can fix it, attempting fix...");
          
          if (r[0x68] == 0xA){
            draw.load(r);
            return;
          }else{
            multi_icon += r.substr(0, 0x21C);
            if (multi_icon.length == 0x21C){alert("Please input the second code next."); return;}
            if (multi_icon.length == 0x438){alert("Please input the third code next."); return;}
            if (multi_icon.length == 0x654){alert("Please input the last code next."); return;}
            if (multi_icon.length == 0x870){draw.load(multi_icon); multi_icon = ""; return;}
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
      var readNew = new FileReader();
      readNew.onload = function(re){draw.load(re.target.result);}
      readNew.readAsArrayBuffer(files[0]);
    }
  }; 
  $("#files").change(function(e){
    parseFiles(e.target.files);
    $("#files").val("");
  });
  
  //Sets the palette to the top-15 closest RGB colors
  function image_rgb(imgdata){
    let palette = [];
    for (let i = 0; i < 256; i++){palette.push({n: i, c:0});}
    let pixelCount = draw.pixelCount * 4;
    for (let i = 0; i < pixelCount; i+=4){
      palette[draw.findRGB([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]])].c++;
    }
    palette.sort(function(a, b){
      if (a.c > b.c){return -1;}
      if (a.c < b.c){return 1;}
      return 0;
    });
    for (let i = 0; i < 15; i++){draw.setPalette(i, palette[i].n);}

    //Set each pixel to the nearest color from the palette
    for (let i = 0; i < pixelCount; i+=4){
      let x = (i >> 2) % draw.width;
      let y = Math.floor((i >> 2) / draw.width);
      draw.setPixel(x, y, [imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]);
    }
    draw.onLoad();
  };

  //Sets the palette to the top-15 closest YUV colors
  function image_yuv(imgdata){
    let palette = [];
    for (let i = 0; i < 256; i++){palette.push({n: i, c:0});}
    let pixelCount = draw.pixelCount * 4;
    for (let i = 0; i < pixelCount; i+=4){
      palette[draw.findYUV([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]])].c++;
    }
    palette.sort(function(a, b){
      if (a.c > b.c){return -1;}
      if (a.c < b.c){return 1;}
      return 0;
    });
    for (let i = 0; i < 15; i++){draw.setPalette(i, palette[i].n);}

    //Set each pixel to the nearest color from the palette
    for (let i = 0; i < pixelCount; i+=4){
      let x = (i >> 2) % draw.width;
      let y = Math.floor((i >> 2) / draw.width);
      draw.setPixel(x, y, draw.findPalYUV([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]));
    }
    draw.onLoad();
  };
  
  //Set palette to greyscale
  function image_grey(imgdata){
    for (var i = 0; i < 15; i++){
      draw.setPalette(i, 0x10*i + 0xF);
    }

    function TripleY(rgb){
      return [rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000, rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000,rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000];
    }
    //Set each pixel to the nearest color from the palette
    let pixelCount = draw.pixelCount * 4;
    for (let i = 0; i < pixelCount; i+=4){
      let x = (i >> 2) % draw.width;
      let y = Math.floor((i >> 2) / draw.width);
      draw.setPixel(x, y, TripleY([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]));
    }
    draw.onLoad();
  };

  //Set palette to sepia
  function image_sepia(imgdata){
    for (var i = 0; i < 9; i++){
      draw.setPalette(i, 0x30+i);
    }
    for (var i = 9; i < 15; i++){
      draw.setPalette(i, 0x60+i-6);
    }

    //Set each pixel to the nearest color from the palette
    let pixelCount = draw.pixelCount * 4;
    for (let i = 0; i < pixelCount; i+=4){
      let x = (i >> 2) % draw.width;
      let y = Math.floor((i >> 2) / draw.width);
      draw.setPixel(x, y, [imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]);
    }
    draw.onLoad();
  };
  
  //Do not set palette at all
  function image_keep(imgdata){
    //Set each pixel to the nearest color from the palette
    let pixelCount = draw.pixelCount * 4;
    for (let i = 0; i < pixelCount; i+=4){
      let x = (i >> 2) % draw.width;
      let y = Math.floor((i >> 2) / draw.width);
      draw.setPixel(x, y, [imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]);
    }
    draw.onLoad();
  };
  
  //Convert uploaded image to pattern
  $("#img_files").change(function(e){
    if (e.target.files[0].type.match('image.*')){
      var r = new FileReader();
      r.onload = function(re) {
        var img = new Image();
        img.onload = function(){
          var canvas_convert = document.createElement('canvas');
          canvas_convert.width = draw.width;
          canvas_convert.height = draw.height;
          var ctx_convert = canvas_convert.getContext("2d");
          ctx_convert.drawImage(img,0,0,draw.width,draw.height);
          var imgdata = ctx_convert.getImageData(0, 0, draw.width, draw.height);
          switch ($("#conv_meth").val()){
            case "rgb": image_rgb(imgdata); break;
            case "yuv": image_yuv(imgdata); break;
            case "grey": image_grey(imgdata); break;
            case "sepia": image_sepia(imgdata); break;
            case "keep": image_keep(imgdata); break;
          }
        }
        img.src = re.target.result;
      }
      r.readAsDataURL(e.target.files[0]);
    }
    $("#img_files").val("");
  });
  

});

