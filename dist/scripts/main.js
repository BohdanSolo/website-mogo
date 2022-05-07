$(function () {
  const header = $("#header"),
    introH = $("#intro").innerHeight(),
    scrollOffset = 0;

  /*Fixed Header*/
  $(window).on("scroll", function () {
    const scrollOffset = $(this).scrollTop();

    if (scrollOffset >= introH) {
      header.addClass("fixed");
    } else {
      header.removeClass("fixed");
    }
  });

  /*Smooth Scroll*/

  $("[data-scroll]").on("click", function (event) {
    event.preventDefault();

    const blockId = $(this).data("scroll"),
      blockOffset = $(blockId).offset().top;

    $("html, body").animate({
      scrollTop: blockOffset,
    });
  });

  /*Mnu nav toggle*/

  $("#nav-toggle").on("click", function (event) {
    event.preventDefault();
    $(this).toggleClass("active");
    $("#nav").toggleClass("active");
  });

  /*Collapse*/

  $("[data-collapse]").on("click", function (event) {
    event.preventDefault();

    const $this = $(this),
      blockId = $this.data("collapse");
    $this.toggleClass("active");
  });
});

function testWebP(callback) {

    var webP = new Image();
    webP.onload = webP.onerror = function () {
        callback(webP.height == 2);
    };
    webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {

    if (support == true) {
        document.querySelector('body').classList.add('webp');
    }else{
        document.querySelector('body').classList.add('no-webp');
    }
});
