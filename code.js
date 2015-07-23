$(document).ready(function() {
var colormap = ["紅色","橙色","黃色","黃綠色","綠色","青綠色","水藍色","藍色","深藍色","藍紫色","紫色","紫紅色","灰色","黑色","白色"];

window.working = false;
window.search = function(keyword) {
  if(window.working) return;
  window.working = 5;
  $("#loading").show();
  $("#result").html();
  var query = $("#keyword").val();
  if(keyword) query = keyword;
  if(!query) return;
  window.primaryImage = "http://data.infographics.tw/viz/keyword-coloring";
  $("#palettes").html("");
  $.ajax({
    url: 'http://crossorigin.me/https://www.google.com.tw/search?hl=zh-TW&site=imghp&tbm=isch&q='+query+'&oq='+query,
    type: 'get'
  })
  .done(function(data) {
    var imgs = $(data).find(".images_table img");
    var i,huehash = {};
    for(i=0;i<15;i++) huehash[i] = 0;
    function makepalette(url) {
      var img = new Image();
      img.onload = function() {
        var ct = new ColorThief();
        var palette = ct.getPalette(img,8);
        var str = "", idx, hue;
        var colors = [], c;
        var hex = [];
        window.primaryImage = this.src;
        for(idx=0;idx<palette.length;idx++) {
          c = palette[idx];
          tc = tinycolor({r:c[0],g:c[1],b:c[2]});
          hex.push(tc.toHexString());
          hue = parseInt(tc.toHsl().h);
          sat = tc.toHsl().s;
          lit = tc.toHsl().l;
          textcolor = (tc.isDark()?"rgba(255,255,255,0.8)":"rgba(0,0,0,0.8)");
          colors.push([textcolor, c, hue]);
          hue = parseInt(((hue + 15)%360) / 30);
          if( lit > 0.9 ) hue = 14;
          else if( lit < 0.15 ) hue = 13;
          else if( sat < 0.1 ) hue = 12;
          huehash[hue] = (huehash[hue] || 0) + 1;
        }
        colors.sort(function(a,b) { if(a[2]>b[2]) { return 1; } else if (a[2]<b[2]) { return -1;} else return 0;});
        for(idx=0;idx<colors.length;idx++) {
          c = colors[idx];
          str += "<div class='color' style='color:"+c[0]+";background:rgb("+c[1][0]+","+c[1][1]+","+c[1][2]+")'>"+c[2]+"</div>"
        }
        loadingio = "<a class='loadingio-link' target='_blank' href='http://loading.io/color/?colors="+hex.map(function(it){return it.substring(1);}).join(",")+"&name="+query+"'><i class='glyphicon glyphicon-share'></i>存</span>"
        str = "<div class='item'><div class='img' style='background-image:url("+this.src+")'></div><div class='palette'>"+str+loadingio+"</div></div>"
        document.getElementById("palettes").innerHTML += str;
        var i,colorOrder = [];
        for(i=0;i<15;i++) colorOrder.push([i, huehash[i]]);
        colorOrder.sort(function(a,b) { if(a[1]>b[1]) { return -1; } else if(a[1]<b[1]) { return 1; } else return 0;});
        window.resultColor = colormap[colorOrder[0][0]];
        $("#result").html(
            "「"+query+"」是 : "+colormap[colorOrder[0][0]] + 
            "&nbsp; &nbsp; <small>輔色是"+colormap[colorOrder[1][0]] + " &nbsp; / &nbsp; " +
            "<a href='#' onclick='share(\""+query+"\")'><i class='glyphicon glyphicon-share'/>分享至臉書</a></small>"
        );
        window.working--;
        if(window.working<=0) {
          window.working = 0;
          $("#loading").hide();
        }
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
var keyword = decodeURIComponent(window.location.search.replace(/^\?/,""))
if(!keyword) { keyword = "香蕉"; }
window.search(keyword);
window.share = function(query) {
  var obj = {
    method: 'feed',
    link: 'http://data.infographics.tw/viz/keyword-coloring/?'+query,
    name: "關鍵字上色！「"+query+"」的顏色是..."+window.resultColor, 
    caption: "infographics.tw / Google 圖片搜尋分析字詞顏色",
    picture: window.primaryImage,
    /*picture: 'http://data.infographics.tw/viz/keyword-coloring/thumbnail.jpg',*/
    description: "除了"+query+"之外，你知道「鏡子」、「空氣」或「靈魂」是什麼顏色嗎？不知道的顏色，就讓關鍵字圖片搜尋告訴你！",
  };

  FB.ui(obj, function() {});
};
window.keylisten = function() { if(event.keyCode==13) {search();} };
});
