

//////////////////////////////////////////////////////////////////////////////
// manipulating items

function strike_item(item) {
    if(!item_is_struck(item)) {
        var del = document.createElement("del");
        var txt = item.firstChild;
        item.removeChild(txt);
        del.appendChild(txt);
        item.insertBefore(del,item.firstChild);
        debug("strike_item");
        enable_commit_button();
    }
}

function item_is_struck(item)  {
    var txt = item.firstChild;
    debug("is item struck? " + txt.nodeName);
    return (txt.nodeName == "del" || txt.nodeName == "DEL");
}

function remove_struck_items() {
    var list = document.getElementById("mainlist");
    var removeme = [];
    for(var i = 0; i < list.childNodes.length; ++i) {
	var c = list.childNodes[i];
	if(item_is_struck(c)) {
		removeme[removeme.length] = c;
	}
    }
    for(var i = 0; i < removeme.length; ++i) {
	remove_item(removeme[i]);
    }
}

function remove_item(item) {
    var list = document.getElementById("mainlist");
    list.removeChild(item);
    debug("remove_item");
    enable_commit_button();
}

function item_click_event(item) {
    if(item.parentNode) {
        if(item_is_selected(item)) {
            edit_item_text(item);
        } else {
            select_item(item);
        }
    }
}

function newitem(text) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(text + ' '));
    add_removebutton_to_item(li);
    li.addEventListener("click",  function () {
        item_click_event(li);
    }, false);
    li.setAttribute("class", "item");
    return li;
}

function edit_item_text(item) {
    var text = prompt("item text", "item text goes here");
    var ni = newitem(text);
    item.parentNode.replaceChild(ni, item);
    enable_commit_button();
}

function additem(text) {
    var list = document.getElementById("mainlist");
    var item = newitem(text);
    list.appendChild(item);
    debug("new item added");
    select_item(item);
    enable_commit_button();
}

function deselect_all_items() {
    var list = document.getElementById("mainlist");
    for(var child = list.firstChild; null != child; child = child.nextSibling) {
        if(child.setAttribute) {
            child.setAttribute("class", "item");
        } // could be text node?
    }
}

function item_is_selected(item) {
    return "selected item" == item.getAttribute("class");
}

function select_item(item) {
    deselect_all_items();
    item.setAttribute("class", "selected item");
    debug("select_item");
}

//////////////////////////////////////////////////////////////////////////////
// global event hooks and functions

function additem_button() {
    additem("new item");
}

function disable_commit_button() { // not working?
    var input = document.getElementById("commitbutton");
    input.setAttribute("style", "display: none;");
    input.style.display = "none";
}
function enable_commit_button() {
    var input = document.getElementById("commitbutton");
    input.setAttribute("style", "display: inline;");
}

function add_removebutton_to_item(item) {
    var a = document.createElement("a");
    a.href = '#';
    a.appendChild(document.createTextNode("x"));
    a.setAttribute("class", "remove");
    a.addEventListener("click", function (e) {
        strike_item(item);
	e.stopPropagation();
	e.preventDefault();
    }, false);
    item.appendChild(document.createTextNode(" "));
    item.appendChild(a);
}

// find existing items and attach events
function list_startup_existing_item_events() {
    // attach remove events to the 'x' links
    var mainlist = document.getElementById("mainlist");
    for(var i = 0; i < mainlist.childNodes.length; ++i) {
        // linkify mainlist.childNodes[i]
        add_removebutton_to_item(mainlist.childNodes[i]);
    }
    var list = mainlist;
    for(var i = 0; i < list.childNodes.length; ++i) {
        var li = list.childNodes[i];
        var c = li.getAttribute("class");
        if("item" == c) {
            var li2 = li;
            li.addEventListener("click", function() {
                item_click_event(li2);
            }, false);
        }
    }
}

function list_startup() {
    list_startup_existing_item_events();

    var list = document.getElementById("mainlist");
    var input = document.createElement("input");
    var input2 = document.createElement("input");
    input2.type = "submit";
    input2.value = "Commit changes";
    input2.setAttribute("id", "commitbutton");
    input2.addEventListener("click", function() {
        commit_changes();
    }, false);

    input.type = "submit";
    input.value = "new item";
    input.addEventListener("click", function() {
        additem_button();
    }, false);

    list.parentNode.insertBefore(input, list.nextSibling);
    list.parentNode.insertBefore(input2, input.nextSibling);
    disable_commit_button();
    debug("lift-off");
}

function commit_changes() {
    debug("committing...");
    deselect_all_items(); // so we don't save an active item
    remove_struck_items();
    // get the ikiwiki_session_wiki cookie and stick it into our encoded URL
    // as sid=
    // TODO: need to customize page= param
    var mainlist = document.getElementById("mainlist");
    var encoded = "_submitted=1&do=edit&from=&rcsinfo=&type=jonlist&_submit=Save+Page&sid=074cf498d7e21c382c5f5a18e0dee56b=";
    encoded += "&page=" + escape(document.title); // UNRELIABLE
    encoded += "&editcontent=" + escape('<ul id="mainlist">'+mainlist.innerHTML+'</ul>');
    encoded += escape('<textarea id="debugarea"></textarea>');
    var xhr = XMLHttpRequest();
    xhr.open("POST", cgiurl, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-Length", encoded.length);
    xhr.setRequestHeader("Connection", "close");
    // the session cookie? Cookie: _ikiwiki_session_cookie...
    // firefox appends cookies by default
    xhr.send(encoded);
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4) {
            disable_commit_button();
	    debug("committed.");
        } else {
	    debug("xhr.readyState == " + xhr.readyState);
	}
    }
}

function debug(text) {
    debugarea = document.getElementById("debugarea");
    debugarea.value += '\n' + text;
    debugarea.scrollTop = debugarea.scrollHeight;
}

function addOnloadEvent(fun) {
  if(null != window.onload) {
    var old = window.onload;
    window.onload = function(e) {
      old(e);
      fun(e);
    };
  } else {
    window.onload = fun;
  }
}
addOnloadEvent(list_startup);
