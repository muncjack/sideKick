
var CurrentDoc = [];
CurrentDoc.blob = '# Please select a Doc to load.....';
var WikiMode = 'view';
var WikiFilePath = '/';
var WikiFileName = 'index';
var WikiFileModified = 0;
var WikiCommitList = '';

//-------------------------------------------------------------------------------------------------
// This function str2hexstr 
// ------
// perpuse:
//  create a unique key based on a string
// input:
//  ascii string
// result:
//  creates hex string based on the input string 
//=================================================================================================
function str2hexstr(str){
    var hash = '', i, char;
    if (str.length == 0) return hash;
    for (i = 0, l = str.length; i < l; i++) {
        hash  += Number(str.charCodeAt(i)).toString(16).toUpperCase();
    }
    return hash;
};

//-------------------------------------------------------------------------------------------------
// This function changes the togols the display status 
// ------
// input:
//  takes the id name 
// affect:
//  will change the given id from display: none to display: block
//  or visversa  
//=================================================================================================
function togolDiv(objId){
    console.log('DEBUG togolDiv starting');
    if (document.getElementById(objId).style.display === 'block') {
        console.log('DEBUG togolDiv ' + objId + 'to view')
        document.getElementById(objId).style.display = 'none';
    } else {
        console.log('DEBUG togolDiv ' + objId + 'to bloc')
        document.getElementById(objId).style.display = 'block';
    }
    console.log('DEBUG togolDiv done.');
}


//-------------------------------------------------------------------------------------------------
// This function put the request file into  current doc and loads it into the view div
// ------
// input:
//  takes the markdown file content 
// affect:
//  put fil var CurrentDoc.blob with it 
//  
//=================================================================================================
function wikiFileSave(){
    console.log('DEBUG wikiFileSave starting');
    console.log('DEBUG wikiFileSave doing ajax call');
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: false,
        url: "/wiki/updateFile",
        data: JSON.stringify({ "path": CurrentDoc.filePath, "file": CurrentDoc.fileName, "blob" :  CurrentDoc.blob }),
        complete: function(data, status){console.log('DEBUG wikiFileSave ajax call done' + status)},
        dataType: "json"
    });
    cname = str2hexstr(CurrentDoc.filePath); 
    //console.log('\tDEBUG wikiFileSave hash: ' + cname);
    ulname = $('#ul-treeview-' + cname);
    //ulname.hide();
    console.log('\tDEBUG wikiFileSave hash: ' + ulname.attr('id'));
    wikiFolderGet(ulname, CurrentDoc.filePath);
    wikiGitStatusCheck();
    console.log('DEBUG wikiFileSave done.');
}

//-------------------------------------------------------------------------------------------------
// This function request a given file for loading
// ------
// input:
//  takes the file name and path 
// affect:
//  it will request the file and call a function to do all the work
//  
//=================================================================================================
function WikiFileGet(obj, filePath, file){
    console.log('DEBUG WikiFileGet starting');
    if ( document.getElementById('ModeButton').innerHTML === 'view'){
            switchMode()    
    }
    console.log('DEBUG WikiFileGet do ajax call to get new file ');
        $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
    async: false,
        url: "/wiki/GetFileJ",
        data: JSON.stringify({ "filePath": filePath, "fileName": file}),
        complete: function(data, status){
            console.log('DEBUG WikiFileGet recieved response from server');
            loadWikiFile(JSON.parse(data.responseText));
        },
        dataType: "json"
        });
        //$(this).preventDefault();
    console.log('DEBUG WikiFileGet done.');
        return false;
}

function wikiFileDelete(){
    console.log('DEBUG wikiDeleteFile: starting');
    console.log('DEBUG wikiDeleteFile: deleteting file: ' + CurrentDoc.fileName + 'in dir: ' + CurrentDoc.filePath);
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: false,
        url: "/wiki/fileDelete",
        data: JSON.stringify({ "path": CurrentDoc.filePath, "file": CurrentDoc.fileName}),
        success: console.log('DEBUG wikiDeleteFile: request sent.'),
        complete: function(data, status){
            if (status === 'success'){
                $("#previewPane").hide();
                $("#divFileButtons").hide();
                alert('file: ' + CurrentDoc.filePath + '/' + CurrentDoc.fileName + ' has been deleted.');
            }else{
                alert('Sorry failed to delete file: ' + CurrentDoc.filePath + '/' + CurrentDoc.fileName )
            }
        },
        dataType: "json"
    });    
    cname = str2hexstr(CurrentDoc.filePath); 
    ulname = $('#ul-treeview-' + cname);
    wikiFolderGet(ulname, CurrentDoc.filePath);
    console.log('DEBUG wikiDeleteFile: done');
}

