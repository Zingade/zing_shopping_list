$(document).ready(function (){
    if($(window).width() < 768){
        $('.menu-side').on('click', function(e){
            e.preventDefault();
            $('.menu-side li:not(".active")').slideToggle();
        });

        $('.menu-side li:not(".active")').hide();
        $('.menu-side>.active').html('<i class="feather" data-feather="menu"></i>');
        $('.menu-side>.active').addClass('menu-side-mobile');

        // hide menu if there are no items in it
        if($('#navbar ul li').length === 0){
            $('#navbar').hide();
        }

        $('#offcanvasClose').hide();
    }
    
    $(document).on('click', '.menu-btn', function(e){
        e.preventDefault();
        $('body').addClass('pushy-open-right');
    });

    
    $(document).on('click', '.add-variant-to-cart', function(e){
        $.ajax({
            method: 'POST',
            url: '/addtocart',
            data: {
                productId: $(this).attr('data-id')
            }
        })
		.done(function(msg){
            updateCartDiv();
            showNotification(msg.message, 'success');
        })
        .fail(function(msg){
            showNotification(msg.responseJSON.message, 'danger');
        });
    });


    $(document).on('click', '.pushy-link', function(e){
        $('body').removeClass('pushy-open-right');
    });

});

