

//////////////////////////////////////////////////////////////////////////////
// manipulating items

function toggle_strike_item(item) {
    var newtag = "del";
    if(item_is_struck(item)) {
        newtag = "div";
    }
    var newelement = document.createElement(newtag);
    var oldelement = item.firstChild;
    while(oldelement.childNodes.length > 0) {
        var fc = oldelement.firstChild;
        oldelement.removeChild(fc);
        newelement.appendChild(fc);
    }
    item.replaceChild(newelement, oldelement);
    debug("strike_item");
    enable_commit_button();
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
    debug("item_click_event");
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
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    li.appendChild(div);
    add_removebutton_to_item(li);
    add_click_event(li);
    return li;
}

function edit_item_text(item) {
    // XXX: might end up with superfluous <div>s in the item text
    var text = item.firstChild.innerHTML;
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("value", text);
    item.replaceChild(input, item.firstChild);
    // TODO: add an event for submission
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
    var span = document.createElement("span");
    a.href = '#';
    a.appendChild(document.createTextNode("x"));
    a.addEventListener("click", function (e) {
        toggle_strike_item(item);
	e.stopPropagation();
	e.preventDefault();
    }, false);
    span.setAttribute("class", "remove");
    span.appendChild(document.createTextNode(" "));
    span.appendChild(a);
    item.appendChild(span);
    debug("added removebutton");
}

function remove_removebutton_from_item(item) {
    for(var i = 0; i < item.childNodes.length; ++i) {
	if(("span" == item.childNodes[i].nodeName ||
            "SPAN" == item.childNodes[i].nodeName) &&
           "remove" == item.childNodes[i].getAttribute("class")) {
            item.removeChild(item.childNodes[i]);
            return;
        }
    }
    // XXX
    debug("error: tried to remove removebutton and there isn't one");
}

function add_click_event(item) {
    div = item.firstChild;
    div.addEventListener("click", function() {
        item_click_event(div);
    }, false);
    debug("add_click_event");
}

// find existing items and attach events
function list_startup_existing_item_events() {
    // attach remove events to the 'x' links
    var mainlist = document.getElementById("mainlist");
    for(var i = 0; i < mainlist.childNodes.length; ++i) {
        var li = mainlist.childNodes[i];
        add_removebutton_to_item(li);
	add_click_event(li);
    }
}

function append_debug_area() {
    var list = document.getElementById("mainlist");
    if(list) {
        var da = document.createElement("textarea");
        da.setAttribute("id","debugarea");
        list.parentNode.appendChild(da);
    }
}

function list_startup() {
    var mainlist = document.getElementById("mainlist");
    if(!mainlist) {
        return;
    }
    append_debug_area();
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
    var mainlist = document.getElementById("mainlist");

    remove_struck_items();

    // get the ikiwiki_session_wiki cookie and stick it into our encoded URL
    // as sid=
    // TODO: need to customize page= param
    var encoded = "_submitted=1&do=edit&from=&rcsinfo=&type=jonlist&_submit=Save+Page&sid=074cf498d7e21c382c5f5a18e0dee56b=";
    encoded += "&page=" + escape(page);
    encoded += "&editcontent=";
    for(i = 0; i < mainlist.childNodes.length; ++i) {
        var div = mainlist.childNodes[i].firstChild;
        for(j = 0; j < div.childNodes.length; ++j) {
            encoded += escape(div.childNodes[j].nodeValue);
        }
        encoded += escape("\n");
    }
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
    debugarea.rows = "10";
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
