default: acnltool.zip

acnl.min.js: jquery.min.js qrcode.js jquery.qrcode.js filesaver.js jsqrcode.min.js acnl.js page.js
	uglifyjs jquery.min.js qrcode.js jquery.qrcode.js filesaver.js jsqrcode.min.js acnl.js page.js -mc > acnl.min.js
oneliner.html: acnl.min.js
	echo "<script>" > oneliner.html
	cat acnl.min.js >> oneliner.html
	echo "</script>" >> oneliner.html
acnltool.html: oneliner.html index.html
	cat index.html | sed '/<!-- SCRIPTSTART -->/,/<!-- SCRIPTSTOP -->/ {//!d}; /<!-- SCRIPTSTART -->/r oneliner.html' > acnltool.html
acnltool.zip: acnltool.html
	zip -9 acnltool.zip acnltool.html

