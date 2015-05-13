$(document).ready(function() {
var colormap = ["紅色","橙色","黃色","綠色","綠色","綠色","藍色","藍色","藍色","藍色","紫色","紫色","灰色"];
window.search = function(keyword) {
  var query = $("#keyword").val();
  if(keyword) query = keyword;
  if(!query) return;
  $("#palettes").html("");
  $.ajax({
    url: 'http://crossorigin.me/https://www.google.com.tw/search?hl=zh-TW&site=imghp&tbm=isch&q='+query+'&oq='+query,
    type: 'get'
  })
  .done(function(data) {
    var imgs = $(data).find(".images_table img");
    var huehash = {};
    function makepalette(url) {
      var img = new Image();
      img.onload = function() {
        var ct = new ColorThief();
        var palette = ct.getPalette(img,8);
        var str = "", idx, hue;
        for(idx=0;idx<palette.length;idx++) {
          c = palette[idx];
          tc = tinycolor({r:c[0],g:c[1],b:c[2]});
          hue = parseInt(tc.toHsl().h);
          sat = tc.toHsl().s;
          textcolor = (tc.isDark()?"rgba(255,255,255,0.8)":"rgba(0,0,0,0.8)");
          str += "<div class='color' style='color:"+textcolor+";background:rgb("+c[0]+","+c[1]+","+c[2]+")'>"+hue+"</div>"
          hue = parseInt(((hue + 15)%360) / 30);
          if( sat < 0.1 ) hue = 12;
          huehash[hue] = (huehash[hue] || 0) + 1;
        }
        str = "<div class='item'><div class='img' style='background-image:url("+this.src+")'></div><div class='palette'>"+str+"</div></div>"
        document.getElementById("palettes").innerHTML += str;
        var maxidx = 0;
        var maxvalue = 0;
        for(i=0;i<13;i++) {
          if(huehash[i] > maxvalue) {
            maxvalue = huehash[i];
            maxidx = i;
          }
        }
        $("#result").text("「"+query+"」是 : "+colormap[maxidx]);
      };
      img.crossOrigin = 'Anonymous';
      img.src = "http://crossorigin.me/"+url;
    }
    var max = imgs.length;
    if(max > 5) max = 5;
    for(idx=0;idx<max;idx++) {
      makepalette($(imgs[idx]).attr("src"));
    }
  }); 
}
window.search("香蕉");
});
