import ACNLColorPicker from '/components/ACNLColorPicker.vue';
import Palette from '/components/Palette.vue';
import ThreeDRender from '/components/ThreeDRender.vue';
import FileLoader from '/components/FileLoader.vue';
import ImageLoader from '/components/ImageLoader.vue';
import ACNLQRGenerator from '/components/ACNLQRGenerator.vue';
import IconGenerator from '/components/IconGenerator.vue';
import ModalContainer from '/components/ModalContainer.vue';
import ToolSelector from '/components/ToolSelector.vue';
import NookPhoneMenu from '/components/NookPhoneMenu.vue';
import DrawingTool from '/libs/DrawingTool';
import ACNLFormat from '/libs/ACNLFormat';
import origin from '/libs/origin';
import generateACNLQR from "/libs/ACNLQRGenerator";
import lzString from 'lz-string';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// svg icons
import IconBase from '/components/icons/IconBase.vue';
import IconDownArrow from '/components/icons/IconDownArrow.vue';
import IconImageAdd from '/components/icons/IconImageAdd.vue';
import IconPalette from '/components/icons/IconPalette.vue';
import IconPhone from '/components/icons/IconPhone.vue';
import IconSave from '/components/icons/IconSave.vue';
import IconScan from '/components/icons/IconScan.vue';
import IconQRCode from '/components/icons/IconQRCode.vue';

