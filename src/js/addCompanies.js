(function() {
  'use strict';

	$('.js-add-more-companies').click(function(e){
		e.preventDefault();
		$(this).hide();
		$('#js-form-other-companies').removeClass('is-hidden');
		$('#js-form-other-companies').css('marginTop', '50px');
	});

})();