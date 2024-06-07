
(function ($) {
    "use strict";

    window.addEventListener('scroll', function () {
        console.log("Scrollin'");
        const note = document.querySelector('.row img');
        note.style.position = 'relative';
        note.style.animation = 'animation 1.5s ease-out';
    });
    $(document).ready(function ($) {


        //window and animation items
        var animation_elements = $.find('.animation-element');
        var web_window = $(window);

        //check to see if any animation containers are currently in view
        function check_if_in_view() {
            //get current window information
            var window_height = web_window.height();
            var window_top_position = web_window.scrollTop();
            var window_bottom_position = (window_top_position + window_height);

            //iterate through elements to see if its in view
            $.each(animation_elements, function () {

                //get the element sinformation
                var element = $(this);
                var element_height = $(element).outerHeight();
                var element_top_position = $(element).offset().top;
                var element_bottom_position = (element_top_position + element_height);

                //check to see if this current container is visible (its viewable if it exists between the viewable space of the viewport)
                if ((element_bottom_position >= window_top_position) && (element_top_position <= window_bottom_position)) {
                    element.addClass('in-view');
                } else {
                    element.removeClass('in-view');
                }
            });

        }

        //on or scroll, detect elements in view
        $(window).on('scroll resize', function () {
            check_if_in_view()
        })
        //trigger our scroll event on initial load
        $(window).trigger('scroll');

        // testimonial sliders
        $(".testimonial-sliders").owlCarousel({
            items: 1,
            loop: true,
            autoplay: true,
            responsive: {
                0: {
                    items: 1,
                    nav: false
                },
                600: {
                    items: 1,
                    nav: false
                },
                1000: {
                    items: 1,
                    nav: false,
                    loop: true
                }
            }
        });

        // homepage slider
        $(".homepage-slider").owlCarousel({
            items: 1,
            loop: true,
            autoplay: true,
            nav: true,
            dots: false,
            navText: ['<i class="fas fa-angle-left"></i>', '<i class="fas fa-angle-right"></i>'],
            responsive: {
                0: {
                    items: 1,
                    nav: false,
                    loop: true
                },
                600: {
                    items: 1,
                    nav: true,
                    loop: true
                },
                1000: {
                    items: 1,
                    nav: true,
                    loop: true
                }
            }
        });

        // logo carousel
        $(".logo-carousel-inner").owlCarousel({
            items: 4,
            loop: true,
            autoplay: true,
            margin: 30,
            responsive: {
                0: {
                    items: 1,
                    nav: false
                },
                600: {
                    items: 3,
                    nav: false
                },
                1000: {
                    items: 4,
                    nav: false,
                    loop: true
                }
            }
        });

        // count down
        if ($('.time-countdown').length) {
            $('.time-countdown').each(function () {
                var $this = $(this), finalDate = $(this).data('countdown');
                $this.countdown(finalDate, function (event) {
                    var $this = $(this).html(event.strftime('' + '<div class="counter-column"><div class="inner"><span class="count">%D</span>Days</div></div> ' + '<div class="counter-column"><div class="inner"><span class="count">%H</span>Hours</div></div>  ' + '<div class="counter-column"><div class="inner"><span class="count">%M</span>Mins</div></div>  ' + '<div class="counter-column"><div class="inner"><span class="count">%S</span>Secs</div></div>'));
                });
            });
        }

        // projects filters isotop
        $(".product-filters li").on('click', function () {

            $(".product-filters li").removeClass("active");
            $(this).addClass("active");

            var selector = $(this).attr('data-filter');

            $(".product-lists").isotope({
                filter: selector,
            });

        });

        // isotop inner
        $(".product-lists").isotope();

        // magnific popup
        $('.popup-youtube').magnificPopup({
            disableOn: 700,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });

        // light box
        $('.image-popup-vertical-fit').magnificPopup({
            type: 'image',
            closeOnContentClick: true,
            mainClass: 'mfp-img-mobile',
            image: {
                verticalFit: true
            }
        });

        // homepage slides animations
        $(".homepage-slider").on("translate.owl.carousel", function () {
            $(".hero-text-tablecell .subtitle").removeClass("animated fadeInUp").css({ 'opacity': '0' });
            $(".hero-text-tablecell h1").removeClass("animated fadeInUp").css({ 'opacity': '0', 'animation-delay': '0.3s' });
            $(".hero-btns").removeClass("animated fadeInUp").css({ 'opacity': '0', 'animation-delay': '0.5s' });
        });

        $(".homepage-slider").on("translated.owl.carousel", function () {
            $(".hero-text-tablecell .subtitle").addClass("animated fadeInUp").css({ 'opacity': '0' });
            $(".hero-text-tablecell h1").addClass("animated fadeInUp").css({ 'opacity': '0', 'animation-delay': '0.3s' });
            $(".hero-btns").addClass("animated fadeInUp").css({ 'opacity': '0', 'animation-delay': '0.5s' });
        });



        // stikcy js


        //mean menu
        $('.main-menu').meanmenu({
            meanMenuContainer: '.mobile-menu',
            meanScreenWidth: "992"
        });

        // search form
        $(".search-bar-icon").on("click", function () {
            $(".search-area").addClass("search-active");
        });

        $(".close-btn").on("click", function () {
            $(".search-area").removeClass("search-active");
        });

    });


    jQuery(window).on("load", function () {
        jQuery(".loader").fadeOut(1000);
    });


}(jQuery));