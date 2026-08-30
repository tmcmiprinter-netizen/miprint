AOS.init({
  duration: 700,
  once: true,
  offset: 50
});

new Swiper(".labGallery", {
  loop: true,
  speed: 850,
  autoplay: {
    delay: 4200,
    disableOnInteraction: false
  },
  effect: "slide",
  grabCursor: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true
  },
  navigation: {
    nextEl: ".gallery-next",
    prevEl: ".gallery-prev"
  }
});


new Swiper(".heroBackground", {
  loop: true,
  speed: 1400,
  effect: "fade",
  allowTouchMove: false,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false
  },
  fadeEffect: {
    crossFade: true
  }
});
