/*
 * jQuery File Upload Plugin JS Example 8.9.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global $, window */

$(function() {
    'use strict';

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        url: 'server/php/',
        maxFileSize: 100000,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp)$/i
    });

    // Load existing files:
    $('#fileupload').addClass('fileupload-processing');
    $.ajax({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        url: $('#fileupload').fileupload('option', 'url'),
        dataType: 'json',
        context: $('#fileupload')[0]
    }).always(function() {
        $(this).removeClass('fileupload-processing');
    }).done(function(result) {
        $(".files").html('');
        $(this).fileupload('option', 'done')
                .call(this, $.Event('done'), {result: result});
        for(var key in result.files){
            $('#collapseOne').children().children().prepend('<label class="objet btn btn-default"><input type="radio" name="objets"><img alt="rocks" src="'+result.files[key].url+'" width="93" height="75" class="img-rounded"/></label>');
        }
    });

});