//-------------------------------------------------------------------------------------------------
// This function put the request file into  current doc and loads it into the view div
// ------
// input:
//  takes the markdown file content 
// affect:
//  put fil var CurrentDoc.blob with it 
//  
//=================================================================================================
function loadWikiFile(data){
    console.log('DEBUG loadWikiFile starting');
    console.log('loadinfg data --- ');
    CurrentDoc = data;
    $("#previewPane").html(marked(CurrentDoc.blob));
    $("#DocEditor").val(CurrentDoc.blob);
    $("#previewPane").show();
    $("#divFileButtons").show();
    $("#wikiFilePath").val(CurrentDoc.filePath );
    $("#wikiFileName").val( CurrentDoc.fileName);
    $("#wikiFilePath").attr('disabled','disabled');
    $("#wikiFileName").attr('disabled','disabled');
    console.log('DEBUG loadWikiFile done');
}

function wikiNewFile(){
    console.log('DEBUG wikiNewFile starting');
    CurrentDoc.blob = '';
    CurrentDoc.fileName = '';
    CurrentDoc.newFile = true;
    $("#wikiFileName").val( 'NewFile');
    if (typeof CurrentDoc.filePath == 'undefined'){
        CurrentDoc.filePath = '/'
    }
    $("#wikiFilePath").val(CurrentDoc.filePath );
    $("#divFileButtons").show();
    wikiSwitchModeEdit();
    console.log('DEBUG wikiNewFile done');
}



function GetAboutHelp(item){
    $.get('/static/' + item + '.md', function(data){loadWikiFileIntoModal(data)} );
}

function loadWikiFileIntoModal(data){
    console.log('loadinfg data into modal '  );
    $.modal(marked(data));
}





//-------------------------------------------------------------------------------------------------
// This function change the editor fron view to edit or edit to view
// ------
// input:
//  none
// affect:
//  the function will read the current state of the modeButton and
//  update it will update the button and hide/unhide the view and edit DIV
//  Switching from view to edit:
//      * hide the view DIV
//      * load the markdown source into the editor
//      * unhide the editor
//  Switching from edit to view:
//      * hide editor
//      * take markdown source from editor
//      * convert it to html and load it into the view DIV
//      * unhide the view DIV
//  
//=================================================================================================
function switchMode(){
    var editMode = $("#ModeButton").text();
    console.log('DEBUG switchMode starting');
    switch ( editMode ){
        case 'edit': 
            wikiSwitchModeEdit()    
            break;
        case 'view': 
            console.log('DEBUG switchMode change mode to view');
            wikiSwitchModeView()
            break;
        default:
            console.log('unknow action:' + editMode );
            break;
        }
    console.log('DEBUG switchMode done.');
}

function wikiSwitchModeView(){
    console.log('DEBUG switchMode starting');
    console.log('DEBUG switchMode change mode to view');
    $("#div_edit").hide();
    if (CurrentDoc.fileName == ''){
        CurrentDoc.fileName = $("#wikiFileName").val();
        CurrentDoc.filePath = $("#wikiFilePath").val();
    }
    if (CurrentDoc.blob != $("#DocEditor").val()){
        console.log('DEBUG switchMode Doc has changed time to save it');
        CurrentDoc.blob = $("#DocEditor").val();
        console.log('calling saveWikiFilse');
        wikiFileSave();
    }
    $("#wikiFilePath").attr('disabled','disabled');
    $("#wikiFileName").attr('disabled','disabled');
    $("#previewPane").html(marked(CurrentDoc.blob));
    $("#previewPane").show();
    $("#divDirButtons").show();  
    $("#wikiFileDel").show()
    $("#ModeButton").text('edit')
    console.log('DEBUG switchMode done.');
}

function wikiSwitchModeEdit(){
    console.log('DEBUG switchMode starting');
    $("#DocEditor").val(CurrentDoc.blob);
    $("#previewPane").hide();
    $("#div_edit").show();
    $("#ModeButton").text('view');
    $("#wikiFilePath").removeAttr('disabled');        
    $("#wikiFileName").removeAttr('disabled');  
    $("#divDirButtons").hide(); 
    $("#wikiFileDel").hide()   
    console.log('DEBUG switchMode done.');
}