export default {
  name: "Editor",
  components: {
    ACNLColorPicker,
    Palette,
    ThreeDRender,
    FileLoader,
    ImageLoader,
    ACNLQRGenerator,
    IconGenerator,
    ModalContainer,
    ToolSelector,
    NookPhoneMenu,
    IconBase,
    IconDownArrow,
    IconImageAdd,
    IconPalette,
    IconPhone,
    IconSave,
    IconScan,
    IconQRCode,
  },

  beforeRouteUpdate: function (to, from, next) {
    if (to.hash.length > 1) {
      if (to.hash.startsWith("#H:")){
        origin.view(to.hash.substring(3)).then((r)=>{
          this.drawingTool.load(r);
        });
        next();
        return;
      }
      let newHash = lzString.compressToEncodedURIComponent(this.drawingTool.toString());
      if (to.hash !== "#" + newHash) {
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(to.hash.substring(1)));
      }
    }
    next();
  },

  data: function() {
    return {
      drawingTool: new DrawingTool(),
      qrCode: false,
      patTitle: "Empty",
      patAuthor: "Unknown",
      patTown: "Unknown",
      allTypes: [],
      storedAuthorHuman: false,
      patInfoModal: false,
      fragment: "",
      patType: 9,
      patTypeName: "",
      pickPatterns: false,
      multiName: "Local Storage",
      allowMoveToLocal: true,
      convertImage: false,
      mainMenu: false,
      pubStyleA: "",
      pubStyleB: "",
      pubStyleC: "",
      pubTypeA: "",
      pubTypeB: "",
      pubTypeC: "",
      pubNSFW: "",
      publishModal: false,
      brown: '#7E7261',
      teal: '#57B7A8',
      orange: '#DC8D69',
      white: '#FFFFFF',
      origin,
    };
  },

  methods: {
    async onPublish(){
      let uplStatus = await origin.upload(btoa(this.drawingTool.toString()), this.pubStyleA, this.pubStyleB, this.pubStyleC, this.pubTypeA, this.pubTypeB, this.pubTypeC, this.pubNSFW);

      if (uplStatus["upload"]){
        this.$router.push({ hash: "H:"+uplStatus["upload"] });
      } else if (uplStatus.includes("error")) {
        window.alert("A pattern just like this already exists in the database!");
      }

      this.publishModal = false;
    },

    onOpenLocal(){
      this.closeColorPicker();
      let tmp = {};

      for (const i in localStorage){
        if (i.startsWith("acnl_")){
          tmp[i] = new DrawingTool(lzString.decompressFromUTF16(localStorage.getItem(i)));
        }
      }

      this.multiName = "Local Storage";
      this.pickPatterns = tmp;
      this.allowMoveToLocal = false;
    },

    zipPicksAsACNL(){
      let zip = new JSZip();
      const titles = [];

      for (const i in this.pickPatterns){
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)){dt = new DrawingTool(dt);}
        let ext = ".acnl";
        if (dt.pattern instanceof ACNHFormat){ext = ".acnh";}
        let title = dt.title + ext;
        let k = 1;

        while(titles.includes(title)) {
          title = dt.title + "(" + k + ")" + ext;
          k++;
        }
        zip.file(title, dt.toBytes());
        titles.push(title);
      }
      zip.generateAsync({type:"blob"}).then((d)=>{saveAs(d, "patterns.zip");});
    },

    async zipPicksAsPNG(){
      let zip = new JSZip();
      const titles = [];

      for (const i in this.pickPatterns){
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)){dt = new DrawingTool(dt);}
        const img = await generateACNLQR(dt);
        let title = dt.title + ".png";
        let k = 1;

        while(titles.includes(title)) {
          title = dt.title + "(" + k + ")" + ".png";
          k++;
        }
        zip.file(title, img.substr(22), {base64:true});
        titles.push(title);
      }
      zip.generateAsync({type:"blob"}).then((d)=>{saveAs(d, "patterns.zip");});
    },

    async zipPicksAsBoth(){
      let zip = new JSZip();
      const titles = [];

      for (const i in this.pickPatterns){
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)){dt = new DrawingTool(dt);}
        let ext = ".acnl";
        if (dt.pattern instanceof ACNHFormat){ext = ".acnh";}
        let ancl_title = dt.title + ext;
        let k = 1;

        while(titles.includes(ancl_title)) {
          ancl_title = dt.title + "(" + k + ")" + ext;
          k++;
        }

        const img_title = ancl_title.replace(ext, ".png");
        zip.file(ancl_title, dt.toBytes());
        const img = await generateACNLQR(dt);
        zip.file(img_title, img.substr(22), {base64:true});
        titles.push(ancl_title);
      }
      zip.generateAsync({type:"blob"}).then((d)=>{saveAs(d, "patterns.zip");});
    },

    async downPNG(){
      const img = await generateACNLQR(this.drawingTool);
      saveAs(img, this.drawingTool.title+".png");
    },

    async downTex(){
      const img = this.$refs.canvas3.toDataURL("image/png");
      saveAs(img, this.drawingTool.title+"_texture.png");
    },

    patInfoSave(publish=false){
      const patTitle = this.patTitle.trim();
      const patTown = this.patTown.trim();
      const patAuthor = this.patAuthor.trim();
      this.drawingTool.title = this.patTitle;

      if (this.drawingTool.creator[0] !== this.patAuthor) this.drawingTool.creator = this.patAuthor;
      if (this.drawingTool.town[0] !== this.patTown) this.drawingTool.town = this.patTown;

      if (this.drawingTool.patternType !== this.patType){
        this.drawingTool.patternType = this.patType;
        this.patTypeName = this.drawingTool.typeInfo.name;
      }

      if (publish){
        const titleCheck = patTitle && patTitle !== 'Empty';
        const townCheck = patTown && patTown !== 'Unknown';
        const nameCheck = patAuthor && patAuthor !== 'Unknown';

        if (titleCheck && townCheck && nameCheck){
          this.onPublish();
        }else{
          alert('Please provide a valid pattern name, town name, and player name for this pattern.');
          return;
        }
      }
      this.patInfoModal = false;
    },

    async onOpenDB(){
      this.$router.push("/browse");
    },

    onLocalSave(){
      localStorage.setItem("acnl_"+this.drawingTool.fullHash, lzString.compressToUTF16(this.drawingTool.toString()));
    },

    picksToLocal(){
      for (const i in this.pickPatterns){
        localStorage.setItem("acnl_"+this.pickPatterns[i].fullHash, lzString.compressToUTF16(this.pickPatterns[i].toString()));
      }
    },

    toolChange(newTool){
      this.drawingTool.drawHandler = newTool;
    },

    toolChangeAlt(newTool){
      this.drawingTool.drawHandlerAlt = newTool;
    },

    downACNL(){
      const blob = new Blob([this.drawingTool.toBytes()], {"type": "application/octet-stream"});
      let ext = ".acnl";

      if (this.drawingTool.pattern instanceof ACNHFormat){ext = ".acnh";}
      saveAs(blob, this.drawingTool.title+ext);
    },

    onColorPicked: function(color) {
      const currentColor = this.drawingTool.currentColor;
      if (this.drawingTool.getPalette(currentColor) === color) return;

      this.drawingTool.pushUndo();
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);

      console.log(`color picked: ${color}`);
    },

    onChangedCurrentColor: function(idx) {
      if (this.drawingTool.currentColor === idx) return;

      this.drawingTool.currentColor = idx;
      this.drawingTool.onColorChange();

      console.log(`changed current color: ${idx}`);
    },
    onLoad: async function(t){

      let patStr = this.drawingTool.toString();
      this.patType = this.drawingTool.patternType;
      this.patTypeName = this.drawingTool.typeInfo.name;
      this.patTitle = this.drawingTool.title;
      this.patAuthor = this.drawingTool.creator[0];
      this.patTown = this.drawingTool.town[0];

      // need to wait 2 ticks before access ref in portal
      // AFTER setting isOpenModal to true
      // https://portal-vue.linusb.org/guide/caveats.html#provide-inject
      await this.$nextTick();
      await this.$nextTick();

      /*
      const newHash = lzString.compressToEncodedURIComponent(patStr);
      const newPixHash = "#H:"+this.drawingTool.pixelHash;
      if (this.$router.currentRoute.hash !== "#" + newHash && this.$router.currentRoute.hash !== newPixHash) {
        this.$router.push({ hash: newHash });
      }
      */
      return;
    },

    extLoad: function(data) {
      this.drawingTool.load(data);
    },

    onConvert: function(patterns){
      this.convertImage = false;

      if (patterns.length == 1){
        this.extLoad(patterns[0]);
      }else{
        this.multiName = "Conversion Result";
        this.pickPatterns = patterns;
        this.allowMoveToLocal = true;
      }
    },
    
    extMultiLoad: function(data) {
      this.multiName = "Load which?";
      this.pickPatterns = data;
      this.allowMoveToLocal = true;
    },

    onQROpen: function() {
      this.closeColorPicker();
      const patStr = this.drawingTool.toString();
      this.qrCode = patStr;
    },

    pickPattern: function(p){
      this.extLoad(p);
      this.pickPatterns = false;
    },

    closePicks: function() {
      this.pickPatterns = false;
    },

    onMainMenu: function() {
      // this.$router.push("/");
      this.closeColorPicker();
      this.mainMenu = true;
    },

    openColorPicker: function() {
      if (this.drawingTool.currentColor !== 15) {
        this.$data.colorPickerMenu = !this.$data.colorPickerMenu;
        this.$refs.colorPickerMenu.style.height = ((!this.$data.colorPickerMenu)?0:315)+'px';
        return;
      }
      alert('This one has to stay transparent. :)');
    },

    closeColorPicker: function() {
      this.$refs.colorPickerMenu.style.height = '0px';
      this.$data.colorPickerMenu = false;
    },

    saveAuthor(){
      this.storedAuthorHuman = this.drawingTool.creator[0]+" / "+this.drawingTool.town[0];
      localStorage.setItem("author_acnl", this.drawingTool.authorStrict);
    },

    loadAuthor(){
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.patAuthor = this.drawingTool.creator[0];
      this.patTown = this.drawingTool.town[0];
    }
  },
  mounted: function() {
    if (localStorage.getItem("author_acnl")){
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.storedAuthorHuman = this.drawingTool.creator[0]+" / "+this.drawingTool.town[0];
    }

    this.drawingTool.addCanvas(this.$refs.canvas1, {grid:true});
    this.drawingTool.addCanvas(this.$refs.canvas2);
    this.drawingTool.addCanvas(this.$refs.canvas3);
    this.allTypes = this.drawingTool.allTypes;
    this.drawingTool.onLoad(this.onLoad);

    if (this.$router.currentRoute.hash.length > 1){
      const hash = this.$router.currentRoute.hash.substring(1);
      if (hash.startsWith("H:")){
        origin.view(hash.substring(2)).then((r)=>{
          this.drawingTool.load(r);
        });
      }else{
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(hash));
      }
    }
    else{
      this.onLoad();
      this.drawingTool.render();
    }

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Z'){
        this.drawingTool.redo();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'z'){
        this.drawingTool.undo();
        e.preventDefault();
        return;
      }
    });
  },
}
