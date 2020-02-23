    <style>
      :root {
        --text-color: #eee;
        --link-color: #c9af98;
        --linkhvr-color:#845007;
        --background-color: #111;
        --headersm-color: #27735f;
        --break-color: #c9af98;
        --buttonbk-color: #4e8c7c;
        --buttontxt-color: #fafbff;
        --buttonhvr-color: #4e8c7c;
        --question-color: #4e8c7c;
        --questionhvr-color: #61998a;
        --select-color: #D4D4D4;
      }
      A {
        color: var(--link-color);
      }
      A:hover {
        color: var(--linkhvr-color);
      }
      BODY {
        color: var(--text-color);
        font-family: "Lato";
        background-color: var(--background-color);
      }
      H1, H2, H3 {
        margin: 0;
        margin-top: 1em;
      }
      H4 {
        margin: 0.2em;
        color: var(--headersm-color);
        text-transform: uppercase;
      }
      HR {
        display: block;
        height: 1px;
        border: 0;
        border-top: 3px solid var(--break-color);
        margin: 1em 0;
        padding: 0;
      }
      INPUT[type="text"] {
        margin-right: 1em;
      }
      SELECT {
        margin-right: 1em;
        padding: 12px 18px;
        border: none;
        cursor: pointer;
        letter-spacing: 0.03em;
        background-color: var(--select-color);
      }
      INPUT[type="button"],
      INPUT[type="file"], .zoombutton {
        background-color: var(--buttonbk-color);
        color: var(--buttontxt-color);
        padding: 14px 20px;
        margin-right: 0.5em;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: 0.03em;
      }
      INPUT[type="button"]:hover,
      INPUT[type="file"]:hover, .zoombutton {
        background-color: var(--buttonhvr-color);
      }
      LABEL {
        width: 9em;
        display: inline-block;
      }
      .header {
        padding-left: 2em;
      }
      .header P {
        opacity: 0.8;
      }
      .body {
        margin: 1em;
      }
      .canvas_container, .qr_code_container {
        width: 100%;
        text-align: center;
      }
      .preview_pane CANVAS, .preview_pane INPUT, .colors, .colors_pal, .zoom_holder, #acnl_preview{
        display:block;
        margin:auto;
      }
      #acnl_preview{width:128px; height:128px;}
      .preview_pane, .color_pane, .zoombutton, #acnl_icon_zoomier{
        display:inline-block;
      }
      #acnl_icon{margin-bottom:0.5em;}
      .preview_pane{margin-right:0.5em;}
      .qr_code CANVAS {
        display: inline-block;
        border: 20px solid white;
        min-width: 512px;
        min-height: 512px;
        max-height: 512px;
        max-width: 512px;
        background-color: white;
      }
      .question_container {
        width: 100%;
      }
      .que {
        cursor: pointer;
        color: var(--question-color);
        font-weight: bold;
      }
      .que:hover{
        color: var(--questionhvr-color);
      }
      .ans {
        margin-left: 0.8em;
        max-width: 700px;
        text-align: justify;
      }
      .color_pane{
        padding:0.5em;
        margin-left:0.5em;
        margin-bottom:0.5em;
      }
      .color_pal{margin-bottom:1em;}
      .colors, .color_pal, .canvas_container CANVAS, .color_pane{
        background-color: white;
      }
      .color_pal {
        width: 160px;
        height: 180px;
      }
      .col_block {
        width: 32px;
        height: 32px;
        display: inline-block;
        margin: 0;
        padding: 0;
        font-size: 0;
      }
      .col_block.picked {
        width: 24px;
        height: 24px;
        margin: 4px;
      }
      .col_row {
        height: 32px;
      }
      .col_pal_block {
        height: 30px;
        width: 30px;
        float: left;
        overflow: hidden;
        margin: 5px;
      }
      .col_pal_row {
        height: 10px;
        width: 150px;
        float: left;
        overflow: hidden;
        margin: 5px;
      }
      .col_pal {
        width: 10px;
        height: 10px;
        border: 0;
        float: left;
        margin: 0;
        padding: 0;
      }
      .col_pal.picked {
        width: 5px;
        height: 5px;
        margin: 2.5px;
      }
    </style>
    <script>

      import DrawingTool from '/libs/drawtools.js'

