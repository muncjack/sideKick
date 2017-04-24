function tabSwitch(active){
    var ulparent = active.parent();
    var content, links = ulparent.find('li');
    content = $(active.attr('href'));
    active.addClass('active');
    content.show();
    links.not(active).each(function () {
        $(this).removeClass('active');
        $($(this).attr('href')).hide();
    });
    
}




function loadMode(NewMode){
    $( '#div-body' ).load( '/body/' + NewMode);
    console.log('DEBUG loadMode starting');
    var fullName = 'TopA-' + NewMode;
    var active = $("html").css( "background-color" );
    var pasive = $("#div-menubar").css( "background-color" );
    $('#div-menubar').find('a').each(function(index, item){
        console.log(item.id + " call for " + NewMode + ' ' + fullName );
        if ( item.id === fullName ){
            console.log('hello');
            $(item).css( "background-color",  active );
        }else{
            $(item).css( "background-color",  pasive);
        }
    });
    console.log('DEBUG loadMode done.');
}