function wikiSearchSubmit(){
    $('#input-search').val()
    console.log('DEBUG wikiSearchSubmit: ' + 'content-Type: "application/json; charset=utf-8"');
    console.log('DEBUG wikiSearchSubmit: ' + JSON.stringify({ "searchStr": $('#input-search').val()}));
    $('#ul-search-result').empty();
    $('#ul-search-result').append('<span style="color: green">search submited</span>');
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: false,
        url: "/wiki/search",
        data: JSON.stringify({ "searchStr": $('#input-search').val()}),
        success: console.log('DEBUG searchStr: request sent.'),
        complete: function(data, status){
            if (status === 'success'){
            $('#ul-search-result').empty();
            searchResult = JSON.parse(data.responseText);
            gray= 0;
            scount = 0;
            searchResult.filelist.forEach(function(a){
                console.log(a);
                if ( gray === 0){
                    gray = 1
                    $('#ul-search-result').append('<li onclick="WikiFileGet(this, \'' + a[0] + '\', \'' + a[1] + '\') ">' + a[0] + '<BR/>->' + a[1] + '</li>')
                }else{
                    gray = 0
                    $('#ul-search-result').append('<li title="Please click load" onclick="WikiFileGet(this, \'' + a[0] + '\', \'' + a[1] + '\') " class="gray">' + a[0] + '<BR/>->' + a[1] + '</li>')
                    }
                scount ++;
                });
            if (scount == 0){
                $('#ul-search-result').append('<span style="color: green">not results...</span>');
            }
            }else{alert('search failed!' )}},
        dataType: "json"
    });    
}


//-------------------------------------------------------------------------------------------------
// name: wikiFolderOnclick
// ------
// input:
//      path of the folder for witch content required 
// affect:
//      if the folder is visible hide it OR if the folder is hiden un-hide it 
//      and get the content from the server and call the function to update 
//      the content of the folder.
//  
//=================================================================================================
function wikiFolderOnclick(folder){
    console.log("DEBUG wikiFolderOnclick: starting for " + folder);
    cname = str2hexstr(folder);
    parentLi = $('#lifolder-' + cname); 
    ulname = $('#ul-treeview-' + cname);
    if (ulname.is(":visible") === false) {
        parentLi.addClass('lifolder-minus').removeClass('lifolder-plus');
            wikiFolderGet(ulname, folder);
            myparent = ulname.parent();
        if (myparent.attr('class') != 'folderTree'){
                myparent.find('ul').not(ulname).each(function(e){
                    $(this).hide();
                    l= '#' + $(this).attr('id').replace(/^ul-treeview/, 'lifolder');
                    $(l).addClass('lifolder-plus').removeClass('lifolder-minus')
                });
            }
    }else {
            ulname.hide();
            parentLi.addClass('lifolder-plus').removeClass('lifolder-minus');
    }
    console.log("DEBUG wikiFolderOnclick: ending for " + folder);
}

function wikiFolderGet(ulname, folder){
    console.log('\tDEBUG wikiFolderGet: starting');
    $.ajax({
        type: "POST",
    contentType: "application/json; charset=utf-8",
    async: false,
    url: "/wiki/GetFolder",
    data: JSON.stringify({ "path": folder}),
    success: console.log('\tDEBUG wikiFolderGet: request sent.'),
    complete: function(data, status){
            if (status === 'success'){
                wikiFolderAddContent(ulname, JSON.parse(data.responseText));
                ulname.show();
            }else{alert('wikiFolderContent failed to retrive: ' + folder )}},
                dataType: "json"
        });    

    console.log('\tDEBUG wikiFolderGet: ending');
}

function wikiFolderAddContent(ulname, folderContent){
    console.log('\t\tDEBUG starting: wikiFolderAddContent');
    ulname.empty();
    icount = 0;
    folderContent.folders.forEach(function(f){
        fullPath = folderContent.path;
        if (folderContent.path != '/'){
            fullPath += '/';
        }
        fullPath += f;
        bname = str2hexstr(fullPath);
        ulname.append('<li class="lifolder-plus" id="lifolder-' + bname + '" onclick="wikiFolderOnclick(\'' + fullPath + '\')">' + f + '/</li>');
        ulname.append('<ul id="ul-treeview-' + bname + '"></ul>');
        icount ++;
    })
    folderContent.files.forEach(function(f){
        //myli = '<li class="libullet" id="lifile-__BNAME__" onclick="WikiFileGet(\'__PATH__\', \'__NAME__\')"> __NAME__ </li>';
        bname = str2hexstr(fullPath);
        myli = '<li id="lifile-__BNAME__" > <a class="file" href="/?pagemode=wiki&filePath=__PATH__&fileName=__NAME__" onclick="WikiFileGet(this, \'__PATH__\', \'__NAME__\');return false">__NAME__</a></li>';
        ulname.append(myli.replace(/__NAME__/g, f).replace(/__PATH__/g, folderContent.path).replace(/__BNAME__/g, bname));
        icount ++;
    });
    if (icount == 0){
        ulname.append('<span style="color: green">empty</span>');
    }
    console.log('\t\tDEBUG ending: wikiFolderAddContent');
}


function wikiFolderGoto(pathg){
    console.log('DEBUG wikiFolderGoto: starting');
    pg='/';
    $('#ul-treeview-' + str2hexstr(pg)).hide();
    if (pathg == '/'){wikiFolderOnclick(pathg);}
    else{
        pathg.split('/').forEach(function(f){
            pg += f;
            console.log('')
            wikiFolderOnclick(pg);
            if(pg != '/') {
                pg += '/'
            }
        });
    }
    console.log('DEBUG wikiFolderGoto: finishing');
}