export default {
  data(){
    var draw = new DrawingTool();
    var copiedCreator = [];

    //Load an empty pattern
    draw.load(null);


    return {
      pattern:{
        title: draw.title,
        creator: draw.creator,
        town: draw.town,
        type: draw.patternType
      }
    }
  }
}


//Renders QR code(s) to the #qr element
// TODO: Port to new QR lib?
// TODO: Only render when QR button is clicked
function qr(){
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
};

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



  /*
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
    */
 
  //When edit fields are changed, update the pattern's values to match
  /*
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
  */

  //We have three configured pattern displays, the last of which has a grid
  /*
  draw.addCanvas(document.getElementById("acnl_icon"));
  draw.addCanvas($("#acnl_icon_zoom")[0]);
  draw.addCanvas($("#acnl_icon_zoomier")[0], {grid:true});
  setup3DRender(); 
  */
  
  //Copy/paste buttons
  /*
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
*/
 
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
  /*
  $("#files").change(function(e){
    parseFiles(e.target.files);
    $("#files").val("");
  });
  */
  
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
  /*
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
  */
  

    </script>
  <template>
  <body>
    <div class="header">
      <h1>Animal Crossing: New Leaf Pattern Tool</h1>
      <h4 title="thulinma@thulinma.com">By Thulinma</h4>
      <i>Last updated: December 14, 2018</i><br>
      <p>Questions / remarks / cookies? Please read the <b>FAQ</b> on the bottom of the page!</p>
    </div>
    <hr>
    <div class="canvas_container">
      <div class="preview_pane">
        <canvas id="acnl_preview"></canvas>
        <canvas id="acnl_icon" class="acnl_icon" width=64 height=64></canvas>
        <canvas id="acnl_icon_zoom" class="acnl_icon_zoom" width=128 height=128></canvas>
        <div class="zoom_holder">
          <div id="zoomin" class="zoombutton">+</div>
          <div id="zoomout" class="zoombutton">-</div>
        </div>
      </div>
      <canvas id="acnl_icon_zoomier" class="acnl_icon_zoomier" width=512 height=512></canvas>
      <div class="color_pane">
        <div id="color_pal" class="color_pal"></div>
        <div id="colors" class="colors">
          <div class="col_row">
            <div id="col0" class="col_block picked"></div>
            <div id="col1" class="col_block"></div>
            <div id="col2" class="col_block"></div>
          </div>
          <div class="col_row">
            <div id="col3" class="col_block"></div>
            <div id="col4" class="col_block"></div>
            <div id="col5" class="col_block"></div>
          </div>
          <div class="col_row">
            <div id="col6" class="col_block"></div>
            <div id="col7" class="col_block"></div>
            <div id="col8" class="col_block"></div>
          </div>
          <div class="col_row">
            <div id="col9" class="col_block"></div>
            <div id="col10" class="col_block"></div>
            <div id="col11" class="col_block"></div>
          </div>
          <div class="col_row">
            <div id="col12" class="col_block"></div>
            <div id="col13" class="col_block"></div>
            <div id="col14" class="col_block"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="body">
      <label for="icon_title">Title:</label>
      <input type="text" id="icon_title" v-model="pattern.title">
      <br>
      <label for="icon_town">Pattern type:</label>
      <select id="icon_type" v-model.number="pattern.type">
        <option value="0">Dress (long sleeves)</option>
        <option value="1">Dress (short sleeves)</option>
        <option value="2">Dress (sleeveless)</option>
        <option value="3">Shirt (long sleeves)</option>
        <option value="4">Shirt (short sleeves)</option>
        <option value="5">Shirt (sleeveless)</option>
        <option value="6">Umbrella? I think?</option>
        <option value="7">Hat</option>
        <option value="8">Standee</option>
        <option value="9">Standard pattern</option>
      </select>
      <br>
      <label for="icon_creator">Creator:</label>
      <input type="text" id="icon_creator" v-model="pattern.creator[0]"><input type="text" id="icon_creator_id" v-model.number="pattern.creator[1]">
      <br>
      <label for="icon_town">Town:</label>
      <input type="text" id="icon_town" v-model="pattern.town[0]"><input type="text" id="icon_town_id" v-model.number="pattern.town[1]">
      <br>
      <input type="button" id="creator_copy" value="Copy creator">
      <input type="button" id="creator_paste" value="Paste creator">
      <input type="button" value="Download ACNL file" id="acnl_gen">
      <br>
      <label for="files">Load ACNL file or QR-image:</label>
      <input type="file" name="files" id="files">
      <br>
      <label for="icon_creator">Convert image:</label>
      <input type="file" id="img_files">
      <select id="conv_meth">
        <option value="rgb">Use the top 15 most-used nearest RGB colors (default)</option>
        <option value="yuv">Use the top 15 most-used nearest YUV colors</option>
        <option value="grey">Convert to greyscale (fast and good, but no colors)</option>
        <option value="sepia">Convert to sepia (fast and good, but no colors)</option>
        <option value="keep">Use current palette</option>
      </select>

      <div class="qr_code_container">
        <div id="qr" class="qr_code"></div>
      </div>

      <h3>FAQ</h3>
      <div class="question_container">
        <div class="question">
          <p class="que">ZOMG This thing doesn't work!</p>
          <p class="ans">The ACNL pattern tool is completely written in HTML5 and JavaScript. As such, it requires a decently standards-compliant browser. The latest versions of Chrome / Chromium / Firefox work. No promises on anything else. Internet Explorer will probably choke on this entire page.</p>
        </div>
        <div class="question">
          <p class="que">How do I use this thing?</p>
          <p class="ans">Click a color on the 3x5 palette and then just "draw" on one of the pattern representations. All of the zoom levels are drawable and they will all update at the same time. When you want to import to ACNL, simply scan the QR code at the bottom using the QR machine at the Able Sisters in-game. Don't have the QR machine yet? Talk to the quiet sister in the back for 10 days in a row to unlock it. The download ACNL file button lets you save the pattern to your computer for later use. You can also upload ACNL files or images containing QR codes. Don't upload images containing multiple QR codes - multi-part codes need to be uploaded one at a time, in order.</p>
        </div>
        <div class="question">
          <p class="que">How did you make this?</p>
          <div class="ans">
            <p>Mostly magic. It helped that I made the <a href="http://aviator.home.xs4all.nl/acww/">ACWW pattern tool</a>, and ACNL patterns are mostly in the same format. As to how exactly it works - HTML5 and JavaScript.<br><br>I make use of the following JavaScript libraries from others (some with my own modifications or fixes), everything else is my work:</p>
            <ul>
              <li><a href="//github.com/eligrey/FileSaver.js">FileSaver</a> by Eli Grey</li>
              <li><a href="//github.com/lrsjng/jquery-qrcode">jquery-qrcode</a> by Lars Jung</li>
              <li><a href="http://www.d-project.com/qrcode/index.html">QR code generator</a> by Kazuhiko Arase</li>
              <li><a href="//github.com/LazarSoft/jsqrcode">jsqrcode</a> by Lazar Laszlo</li>
              <li><a href="http://jquery.com/">jQuery</a> by the jQuery Foundation</li>
              <li><a href="//github.com/mrdoob/three.js/">three.js</a> by the three.js authors</li>
              <li>3D models were ripped from the game by <a href="//www.models-resource.com/submitter/Centrixe/">Centrixe (previously Tiramisu6) @ The Models Resource</a></li>
            </ul>
          </div>
        </div>
        <div class="question">
          <p class="que">Wait if you made the ACWW Pattern tool - does that mean ACWW patterns can be imported?</p>
          <p class="ans">Yeah, I plan to add that as a feature in the future.</p>
        </div>
        <div class="question">
          <p class="que">This is open source? So I can re-use this code for my own projects?</p>
          <p class="ans">Yes. Please don't claim you wrote it all yourself, and try to include a notice "Based on the ACNL Pattern tool by Thulinma" somewhere. You don't *have* to include a notice like that, but I will be very very disappointed in you if you don't.</p>
        </div>
        <div class="question">
          <p class="que">Is there an offline version I can use without an internet connection?</p>
          <p class="ans">Yes. <a href="acnltool.zip">This is the download link.</a></p>
        </div>
        <div class="question">
          <p class="que">I made something better / fixed something / added more browser support!</p>
          <p class="ans">That's not a question! But - yay! Drop me a line with your code changes and if I like them I'll migrate them into the main project.</p>
        </div>
        <div class="question">
          <p class="que">Can I make a suggestion?</p>
          <p class="ans">If you think you can program your suggestion yourself - go ahead, and see the "question" above this one. If you can't - I probably don't have interest in implementing it myself unless your idea is truly awesome (and/or I'm already working on it) - but you can always suggest it and who knows.</p>
        </div>
        <div class="question">
          <p class="que">Why isn't my QR code being read? It works in the game!</p>
          <p class="ans">I'm using the <a href="https://github.com/LazarSoft/jsqrcode">jsqrcode</a> port from the zxing QR libraries. Unfortunately this port isn't very accurate and it has trouble with some QR codes. In fact, I had to make some fixes to get it to read ACNL QR codes at all (I've <a href="//github.com/LazarSoft/jsqrcode/pull/20">submitted the needed fixes</a> to the author of the port, so everyone can benefit from them). Feel free to improve the library yourself and let me know if/when more fixes become available and I'll integrate them as soon as I can.</p>
        </div>
        <div class="question">
          <p class="que">What are ".ACNL" files?</p>
          <p class="ans">A small binary format storage for ACNL patterns. Similar to ACWW files, they contain the pattern and nothing more. For ACNL files I used the exact binary contents of the QR codes - so any QR code can be decoded into an ACNL file and any ACNL file encoded into QR.</p>
        </div>
        <div class="question">
          <p class="que">What features are you still working on?</p>
          <div class="ans">
            <p>Some of the stuff I have in mind includes:</p>
            <ul>
              <li>Importing stored ACWW files</li>
              <li>Adding a pattern database with tagging/search</li>
              <li>Experimenting with out of bounds color values (many values are not used in-game...)</li>
              <li>Adding image conversion for pro designs</li>
              <li>Figure out what the 6 bytes of unknown data represent</li>
              <li>Add support for viewing/changing the pattern type</li>
            </ul>
          </div>
        </div>
        <div class="question">
          <p class="que">What is the changelog?</p>
          <ul class="ans">
            <li>June 24, 2013: First working version, QR code generation.</li>
            <li>June 25, 2013: Pattern editing (drawing), palette editing, title/creator/town and all related ID editing.</li>
            <li>June 28, 2013: Firefox support, creator copy/paste buttons, loading ACNL files.</li>
            <li>June 29, 2013: Loading QR code images now works, added an empty default pattern, removed old preset patterns (they were used without permission), added preliminary support for converting images to patterns (pretty low quality, but it works), improved the colors (now actual colors as they are in-game)</li>
            <li>June 30, 2013: Support for pro patterns (both import and export), added pixel grid, added zoom buttons, added offline version download link in FAQ, added a selection box with 4 different image conversion optimizers</li>
            <li>May 24, 2014: Still alive! Fixed a bug causing drawing to get stuck in several browsers. Fixed bug of having 16 shades of grey instead of the 15 from in-game. Updated jsqrcode for better QR code recognition. Added support for automatically attempting to recover from some corrupt QR codes. Special thanks to "Kiddiecat" for pointing out the drawing bug. Special thanks to "Michael New" for pointing out the 16 shades of grey bug. Special thanks to "Edel Fern&aacute;ndez" for supplying a corrupt QR code.</li>
            <li>December 14, 2018: A special update in honor of an important day exactly three years ago. Spit-shine and polish, CSS improvements and some minor typos corrected by "Myumi Kalinowski". Added 3D render for shirt and dress modes. Added ability to change pattern type as well as create other types than the standard type from scratch. More updates coming soon. Maybe. We'll see!</li>
          </ul>
        </div>
        <div class="question">
          <p class="que">How do I contact you?</p>
          <p class="ans">You can e-mail me at thulinma@thulinma.com - but please keep in mind I'm a busy guy so don't e-mail me unless you have a worthwhile contribution or something similar. :-)</p>
        </div>
      </div>
    </div>
    </body>
  </template>
