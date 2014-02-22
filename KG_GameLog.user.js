// ==UserScript==
// @name        KG_GameLog
// @namespace   http://klavogonki.alexzh.ru
// @description Позволяет вести журнал всех заездов
// @author      voidmain
// @license     MIT
// @version     0.6
// @include     http://klavogonki.ru/*
// @grant       none
// @run-at      document-end 
// ==/UserScript==


function main() {


// TinyColor v0.9.17
// https://github.com/bgrins/TinyColor
// 2014-02-13, Brian Grinstead, MIT License
!function(){function tinycolor(color,opts){if(color=color?color:"",opts=opts||{},"object"==typeof color&&color.hasOwnProperty("_tc_id"))return color;var rgb=inputToRGB(color),r=rgb.r,g=rgb.g,b=rgb.b,a=rgb.a,roundA=mathRound(100*a)/100,format=opts.format||rgb.format;return 1>r&&(r=mathRound(r)),1>g&&(g=mathRound(g)),1>b&&(b=mathRound(b)),{ok:rgb.ok,format:format,_tc_id:tinyCounter++,alpha:a,getAlpha:function(){return a},setAlpha:function(value){a=boundAlpha(value),roundA=mathRound(100*a)/100},toHsv:function(){var hsv=rgbToHsv(r,g,b);return{h:360*hsv.h,s:hsv.s,v:hsv.v,a:a}},toHsvString:function(){var hsv=rgbToHsv(r,g,b),h=mathRound(360*hsv.h),s=mathRound(100*hsv.s),v=mathRound(100*hsv.v);return 1==a?"hsv("+h+", "+s+"%, "+v+"%)":"hsva("+h+", "+s+"%, "+v+"%, "+roundA+")"},toHsl:function(){var hsl=rgbToHsl(r,g,b);return{h:360*hsl.h,s:hsl.s,l:hsl.l,a:a}},toHslString:function(){var hsl=rgbToHsl(r,g,b),h=mathRound(360*hsl.h),s=mathRound(100*hsl.s),l=mathRound(100*hsl.l);return 1==a?"hsl("+h+", "+s+"%, "+l+"%)":"hsla("+h+", "+s+"%, "+l+"%, "+roundA+")"},toHex:function(allow3Char){return rgbToHex(r,g,b,allow3Char)},toHexString:function(allow3Char){return"#"+this.toHex(allow3Char)},toHex8:function(){return rgbaToHex(r,g,b,a)},toHex8String:function(){return"#"+this.toHex8()},toRgb:function(){return{r:mathRound(r),g:mathRound(g),b:mathRound(b),a:a}},toRgbString:function(){return 1==a?"rgb("+mathRound(r)+", "+mathRound(g)+", "+mathRound(b)+")":"rgba("+mathRound(r)+", "+mathRound(g)+", "+mathRound(b)+", "+roundA+")"},toPercentageRgb:function(){return{r:mathRound(100*bound01(r,255))+"%",g:mathRound(100*bound01(g,255))+"%",b:mathRound(100*bound01(b,255))+"%",a:a}},toPercentageRgbString:function(){return 1==a?"rgb("+mathRound(100*bound01(r,255))+"%, "+mathRound(100*bound01(g,255))+"%, "+mathRound(100*bound01(b,255))+"%)":"rgba("+mathRound(100*bound01(r,255))+"%, "+mathRound(100*bound01(g,255))+"%, "+mathRound(100*bound01(b,255))+"%, "+roundA+")"},toName:function(){return 0===a?"transparent":hexNames[rgbToHex(r,g,b,!0)]||!1},toFilter:function(secondColor){var hex8String="#"+rgbaToHex(r,g,b,a),secondHex8String=hex8String,gradientType=opts&&opts.gradientType?"GradientType = 1, ":"";if(secondColor){var s=tinycolor(secondColor);secondHex8String=s.toHex8String()}return"progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")"},toString:function(format){var formatSet=!!format;format=format||this.format;var formattedString=!1,hasAlphaAndFormatNotSet=!formatSet&&1>a&&a>0,formatWithAlpha=hasAlphaAndFormatNotSet&&("hex"===format||"hex6"===format||"hex3"===format||"name"===format);return"rgb"===format&&(formattedString=this.toRgbString()),"prgb"===format&&(formattedString=this.toPercentageRgbString()),("hex"===format||"hex6"===format)&&(formattedString=this.toHexString()),"hex3"===format&&(formattedString=this.toHexString(!0)),"hex8"===format&&(formattedString=this.toHex8String()),"name"===format&&(formattedString=this.toName()),"hsl"===format&&(formattedString=this.toHslString()),"hsv"===format&&(formattedString=this.toHsvString()),formatWithAlpha?this.toRgbString():formattedString||this.toHexString()}}}function inputToRGB(color){var rgb={r:0,g:0,b:0},a=1,ok=!1,format=!1;return"string"==typeof color&&(color=stringInputToObject(color)),"object"==typeof color&&(color.hasOwnProperty("r")&&color.hasOwnProperty("g")&&color.hasOwnProperty("b")?(rgb=rgbToRgb(color.r,color.g,color.b),ok=!0,format="%"===String(color.r).substr(-1)?"prgb":"rgb"):color.hasOwnProperty("h")&&color.hasOwnProperty("s")&&color.hasOwnProperty("v")?(color.s=convertToPercentage(color.s),color.v=convertToPercentage(color.v),rgb=hsvToRgb(color.h,color.s,color.v),ok=!0,format="hsv"):color.hasOwnProperty("h")&&color.hasOwnProperty("s")&&color.hasOwnProperty("l")&&(color.s=convertToPercentage(color.s),color.l=convertToPercentage(color.l),rgb=hslToRgb(color.h,color.s,color.l),ok=!0,format="hsl"),color.hasOwnProperty("a")&&(a=color.a)),a=boundAlpha(a),{ok:ok,format:color.format||format,r:mathMin(255,mathMax(rgb.r,0)),g:mathMin(255,mathMax(rgb.g,0)),b:mathMin(255,mathMax(rgb.b,0)),a:a}}function rgbToRgb(r,g,b){return{r:255*bound01(r,255),g:255*bound01(g,255),b:255*bound01(b,255)}}function rgbToHsl(r,g,b){r=bound01(r,255),g=bound01(g,255),b=bound01(b,255);var h,s,max=mathMax(r,g,b),min=mathMin(r,g,b),l=(max+min)/2;if(max==min)h=s=0;else{var d=max-min;switch(s=l>.5?d/(2-max-min):d/(max+min),max){case r:h=(g-b)/d+(b>g?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4}h/=6}return{h:h,s:s,l:l}}function hslToRgb(h,s,l){function hue2rgb(p,q,t){return 0>t&&(t+=1),t>1&&(t-=1),1/6>t?p+6*(q-p)*t:.5>t?q:2/3>t?p+6*(q-p)*(2/3-t):p}var r,g,b;if(h=bound01(h,360),s=bound01(s,100),l=bound01(l,100),0===s)r=g=b=l;else{var q=.5>l?l*(1+s):l+s-l*s,p=2*l-q;r=hue2rgb(p,q,h+1/3),g=hue2rgb(p,q,h),b=hue2rgb(p,q,h-1/3)}return{r:255*r,g:255*g,b:255*b}}function rgbToHsv(r,g,b){r=bound01(r,255),g=bound01(g,255),b=bound01(b,255);var h,s,max=mathMax(r,g,b),min=mathMin(r,g,b),v=max,d=max-min;if(s=0===max?0:d/max,max==min)h=0;else{switch(max){case r:h=(g-b)/d+(b>g?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4}h/=6}return{h:h,s:s,v:v}}function hsvToRgb(h,s,v){h=6*bound01(h,360),s=bound01(s,100),v=bound01(v,100);var i=math.floor(h),f=h-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s),mod=i%6,r=[v,q,p,p,t,v][mod],g=[t,v,v,q,p,p][mod],b=[p,p,t,v,v,q][mod];return{r:255*r,g:255*g,b:255*b}}function rgbToHex(r,g,b,allow3Char){var hex=[pad2(mathRound(r).toString(16)),pad2(mathRound(g).toString(16)),pad2(mathRound(b).toString(16))];return allow3Char&&hex[0].charAt(0)==hex[0].charAt(1)&&hex[1].charAt(0)==hex[1].charAt(1)&&hex[2].charAt(0)==hex[2].charAt(1)?hex[0].charAt(0)+hex[1].charAt(0)+hex[2].charAt(0):hex.join("")}function rgbaToHex(r,g,b,a){var hex=[pad2(convertDecimalToHex(a)),pad2(mathRound(r).toString(16)),pad2(mathRound(g).toString(16)),pad2(mathRound(b).toString(16))];return hex.join("")}function flip(o){var flipped={};for(var i in o)o.hasOwnProperty(i)&&(flipped[o[i]]=i);return flipped}function boundAlpha(a){return a=parseFloat(a),(isNaN(a)||0>a||a>1)&&(a=1),a}function bound01(n,max){isOnePointZero(n)&&(n="100%");var processPercent=isPercentage(n);return n=mathMin(max,mathMax(0,parseFloat(n))),processPercent&&(n=parseInt(n*max,10)/100),math.abs(n-max)<1e-6?1:n%max/parseFloat(max)}function clamp01(val){return mathMin(1,mathMax(0,val))}function parseIntFromHex(val){return parseInt(val,16)}function isOnePointZero(n){return"string"==typeof n&&-1!=n.indexOf(".")&&1===parseFloat(n)}function isPercentage(n){return"string"==typeof n&&-1!=n.indexOf("%")}function pad2(c){return 1==c.length?"0"+c:""+c}function convertToPercentage(n){return 1>=n&&(n=100*n+"%"),n}function convertDecimalToHex(d){return Math.round(255*parseFloat(d)).toString(16)}function convertHexToDecimal(h){return parseIntFromHex(h)/255}function stringInputToObject(color){color=color.replace(trimLeft,"").replace(trimRight,"").toLowerCase();var named=!1;if(names[color])color=names[color],named=!0;else if("transparent"==color)return{r:0,g:0,b:0,a:0,format:"name"};var match;return(match=matchers.rgb.exec(color))?{r:match[1],g:match[2],b:match[3]}:(match=matchers.rgba.exec(color))?{r:match[1],g:match[2],b:match[3],a:match[4]}:(match=matchers.hsl.exec(color))?{h:match[1],s:match[2],l:match[3]}:(match=matchers.hsla.exec(color))?{h:match[1],s:match[2],l:match[3],a:match[4]}:(match=matchers.hsv.exec(color))?{h:match[1],s:match[2],v:match[3]}:(match=matchers.hex8.exec(color))?{a:convertHexToDecimal(match[1]),r:parseIntFromHex(match[2]),g:parseIntFromHex(match[3]),b:parseIntFromHex(match[4]),format:named?"name":"hex8"}:(match=matchers.hex6.exec(color))?{r:parseIntFromHex(match[1]),g:parseIntFromHex(match[2]),b:parseIntFromHex(match[3]),format:named?"name":"hex"}:(match=matchers.hex3.exec(color))?{r:parseIntFromHex(match[1]+""+match[1]),g:parseIntFromHex(match[2]+""+match[2]),b:parseIntFromHex(match[3]+""+match[3]),format:named?"name":"hex"}:!1}var trimLeft=/^[\s,#]+/,trimRight=/\s+$/,tinyCounter=0,math=Math,mathRound=math.round,mathMin=math.min,mathMax=math.max,mathRandom=math.random;tinycolor.fromRatio=function(color,opts){if("object"==typeof color){var newColor={};for(var i in color)color.hasOwnProperty(i)&&(newColor[i]="a"===i?color[i]:convertToPercentage(color[i]));color=newColor}return tinycolor(color,opts)},tinycolor.equals=function(color1,color2){return color1&&color2?tinycolor(color1).toRgbString()==tinycolor(color2).toRgbString():!1},tinycolor.random=function(){return tinycolor.fromRatio({r:mathRandom(),g:mathRandom(),b:mathRandom()})},tinycolor.desaturate=function(color,amount){amount=0===amount?0:amount||10;var hsl=tinycolor(color).toHsl();return hsl.s-=amount/100,hsl.s=clamp01(hsl.s),tinycolor(hsl)},tinycolor.saturate=function(color,amount){amount=0===amount?0:amount||10;var hsl=tinycolor(color).toHsl();return hsl.s+=amount/100,hsl.s=clamp01(hsl.s),tinycolor(hsl)},tinycolor.greyscale=function(color){return tinycolor.desaturate(color,100)},tinycolor.lighten=function(color,amount){amount=0===amount?0:amount||10;var hsl=tinycolor(color).toHsl();return hsl.l+=amount/100,hsl.l=clamp01(hsl.l),tinycolor(hsl)},tinycolor.darken=function(color,amount){amount=0===amount?0:amount||10;var hsl=tinycolor(color).toHsl();return hsl.l-=amount/100,hsl.l=clamp01(hsl.l),tinycolor(hsl)},tinycolor.complement=function(color){var hsl=tinycolor(color).toHsl();return hsl.h=(hsl.h+180)%360,tinycolor(hsl)},tinycolor.triad=function(color){var hsl=tinycolor(color).toHsl(),h=hsl.h;return[tinycolor(color),tinycolor({h:(h+120)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+240)%360,s:hsl.s,l:hsl.l})]},tinycolor.tetrad=function(color){var hsl=tinycolor(color).toHsl(),h=hsl.h;return[tinycolor(color),tinycolor({h:(h+90)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+180)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+270)%360,s:hsl.s,l:hsl.l})]},tinycolor.splitcomplement=function(color){var hsl=tinycolor(color).toHsl(),h=hsl.h;return[tinycolor(color),tinycolor({h:(h+72)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+216)%360,s:hsl.s,l:hsl.l})]},tinycolor.analogous=function(color,results,slices){results=results||6,slices=slices||30;var hsl=tinycolor(color).toHsl(),part=360/slices,ret=[tinycolor(color)];for(hsl.h=(hsl.h-(part*results>>1)+720)%360;--results;)hsl.h=(hsl.h+part)%360,ret.push(tinycolor(hsl));return ret},tinycolor.monochromatic=function(color,results){results=results||6;for(var hsv=tinycolor(color).toHsv(),h=hsv.h,s=hsv.s,v=hsv.v,ret=[],modification=1/results;results--;)ret.push(tinycolor({h:h,s:s,v:v})),v=(v+modification)%1;return ret},tinycolor.readability=function(color1,color2){var a=tinycolor(color1).toRgb(),b=tinycolor(color2).toRgb(),brightnessA=(299*a.r+587*a.g+114*a.b)/1e3,brightnessB=(299*b.r+587*b.g+114*b.b)/1e3,colorDiff=Math.max(a.r,b.r)-Math.min(a.r,b.r)+Math.max(a.g,b.g)-Math.min(a.g,b.g)+Math.max(a.b,b.b)-Math.min(a.b,b.b);return{brightness:Math.abs(brightnessA-brightnessB),color:colorDiff}},tinycolor.readable=function(color1,color2){var readability=tinycolor.readability(color1,color2);return readability.brightness>125&&readability.color>500},tinycolor.mostReadable=function(baseColor,colorList){for(var bestColor=null,bestScore=0,bestIsReadable=!1,i=0;i<colorList.length;i++){var readability=tinycolor.readability(baseColor,colorList[i]),readable=readability.brightness>125&&readability.color>500,score=3*(readability.brightness/125)+readability.color/500;(readable&&!bestIsReadable||readable&&bestIsReadable&&score>bestScore||!readable&&!bestIsReadable&&score>bestScore)&&(bestIsReadable=readable,bestScore=score,bestColor=tinycolor(colorList[i]))}return bestColor};var names=tinycolor.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},hexNames=tinycolor.hexNames=flip(names),matchers=function(){var CSS_INTEGER="[-\\+]?\\d+%?",CSS_NUMBER="[-\\+]?\\d*\\.\\d+%?",CSS_UNIT="(?:"+CSS_NUMBER+")|(?:"+CSS_INTEGER+")",PERMISSIVE_MATCH3="[\\s|\\(]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")\\s*\\)?",PERMISSIVE_MATCH4="[\\s|\\(]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")\\s*\\)?";return{rgb:new RegExp("rgb"+PERMISSIVE_MATCH3),rgba:new RegExp("rgba"+PERMISSIVE_MATCH4),hsl:new RegExp("hsl"+PERMISSIVE_MATCH3),hsla:new RegExp("hsla"+PERMISSIVE_MATCH4),hsv:new RegExp("hsv"+PERMISSIVE_MATCH3),hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex8:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/}}();"undefined"!=typeof module&&module.exports?module.exports=tinycolor:"undefined"!=typeof define?define(function(){return tinycolor}):window.tinycolor=tinycolor}();


var gameDataModalTemplate = "<style>.game-dlg {padding: 10px 25px 10px 25px;}\
.game-dlg .close {position: absolute; top: 10px; right: 10px;}\
.game-dlg .game-info h3 {margin-bottom: 20px; font-size: 18px;}\
.game-dlg .game-info h3 .game-name {}\
.game-dlg .game-info h3 .game-time {display: block; font-size: 14px; color: #666; margin-top: 5px;}\
.game-dlg .game-info .game-text {padding: 5px; border: 3px solid #eee;  border-radius: 5px;}\
.game-dlg .game-info .game-text .error-incorrect {color: red; text-decoration: line-through;}\
.game-dlg .game-info .game-text .error-correct {color: #a00;}\
.game-dlg .game-info .stats {margin: 10px 0; margin-right: -15px; margin-left: -15px;}\
.game-dlg .game-info .stats:before, .game-dlg  .game-info .stats:after {display: table; content: \" \";}\
.game-dlg .game-info .stats:after {clear: both;}\
.game-dlg .game-info .stats .stats-col {position: relative; float: left; width: 50%; min-height: 1px; padding-right: 15px; padding-left: 15px;}\
.game-dlg .game-info .stats .stats-col table {width: 100%; margin-bottom: 20px;}\
.game-dlg .game-info .stats .stats-col table thead > tr > th,\
.game-dlg .game-info .stats .stats-col table tbody > tr > th,\
.game-dlg .game-info .stats .stats-col table tfoot > tr > th,\
.game-dlg .game-info .stats .stats-col table thead > tr > td,\
.game-dlg .game-info .stats .stats-col table tbody > tr > td,\
.game-dlg .game-info .stats .stats-col table tfoot > tr > td {padding: 8px; line-height: 1.428571429; vertical-align: top; border-top: 1px solid #dddddd;}\
.game-dlg .game-info .stats .stats-col table thead > tr > th {vertical-align: bottom; border-bottom: 2px solid #dddddd;}\
.game-dlg .game-info .stats .stats-col table caption + thead tr:first-child th,\
.game-dlg .game-info .stats .stats-col table colgroup + thead tr:first-child th,\
.game-dlg .game-info .stats .stats-col table thead:first-child tr:first-child th,\
.game-dlg .game-info .stats .stats-col table caption + thead tr:first-child td,\
.game-dlg .game-info .stats .stats-col table colgroup + thead tr:first-child td,\
.game-dlg .game-info .stats .stats-col table thead:first-child tr:first-child td {border-top: 0;}\
.game-dlg .game-info .stats .stats-col table tbody + tbody {border-top: 2px solid #dddddd;}\
.game-dlg .game-info .stats .stats-col table .table {background-color: #ffffff;}\
.game-dlg .game-info .stats .stats-col table tr td {font-size: 17px; line-height: 25px !important;}\
.game-dlg .game-info .stats .stats-col table tr th {font-weight: normal; line-height: 25px !important; color: #999;}\
.game-dlg .game-info .stats .stats-col table tr:first-child td,\
.game-dlg .game-info .stats .stats-col table tr:first-child th {border-top: 0;}\
</style>\n\
<div class='game-dlg'>\n\
<div class='close' ng:click='close()'>×</div>\n\
<div class='game-info'>\
<h3>\
<span class='game-name' ng:bind-html='gameHtml'></span>\
<span class='game-time'>{{formatDateTimeValue(gameData.beginTime)}}</span>\
</h3>\
<div class=game-text ng:if='gameData.errorsText' ng:bind-html='gameData.errorsText | gameTextErrorize'></div>\n\
<div class=game-text ng:if='!gameData.errorsText && gameData.text' ng:bind='gameData.text'></div>\n\
<div class='stats'>\n\
<div class='stats-col'>\n\
<table>\n\
<tr>\n\
<th>Скорость:</th>\n\
<td ng:if='gameData.finishTime'>{{gameData.speed}} зн/мин</td>\n\
<td ng:if='!gameData.finishTime'>&mdash;</td>\n\
</tr>\n\
<tr>\n\
<th>Время:</th>\n\
<td ng:if='gameData.finishTime'>{{timeFromMilliseconds(gameData.finishTime - gameData.beginTime)}}</td>\n\
<td ng:if='!gameData.finishTime'>&mdash;</td>\n\
</tr>\n\
</table>\n\
</div>\n\
<div class='stats-col'>\n\
<table>\n\
<tr>\n\
<th>Ошибки:</th>\n\
<td ng:if='gameData.finishTime'>{{gameData.errorsCount}} <span>({{gameData.errorsPercent | number:2}}%)</span></td>\n\
<td ng:if='!gameData.finishTime'>&mdash;</td>\n\
</tr>\n\
<tr>\n\
<th>Длина текста:</th>\n\
<td ng:if='gameData.text'>{{gameData.charsTotal}} зн</td>\n\
<td ng:if='!gameData.text'>&mdash;</td>\n\
</tr>\n\
</table>\n\
</div>\n\
</div>\n\
</div>\n\
</div>";


var statsOverviewTemplate = "<style>.gameLogButton {padding: 5px 10px;  font-size: 12px;  width: 100%;  font-weight: bold;  line-height: 1.5;  color: #777;  text-transform: uppercase;  border-radius: 3px;}</style>\
<div class='profile-stats-overview'>\
<div ng:if='!Overview.data.overview.err'>\
<div ng:if='Overview.data.overview.recent_gametypes.length &gt; 0'>\
<div class='row'>\
<div class='col-xs-8'>\
<h4>Выберите режим:</h4>\
<div app:chart-pie chart-click='Overview.onGametypeSelect(row)' chart-data-table='Overview.dataTable' chart-selection='Overview.selection' chart-slices='Overview.pieSlices' class='chart-pie'></div>\
</div>\
<div class='col-xs-4'>\
<div class='recent'>\
<h4>Недавние режимы</h4>\
<ul>\
<li ng:mouseenter='Overview.onGametypeHover(i)' ng:mouseleave='Overview.onGametypeHover(null)' ng:repeat='i in Overview.data.overview.recent_gametypes'>\
<a app:gametype-color='i' ng:href='#/{{$routeSegment.$routeParams.user}}/stats/{{i}}/'>\
{{Overview.data.overview.gametypes[i].name}}\
</a>\
</li>\
</ul>\
</div>\
<button class='btn gameLogButton' ng:click='showGameLog()' href=\"#\">Журнал</button>\
</div>\
</div>\
<div class='row'>\
<div app:chart-table chart-click='Overview.onGametypeSelect(row)' chart-data-table='Overview.dataTable' chart-options='{sortColumn: 1, sortAscending: false}' chart-selection='Overview.selection' class='chart-table'></div>\
</div>\
</div>\
<div class='stats-empty' ng:if='Overview.data.overview.recent_gametypes.length == 0'>\
<h3>Данные статистики отсутствуют</h3>\
Пройдите хотя бы один текст, чтобы открыть этот раздел.\
<div class='icon-icomoon icon-stats'></div>\
</div>\
</div>\
<ng:include ng:if=\"Overview.data.overview.err == 'permission blocked'\" src=\"'/views/partials/profile/stats/permission-blocked.html' | bust\"></ng:include>\
</div>";


var gameLogHtml = '<style>\
h3 .back .icon-icomoon:before { content: "\\e608"; }\
#emptyGameLog { margin-top: 20px; font-size: 14px; font-weight: bold; color: #ccc; text-transform: uppercase; display: none; }\
#gameLog { display: none; }\
#gameLog .row + .row { margin-top: 20px; }\
#gameLog .counter { width: 100%; padding: 1px 0 5px 0; background-color: #BFD7EE; border-radius: 3px; }\
#gameLog .counter + .counter { margin-top: 12px; }\
#gameLog .counter .title { padding: 5px; margin-left: 5px; font-size: 11px; font-weight: bold; color: #4d5f8f; text-transform: uppercase; }\
#gameLog .counter .value { position: relative; padding: 3px 0 3px 10px; margin: 0 5px; font-size: 18px; font-weight: bold; color: #4c7dc7; background-color: #ecf7ff; border-top: 1px solid #abbfd6; border-bottom: 1px solid white; border-radius: 3px; }\
#gameLog .counter .value .icon-icomoon { margin-right: 2px; font-size: 16px; vertical-align: middle; }\
#gameLog .counter .value span { vertical-align: middle; }\
</style>\n\
<div id="gameLogPage">\n\
<h3><button class="btn back" style="margin-right: 10px;"><div class="icon-icomoon"></div> Назад</button><span> Журнал заездов</span></h3>\n\
<input type="text" id="datepicker"></input>\n\
<div id="emptyGameLog">Нет данных</div>\n\
<div id="gameLog">\n\
<div class="checkbox"><label><input id="showNotFinished" type="checkbox" checked>Показывать недоезды</label></div>\n\
<div class="row">\n\
<div class="col-xs-9">\n\
<div id="piechart"></div>\n\
</div>\n\
<div class="col-xs-3">\n\
<div class="counter" id="gamesCounter">\n\
<div class="title">Пробег</div>\n\
<div class="value">\n\
<div class="icon-icomoon icon-road"></div>\n\
<span></span>\n\
</div>\n\
</div>\n\
<div class="counter" id="notFinishedCounter">\n\
<div class="title">Недоезды</div>\n\
<div class="value">\n\
<div class="icon-icomoon icon-blocked"></div>\n\
<span></span>\n\
</div>\n\
</div>\n\
<div class="counter" id="totalTimeCounter">\n\
<div class="title">Общее время</div>\n\
<div class="value">\n\
<div class="icon-icomoon icon-meter"></div>\n\
<span></span>\n\
</div>\n\
</div>\n\
<div class="counter" id="scoresGainedCounter">\n\
<div class="title">Очков получено</div>\n\
<div class="value">\n\
<div class="icon-icomoon icon-star"></div>\n\
<span>TEST</span>\n\
</div>\n\
</div>\n\
</div>\n\
</div>\n\
<div class="row">\n\
<div class="col-xs-12">\n\
<div id="gameLogTable"></div>\n\
</div>\n\
</div>\n\
</div>\n\
</div>';



var GameLog = {
    getDaysCount: function() {
        return localStorage['KG_GameLog_daysCount'] ? parseInt(localStorage['KG_GameLog_daysCount'], 10) : 0;
    },

    getGamesList: function() {
        var games = [];
        var currentLogItemId = localStorage['KG_GameLog_lastLogItemId'];
        while(currentLogItemId) {
            var currentLogItem = JSON.parse(localStorage['KG_GameLog_logItem_' + currentLogItemId]);
            var game = JSON.parse(currentLogItem.game);
            games.push(game);
            currentLogItemId = currentLogItem.prev;
        }
        return games;
    },

    getGamesDictionary: function() {
        var games = {};
        currentLogItemId = localStorage['KG_GameLog_lastLogItemId'];
        while(currentLogItemId) {
            var currentLogItem = JSON.parse(localStorage['KG_GameLog_logItem_' + currentLogItemId]);
            var game = JSON.parse(currentLogItem.game);
            var date = currentLogItem.date;
            if(!games[date]) {
                games[date] = [];
            }
            games[date].push(game);
            currentLogItemId = currentLogItem.prev;
        }
        return games;
    },

    getGameById: function(id) {
        var logItemString = localStorage['KG_GameLog_logItem_' + id];
        if(!logItemString) {
            return null;
        }
        return JSON.parse(JSON.parse(logItemString).game);
    },

    updateGame: function(gameData) {
        var logItemId = gameData.id + '_' + gameData.beginTime;
        var logItemString = localStorage['KG_GameLog_logItem_' + logItemId];
        if(!logItemString) {
            return;
        }
        var logItem = JSON.parse(logItemString);
        logItem.game = JSON.stringify(gameData);
        localStorage['KG_GameLog_logItem_' + logItemId] = JSON.stringify(logItem);
    },

    pushGame: function(gameData) {
        var maxDaysCount = 7;
    
        var newLogItem = {
            'id': gameData.id + '_' + gameData.beginTime,
            'date': (new Date(gameData.beginTime)).setHours(0,0,0,0),
            'game': JSON.stringify(gameData),
            'prev': null,
            'next': null
        };
        
        var daysCount = this.getDaysCount();
        
        if(daysCount == 0) {
            localStorage['KG_GameLog_logItem_' + newLogItem.id] = JSON.stringify(newLogItem);
            localStorage['KG_GameLog_firstLogItemId'] = newLogItem.id;
            localStorage['KG_GameLog_lastLogItemId'] = newLogItem.id;
            localStorage['KG_GameLog_daysCount'] = 1;
            return;
        }

        var lastLogItemId = localStorage['KG_GameLog_lastLogItemId'];
        var lastLogItem = JSON.parse(localStorage['KG_GameLog_logItem_' + lastLogItemId]);
        
        lastLogItem.next = newLogItem.id;
        newLogItem.prev = lastLogItemId;
        localStorage['KG_GameLog_logItem_' + lastLogItemId] = JSON.stringify(lastLogItem);
        localStorage['KG_GameLog_logItem_' + newLogItem.id] = JSON.stringify(newLogItem);
        localStorage['KG_GameLog_lastLogItemId'] = newLogItem.id;

        if(newLogItem.date == lastLogItem.date) {
            return;
        }
        if(daysCount < maxDaysCount) {
            localStorage['KG_GameLog_daysCount'] = daysCount + 1;
            return;
        }

        var firstLogItemId = localStorage['KG_GameLog_firstLogItemId'];
        var firstLogItem = JSON.parse(localStorage['KG_GameLog_logItem_' + firstLogItemId]);
        var secondLogItemId = firstLogItem.next;
        var secondLogItem = JSON.parse(localStorage['KG_GameLog_logItem_' + secondLogItemId]);

        while(firstLogItem.date == secondLogItem.date) {
            localStorage.removeItem('KG_GameLog_logItem_' + firstLogItemId);
            firstLogItemId = secondLogItemId;
            firstLogItem = JSON.parse(localStorage['KG_GameLog_logItem_' + firstLogItemId]);
            secondLogItemId = firstLogItem.next;
            secondLogItem = JSON.parse(localStorage['KG_GameLog_logItem_' + secondLogItemId]);
        }
        localStorage.removeItem('KG_GameLog_logItem_' + firstLogItemId);
        localStorage['KG_GameLog_firstLogItemId'] = secondLogItemId;
    }
};


function getGameName(gameType, isPremiumAbra, vocName)
{
    if(gameType == 'normal') {
        return 'Обычный';
    }
    if(gameType == 'abra') {
        var name = 'Абракадабра';
        if(isPremiumAbra) {
            name += ' Премиум';
        }
        return name;
    }
    if(gameType == 'referats') {
        return 'Яндекс.Рефераты';
    }
    if(gameType == 'noerror') {
        return 'Безошибочный';
    }
    if(gameType == 'marathon') {
        return 'Марафон';
    }
    if(gameType == 'digits') {
        return 'Цифры';
    }
    if(gameType == 'sprint') {
        return 'Спринт';
    }
    if(gameType == 'chars') {
        return 'Буквы';
    }
    if(/voc-(\d+)/.test(gameType)) {
        return vocName;
    }
}


function getGameHtml(gameType, isPremiumAbra, vocId, vocName)
{
    if(gameType == 'normal') {
        return '<span class=gametype-normal>Обычный</span>';
    }
    if(gameType == 'abra') {
        var html = '<span class=gametype-abra>Абракадабра</span>';
        if(isPremiumAbra) {
            html += ' <span class=gametype-abra-premium>Премиум</span>';
        }
        return html;
    }
    if(gameType == 'referats') {
        return '<span class=gametype-referats>Яндекс.Рефераты</span>';
    }
    if(gameType == 'noerror') {
        return '<span class=gametype-noerror>Безошибочный</span>';
    }
    if(gameType == 'marathon') {
        return '<span class=gametype-marathon>Марафон</span>';
    }
    if(gameType == 'digits') {
        return '<span class=gametype-digits>Цифры</span>';
    }
    if(gameType == 'sprint') {
        return '<span class=gametype-sprint>Спринт</span>';
    }
    if(gameType == 'chars') {
        return '<span class=gametype-chars>Буквы</span>';
    }
    if(/voc-(\d+)/.test(gameType)) {
        return '<span class=gametype-voc><a target=_blank href="/vocs/' + vocId + '/">' + vocName + '</a></span>';
    }
}


function getGameDescriptionHtml(gameData) {
    var descstr = getGameHtml(gameData.gameInfo.type, gameData.gameInfo.isPremiumAbra, gameData.gameInfo.vocInfo ? gameData.gameInfo.vocInfo.id : null, gameData.gameInfo.vocInfo ? gameData.gameInfo.vocInfo.name : null);

    if(gameData.gameInfo.vocInfo && gameData.gameInfo.vocInfo.type == 'book') {
        descstr += ', ' + (gameData.gameInfo.bookPart || 1)+'-й отрывок';
    }

    if(gameData.gameInfo.competition) {
        descstr += ', соревнование (x' + gameData.gameInfo.competition + ')';
    }

    if(gameData.gameInfo.isQualification) {
        descstr += ", квалификация";
    }

    if(gameData.gameInfo.mode == 'normal') {
        descstr += ', открытая игра';
        if(gameData.gameInfo.levelFrom != 1 || gameData.gameInfo.levelTo != 9)
        {
            descstr += ' для ';
            var levelNames = new Array('', 'новичков', 'любителей', 'таксистов', 'профи', 'гонщиков', 'маньяков', 'суперменов', 'кибергонщиков', 'экстракиберов');
            descstr += levelNames[gameData.gameInfo.levelFrom] + '&ndash;' + levelNames[gameData.gameInfo.levelTo];
        }
    }
    else if(gameData.gameInfo.mode == 'private') {
        descstr += ', игра c&nbsp;друзьями'
    }
    else if(gameData.gameInfo.mode == 'practice') {
        descstr += ', одиночный заезд';
    }

    if(!gameData.gameInfo.competition) {
        descstr += ', таймаут&nbsp;';
        if(gameData.gameInfo.timeout < 60) {
            descstr += gameData.gameInfo.timeout+'&nbsp;сек';
        }
        else {
            descstr += gameData.gameInfo.timeout / 60 + '&nbsp;мин';
        }
    }

    return descstr;
}


function showGameDataModal(gameData) {
    angular.element('body').injector().invoke(function($modal2, $sce) {
        $modal2.open({
            template: gameDataModalTemplate,
            controller: function ($scope,$modalInstance) {
                $scope.close = function() {
                    $modalInstance.dismiss();
                };
                $scope.gameData = gameData;
                $scope.timeFromMilliseconds = function(val) {
                    var min = Math.floor(val / 60000);
                    var sec = (val - 60000*min)/1000;
                    return 10 > sec && (sec = "0" + sec), 10 > min && (min = "0" + min), min + ":" + sec;
                };
                $scope.gameHtml = $sce.trustAsHtml(getGameDescriptionHtml(gameData));
                $scope.formatDateTimeValue = function(val) {
                    var formatter = new google.visualization.DateFormat({ pattern: 'dd MMMM yyyy г., HH:mm:ss' });
                    return formatter.formatValue(new Date(val));
                };
            }
        });
    });
}


function getSliceColor(gameType, isFinished, isPremiumAbra)
{
    var hue;
    if(gameType == 'normal') {
        hue = 85;
    }
    else if(gameType == 'abra') {
        hue = 272;
        if(isPremiumAbra) {
            hue = 48;
        }
    }
    else if(gameType == 'referats') {
        hue = 144;
    }
    else if(gameType == 'noerror') {
        hue = 194;
    }
    else if(gameType == 'marathon') {
        hue = 343;
    }
    else if(gameType == 'digits') {
        hue = 232;
    }
    else if(gameType == 'sprint') {
        hue = 0;
    }
    else if(gameType == 'chars') {
        hue = 25;
    }
    else if(/voc-(\d+)/.test(gameType)) {
        var vocId = parseInt(/voc-(\d+)/.exec(gameType)[1], 10);
        var predefinedVocColors = {
            25856: 212, // Соточка
            192: 300,   // Частотный словарь
            5539: 130   // Обычный in English
        };
        hue = predefinedVocColors[vocId] || vocId % 360;
    }
    
    var saturation = isFinished ? 75 : 20;
    var value = 80;
    
    return tinycolor({ h: hue, s: saturation, v: value }).toHexString();
}

function createAndShowGameLog() {
    $$$('.profile-stats-overview').hide().after(gameLogHtml);
    
    $$$('.back').click(function() {
        showGameLog(false);
    });
    
    var games = GameLog.getGamesDictionary();
        
    var data = new google.visualization.DataTable();
    data.addColumn('datetime', 'Время старта');
    data.addColumn('string', 'Режим');
    data.addColumn('boolean', 'Квалификация');
    data.addColumn('boolean', 'Абракадабра премиум');
    data.addColumn('number', 'ID словаря');
    data.addColumn('string', 'Имя словаря');
    data.addColumn('number', 'Скорость');
    data.addColumn('number', 'Ошибки');
    data.addColumn('number', '% ошибок');
    data.addColumn('datetime', 'Время');

    var table = new google.visualization.Table(document.getElementById('gameLogTable'));
    google.visualization.events.addListener(table, 'select', function() {
        var gameIndex = table.getSelection()[0].row;
        table.setSelection([]);
        showGameDataModal(currentDateGames[gameIndex]);
    });
    
    var errorsPercentFormatter = new google.visualization.NumberFormat({fractionDigits: 2, suffix: '%'});
    var timeFormatter = new google.visualization.DateFormat({pattern: 'HH:mm:ss'});
    var gameTimeFormatter = new google.visualization.DateFormat({pattern: 'mm:ss.SSS'});
    
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    google.visualization.events.addListener(chart, 'select', function() {
        chart.setSelection([]);
    });

    function redraw() {
        $$$('#emptyGameLog').hide();
        $$$('#gameLog').show();
        
        chart.clearChart();
        table.clearChart();
        data.removeRows(0, data.getNumberOfRows());
        
        var date = $$$('#datepicker').datepicker('getDate');
        currentDateGames = games[date.getTime()];
        if(!currentDateGames) {
            $$$('#gameLog').hide();
            $$$('#emptyGameLog').show();
            return;
        }

        var totalTime = 0;
        var gamesCount = 0;
        var totalScores = 0;
        for(var i = 0; i < currentDateGames.length; i++) {
            if(currentDateGames[i].finishTime) {
                gamesCount++;
                totalTime += currentDateGames[i].finishTime - currentDateGames[i].beginTime;
                totalScores += currentDateGames[i].scoresGained;
            }
        }

        $$$('#gamesCounter .value span').text(gamesCount);
        var notFinishedCount = currentDateGames.length - gamesCount;
        $$$('#notFinishedCounter .value span').text(notFinishedCount + ' (' + (notFinishedCount/currentDateGames.length*100).toFixed(1) + '%)');
        $$$('#totalTimeCounter .value span').text((new Date(totalTime + (new Date()).getTimezoneOffset()*60000)).format('HH:MM:ss'));
        $$$('#scoresGainedCounter .value span').text(totalScores);

        data.addRows(currentDateGames.map(function(g) {
            return [
                new Date(g.beginTime),
                g.gameInfo.type,
                g.gameInfo.isQualification, 
                g.gameInfo.isPremiumAbra,
                g.gameInfo.vocInfo ? g.gameInfo.vocInfo.id : null,
                g.gameInfo.vocInfo ? g.gameInfo.vocInfo.name : null,
                g.speed,
                g.errorsCount,
                g.errorsPercent,
                g.finishTime ? new Date(g.finishTime - g.beginTime) : null
            ];
        }));

        timeFormatter.format(data, 0);
        errorsPercentFormatter.format(data, 8);
        gameTimeFormatter.format(data, 9);
        
        var tableDataView = new google.visualization.DataView(data);
        tableDataView.setColumns([0, {
            calc: function(dataTable, rowIndex) {
                var gameHtml = getGameHtml(dataTable.getValue(rowIndex, 1), dataTable.getValue(rowIndex, 3), dataTable.getValue(rowIndex, 4), dataTable.getValue(rowIndex, 5));
                if(dataTable.getValue(rowIndex, 2)) {
                    gameHtml += ' <span>(к)</span>';
                }
                return gameHtml;
            },
            type: 'string',
            label: 'Режим'
        }, 6, 7, 8, 9]);
        if(!$$$('#showNotFinished').is(':checked')) {
            tableDataView.setRows(data.getFilteredRows([{column: 6, minValue: 0}]));
        }

        table.draw(tableDataView, {
            allowHtml: true,
            sortColumn: 0,
            sortAscending: false
        });

        var groupedData = google.visualization.data.group(
            data,
            [{ column: 1, type: 'string' },
             { column: 3, type: 'boolean' },
             { column: 5, type: 'string' },
             { column: 6, modifier: function(speed) { return speed ? true : false; }, type: 'boolean' }],
            [{ column: 0, aggregation: google.visualization.data.count, type: 'number' }]
        );

        groupedData.sort([{column: 0}, {column: 1}, {column: 3, desc: true}]);

        var chartDataView = new google.visualization.DataView(groupedData);
        chartDataView.setColumns([{
                calc: function(dataTable, rowIndex) {
                    return getGameName(dataTable.getValue(rowIndex, 0), dataTable.getValue(rowIndex, 1), dataTable.getValue(rowIndex, 2)) + (dataTable.getValue(rowIndex, 3) ? '' : ' (не завершен)');
                },
                type: 'string',
                label:'Режим'
            }, 4, 0, 1, 3]);
        if(!$$$('#showNotFinished').is(':checked')) {
            chartDataView.setRows(groupedData.getFilteredRows([{column: 3, value: true}]));
        }

        var sliceColors = [];
        for(var i = 0; i < chartDataView.getNumberOfRows(); i++) {
            sliceColors.push(getSliceColor(chartDataView.getValue(i, 2), chartDataView.getValue(i, 4), chartDataView.getValue(i, 3)));
        }

        chart.draw(chartDataView, {
            height: 280,
            chartArea: {
                height: '95%',
                width: '95%'
            }, 
            colors: sliceColors
        });
    }

    $$$('#datepicker').datepicker({
        onSelect: function() {
            redraw();
        },
        beforeShowDay: function(date) {
            return [typeof games[date.getTime()] !== 'undefined', ''];
        }
    });

    $$$('#showNotFinished').change(function(event) {
        redraw();
    });

    $$$("#datepicker").datepicker("setDate", Date.now());
    redraw();
}


function showGameLog(visibility) {
    if($$$('#gameLogPage').length == 0 && visibility != false) {
        createAndShowGameLog();
        return;
    }

    if(visibility == false) {
        $$$('#gameLogPage').hide();
        $$$('.profile-stats-overview').show();
    }
    else {
        $$$('.profile-stats-overview').hide();
        $$$('#gameLogPage').show();
    }
}


function getGameData(game) {
    var playerIndex = 0;
    for(; playerIndex < game.players.length; playerIndex++) {
        if(game.players[playerIndex].you) {
            break;
        }
    }
    var player = game.players[playerIndex];
    
    var charsTotal = game.charsTotal;
    if(game.params.mode == 'marathon') {
        charsTotal = player.info.finished ? player.info.charsTotal : null;
    }
    return {
        'id': game.id,
        'gameInfo': {
            'type': game.params.gametype,
            'levelFrom': game.params.level_from,
            'levelTo': game.params.level_to,
            'timeout': game.params.timeout,
            'isPremiumAbra': game.params.premium_abra == true,
            'isQualification': game.params.qual == 'on',
            'mode': game.params.type,
            'competition': game.params.competition,
            'bookPart': game.textinfo.part,
            'vocInfo': game.params.voc ? {
                'id': game.params.voc.id,
                'name': game.params.voc.name,
                'description': game.params.voc.description,
                'type': game.params.voc.type,
                'authorId': game.params.voc.user_id,
                'public': game.params.voc.public == "public",
                'rating': game.params.voc.rating,
                'rows': game.params.voc.rows
            } : null
        },
        'beginTime': game.begintimeServer * 1000,
        'finishTime': player.info.finished ? player.info._finished : null,
        'speed': player.info.finished ? Math.round(charsTotal*60000/(player.info._finished - game.begintimeServer*1000)) : null,
        'errorsCount': player.info.finished ? player.info.errors : null,
        'errorsPercent': player.info.finished ? Math.round(player.info.errors*10000/charsTotal)/100 : null,
        'charsTotal': charsTotal,
        'scoresGained': (player.info.record && game.params.type == 'normal') ? Math.round(player.info.record.scores_gained) : 0,
        'text': game.text,
        'errorsText': game.errors_text_bbcode
    };
}


function onGamePage() {
    var handler = function() {
        GameLog.pushGame(getGameData(game));
        $$$('#inputtext').unbind('keyup', handler);
    };
    $$$('#inputtext').bind('keyup', handler);

    Game.prototype.kg_gamelog_updateRaceRating = Game.prototype.updateRaceRating;
    Game.prototype.updateRaceRating = function() {
        this.kg_gamelog_updateRaceRating();
        
        if(!this.finished) {
            return;
        }

        var gameData = GameLog.getGameById(this.id + '_' + this.begintimeServer * 1000);

        if(!gameData || gameData.finishTime) {
            return;
        }

        GameLog.updateGame(getGameData(this));
    };
}


function onProfilePage() {
    var rootScope = angular.element('body').scope();
    rootScope.$on('routeSegmentChange', function(e, obj) {
        if(obj.segment && obj.segment.name == 'overview' && obj.segment.locals.data.summary.user.id == rootScope.Me.id) {
            obj.segment.locals.$template = statsOverviewTemplate;
            e.targetScope.showGameLog = showGameLog;
        }
    });
}


if (window.location.href.match(/http:\/\/klavogonki\.ru\/g\//)) {
    onGamePage();
}
else if (window.location.href.match(/http:\/\/klavogonki\.ru\/u\//)) {
    onProfilePage();
}


}






function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script);
    document.body.removeChild(script);
}


window.addEventListener("load", function() {
    exec(main);
}, false);