function wikiGitStatusCheck(){
    console.log('DEBUG gitStatusCheck: starting');
    autocheck = autocheck || false;
    // set the default delay for re-schedule
    timer = 60000
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        url: "/wiki/git",
        data: JSON.stringify({ "action": "status"}),
        success: console.log('\tDEBUG gitStatusCheck: request sent.'),
        //if fail set schedule to 5 minute (300000)
        error: function(autocheck){
            if(autocheck){
                // last git status check failed back of set timer to 1 minute 
                console.log("auto schedulling my self in " + time/1000 + " seconds");
                setTimeout ( "wikiGitStatusCheck(autocheck=true)", timer );
            }},
        complete: function(data, status){
            console.log(status);
            console.log(data.responseText);
            p = JSON.parse(data.responseText);
            $('#div-top-status').html(data.responseText);
            //if p.PushRequired
            htm = '';
            if (p.pullRequired == -1){
                htm = "remote is N/A "
            }else{
                if (p.pushRequired == 1){
                    htm += '<button onclick="wikiGitAction($(this).text())">push</button>';
                }
                if ((p.pullRequired == 1 ) || (p.pushRequired == -1)){
                    htm += '<button onclick="wikiGitAction($(this).text())">pull</button>';
                }
            };
            if ((p.Tracked.length > 0)||(p.Untracked.length > 0)){
                htm += '<button onclick="wikiPreCommit()">commit all</button>';
            }
            if (htm === ''){
                htm = 'no git action required';
            } else{
                htm = 'git action required: ' + htm;
            }
            if ($('#wikiStatus').html() === undefined ){
                $('#div-top-status').html('<span id="wikiStatus"></span>');
            }
            $('#wikiStatus').html(htm);
            // all done, call my self in 1 minute 
            if(autocheck){
                // if last remote status is -1 then set check to 60 seconds else 30 seconds 
                if(p.pullRequired > -1){
                    timer=timer/2
                };
                console.log("auto schedulling my self in " + timer/1000 + " seconds");
                setTimeout ( "wikiGitStatusCheck(autocheck=true)", timer );
            };
        },
        dataType: "json"
    });
    console.log('DEBUG gitStatusCheck: finishing');
}

function wikiPreCommit(){
    $.modal('commit message: <INPUT id="commit-msg"/></P>\
    <BUTTON onclick="$.modal.close();">cancel</BUTTON><BUTTON onclick="wikiGitAction(\'commit all\',$(\'#commit-msg\').val());">commit</BUTTON></P>\
    <H3>commit preview</H3>\
    <PRE id="commitPreView"></PRE>');
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        url: "/wiki/git",
        data: JSON.stringify({ "action": "status"}),
        success: console.log('\tDEBUG gitStatusCheck: request sent.'),
        complete: function(data, status){
            console.log(status);
            console.log(data.responseText);
            p = JSON.parse(data.responseText);
            //$('#commitPreView').html(p.Tracked.join('\n') + '\n' + p.Untracted.join());
            msg = p.Tracked.join('\n');
            if (p.Untracked.length > 0) {msg += '\nUntracked:\t'+p.Untracked.join('\nUntracked:\t')};
            //$('#commitPreView').text(p.Tracked.join('\n')+ '\nUntracked:\t'+p.Untracked.join('\nUntracked:\t'));
            $('#commitPreView').text(msg);
        },
        dataType: "json"
    });
}

function wikiGitAction(action, msg){
    console.log('DEBUG wikiGitAction: starting');
    console.log('DEBUG wikiGitAction: action --> ' + action);
    jsoncall = { "action": action};
    if (typeof msg !== 'undefined' ){
        console.log('yes');
        jsoncall.msg = msg;
        $.modal.close();
    }
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        url: "/wiki/git",
        data: JSON.stringify(jsoncall),
        success: console.log('\tDEBUG gitStatusCheck: request sent.'),
        complete: function(data, status){
            console.log('DEBUG wikiGitAction: ajax call status: ' + status);
            console.log(data.responseText);
            if ( status === 'success' ){
                p = JSON.parse(data.responseText);
                if ( p.status === 'OK'){
                    c = 'green';
                } else {
                    c = 'red';
                };
                $.modal('<p>git cmd status: <span style="color:' + c + ';background: white;">' + p.status + '</span></p><pre><code>' + p.output + '<code></pre>');
                // need to add folder refresh and posibly current file refresh
                wikiGitStatusCheck(autocheck=false);
            } else {    
                // the resquest has failed to be process by server ....
                console.log("DEBUG wikiGitAction: action has FAILED! ")
            }
        },
        dataType: "json"
    });
    console.log('DEBUG wikiGitAction: ending');
}


