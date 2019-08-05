// $(document).ready(function(){
//   $('.header').height($(window).height());
// });

new TypeIt('#typed-heading', {
  strings: ['Software developer.', 'Linguist.', 'Instructor.', 'Entrepreneur.'],
  speed: 40, // set to 60 in production mode; in 0 for testing for convenience
  lifeLike: true,
  breakLines: true
})
.go();

// new TypeIt('#skills', {
//   strings: ['Python', 'JavaScript', 'R', 'HTML/CSS', 'Bootstrap 4', 'NLP'],
//   speed: 20,
//   // lifeLike: true,
//   breakLines: true,
//   nextStringDelay: 0,
//   waitUntilVisible: true,
//   cursor: false
// })
// .go();

// tooltip – short explanation underneath text
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});


$('.navbar-nav>li>a').on('click', function(){
    $('.navbar-collapse').collapse('hide');
});
