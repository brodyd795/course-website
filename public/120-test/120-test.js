// make hero photo full-screen
$(".jumbotron").css({ height: $(window).height() + "px" });

$(window).on("resize", function() {
  $(".jumbotron").css({ height: $(window).height() + "px" });
});

// make active link underlined
// for (var i = 0; i < document.links.length; i++) {
//     if (document.links[i].href == document.URL) {
//         document.links[i].className = 'active';
//     }
// }
