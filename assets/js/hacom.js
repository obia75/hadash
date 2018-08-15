var config;
var glentities;
var longpressevent;

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var d = today.getDay();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('dash_time').innerHTML = h + ":" + m;
    var d = new Date();    
    var dayname = config.settings.strings.weekdays[String(d.getDay())];
    var monthname = config.settings.strings.months[String(d.getMonth())];
    document.getElementById('dash_date').innerHTML = dayname + ", " + today.getDate() + " " + monthname;
    var t = setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};
    return i;
}

function initConnection() {
    var wsprot;
    (config.settings.protocol == "https") ? wsprot = "wss" : wsprot = "ws";
    var HAURL = wsprot + "://" + config.settings.servername + ":" + config.settings.port + "/api/websocket";
    HAWS.createConnection(HAURL,{
        authToken: config.settings.api_password
    }).then(conn => {
        HAWS.subscribeEntities(conn, parseEvent);
    }, err => { console.log(err); });
}

function callHAService(service,payload) {
    var wsprot;
    (config.settings.protocol == "https") ? wsprot = "wss" : wsprot = "ws";
    var HAURL = wsprot + "://" + config.settings.servername + ":" + config.settings.port + "/api/websocket";
    HAWS.createConnection(HAURL,{
        authToken: config.settings.api_password
    }).then(conn => {
        conn.callService("homeassistant", service,payload);
    }, err => { });
}

function parseEvent(entities) {
    glentities = entities;
    
    for (i=0 ; i < config.layout.topmenu.length ; i++) {
        for(var j=0; j < config.layout.topmenu[i].content.mainview.overlay.length; j++) {
            shortent = config.layout.topmenu[i].content.mainview.overlay[j].entity_id.split(".")[0] + "." + config.layout.topmenu[i].content.mainview.overlay[j].entity_id.split(".")[1];
            if (config.layout.topmenu[i].content.mainview.overlay[j].entity_id.indexOf('attributes') > 0) {
                //Panel attribute, read only
                if (entities.hasOwnProperty(shortent)) updateAttributes(config.layout.topmenu[i].content.mainview.overlay[j].entity_id, entities[shortent].attributes[config.layout.topmenu[i].content.mainview.overlay[j].entity_id.split(".")[3]]);
            } else {
                //Buttons and clickable panels
                if (entities.hasOwnProperty(shortent)) updateButtons(config.layout.topmenu[i].content.mainview.overlay[j].entity_id, entities[config.layout.topmenu[i].content.mainview.overlay[j].entity_id].state);
            }
        }
        for(var j=0; j < config.layout.topmenu[i].content.rightview.panels.length; j++) {
            shortent = config.layout.topmenu[i].content.rightview.panels[j].entity_id.split(".")[0] + "." + config.layout.topmenu[i].content.rightview.panels[j].entity_id.split(".")[1];
            //Clickable panels
            if (entities.hasOwnProperty(shortent)) updateRightPanels(config.layout.topmenu[i].content.rightview.panels[j].entity_id, entities[config.layout.topmenu[i].content.rightview.panels[j].entity_id].state); 
        }
    }

    //Weather
    if (config.layout.hasOwnProperty('weather')) {
        $("#weather_container").removeClass("displayNone");
        if (config.layout.weather.temperature.hasOwnProperty('entity_id') && config.layout.weather.temperature.entity_id.length > 0) {
            shortent = config.layout.weather.temperature.entity_id.split(".")[0] + "." + config.layout.weather.temperature.entity_id.split(".")[1];
            if (config.layout.weather.temperature.entity_id.indexOf('attributes') > 0) {
                document.getElementById("weather_temp").innerHTML = entities[shortent].attributes[config.layout.weather.temperature.entity_id.split(".")[3]] + config.layout.weather.temperature.unit;
            } else {
                document.getElementById("weather_temp").innerHTML = entities[config.layout.weather.temperature.entity_id].state + " " + config.layout.weather.temperature.unit;
            }   
        }
        if (config.layout.weather.sub_info.hasOwnProperty('entity_id') && config.layout.weather.sub_info.entity_id.length > 0) {
            shortent = config.layout.weather.sub_info.entity_id.split(".")[0] + "." + config.layout.weather.sub_info.entity_id.split(".")[1];
            if (config.layout.weather.sub_info.entity_id.indexOf('attributes') > 0) {
                document.getElementById("weather_sub_info").innerHTML = entities[shortent].attributes[config.layout.weather.sub_info.entity_id.split(".")[3]] + config.layout.weather.sub_info.unit;
            } else {
                document.getElementById("weather_sub_info").innerHTML = entities[config.layout.weather.sub_info.entity_id].state + " " + config.layout.weather.sub_info.unit;
            }
        }
    } else {
        $("#weather_container").addClass("displayNone");
    }

    setUpLongPressButtons();
}

function updateButtons(entity_id,state) {
    if (entity_id.indexOf("camera") != -1) {
        //Camera
        var cameraid = "cam_panel_img_" + entity_id;
        if (document.getElementById(cameraid) && glentities[entity_id].attributes.hasOwnProperty('entity_picture')) {
            document.getElementById(cameraid).src = config.settings.protocol + "://" + config.settings.servername + ":" + config.settings.port + glentities[entity_id].attributes.entity_picture;
        }
    } else {
        var btnid = "btn_" + entity_id;
        if (document.getElementById(btnid)) {
            document.getElementById(btnid).classList.remove("btn-primary");
            document.getElementById(btnid).classList.remove("btn-dark");
            if (state == "on") {
                document.getElementById(btnid).classList.add("btn-primary");
            } else {
                document.getElementById(btnid).classList.add("btn-dark");
            }
        }
        var labelid = "label_" + entity_id;
        if (document.getElementById(labelid)) {
            document.getElementById(labelid).innerHTML = state;
        }
        var panelid = "panel_" + entity_id;
        if (document.getElementById(panelid)) {
            document.getElementById(panelid).innerHTML = state;
        }
    }
}

function updateRightPanels(entity_id,state) {
    var panelid = "rpicon_" + entity_id;
    var statusid = "rpstatus_" + entity_id;
    if (document.getElementById(panelid)) {
        document.getElementById(panelid).classList.remove("bg-icon-primary");
        document.getElementById(panelid).classList.remove("bg-icon-inverse");
        if (state == "on") {
            document.getElementById(panelid).classList.add("bg-icon-primary");
            document.getElementById(statusid).innerHTML = config.settings.strings.on;
        } else {
            document.getElementById(panelid).classList.add("bg-icon-inverse");
            document.getElementById(statusid).innerHTML = config.settings.strings.off;
        }
    }
}

function updateAttributes(entity_id,attributes) {
    var panelid = "panel_" + entity_id;
    var labelid = "label_" + entity_id;
    if (document.getElementById(panelid)) {
        document.getElementById(panelid).innerHTML = attributes;
    }
    if (document.getElementById(labelid)) {
        document.getElementById(labelid).innerHTML = attributes;
    }
}

function setDivSize() {
    $("div[id^='ovbg_']").each(function () {
        var tmp = $(this).attr('id').split("_");
        var suffix = tmp[1];
        if( $('#ovbg_' + suffix).css('background-image') != null && $('#ovbg_' + suffix).css('background-image') != "none")  { 
            var imageSrc = $('#ovbg_' + suffix).css('background-image').replace('url(', '').replace(')', '').replace(/'/g, '').replace(/"/g, '');
            if (imageSrc) {
                var image = new Image();
                image.onload = function() {
                    width = this.width;
                    height = this.height;
                    $("#ovbg_" + suffix).height(height);
                    $("#ovbtns_" + suffix).width(width);
                    $("#ovbtns_" + suffix).height(height);
                };
                image.src = imageSrc;
            }
        } else {
            $('#ovbg_' + suffix).css('min-height', '580px');
            $('#ovbtns_' + suffix).css('min-height', '580px');
            $("#ovbtns_" + suffix).width('100%');
        }
    });
}

function handleButtonClick(event) {
    if ($(".marked-as-having-a-popover").length>0) {
        
    } else {
        var btnid = event.target.parentNode.id;
        var entity_id = event.target.parentNode.id.replace("btn_","");
        var service = "turn_on";
        if (document.getElementById(btnid).classList.contains("btn-primary")) {
            service = "turn_off";
        } 
        var payload = {"entity_id":entity_id };
        callHAService(service,payload);
    }   
}

function handleRPClick(entity_id) {
    if ($(".marked-as-having-a-popover").length>0) {
    } else {
        var statusid = "rpicon_" + entity_id;
        var service = "turn_on";
        if (document.getElementById(statusid).classList.contains("bg-icon-primary")) {
            service = "turn_off";
        } 
        var payload = {"entity_id":entity_id };
        callHAService(service,payload);
    }
}

function setBrightness(el) {
    var entity_id = el.id.replace("range_btn_","");
    var entity_id = entity_id.replace("range_bright_","");
    var entity_id = entity_id.replace("btn_","");
    var entity_id = entity_id.replace("btnicon_","");
    var entity_id = entity_id.replace("rp_","");
    var brightness = el.value;
    var service = "turn_on";
    var payload = {"entity_id":entity_id,"brightness":brightness};
    callHAService(service,payload);
}

function setColorTemp(el) {
    var entity_id = el.id.replace("range_btn_","");
    var entity_id = entity_id.replace("range_temp_","");
    var entity_id = entity_id.replace("btn_","");
    var entity_id = entity_id.replace("btnicon_","");
    var entity_id = entity_id.replace("rp_","");
    var color_temp = el.value;
    var service = "turn_on";
    var payload = {"entity_id":entity_id,"color_temp":color_temp};
    callHAService(service,payload);
}

function showCameraPopup(node) {       
    $("#ha-modal-content").html("<img style='width:100%;height:100%' src='" + node.src + "'>");
    $('#ha-modal').modal({show: true});
}

function buildPage() {
    //General settings
    if (config.layout.global_params.hasOwnProperty('bgcolor')) {
        document.documentElement.style["background-color"] = config.layout.global_params.bgcolor;
        document.body.style["background-color"] = config.layout.global_params.bgcolor;
    }

    //Top menu tabs
    var nav = document.getElementById('topmenutabs');
    for (i=0 ; i < config.layout.topmenu.length ; i++) {
        var li = document.createElement('li');
        li.setAttribute('class','nav-item');
        var a = document.createElement('a');
        a.setAttribute('href','#' + config.layout.topmenu[i].id);
        a.setAttribute('data-toggle','tab');
        a.setAttribute('aria-expanded','true');
        (i==0) ? a.setAttribute('class','nav-link my-nav-link active') : a.setAttribute('class','nav-link my-nav-link');
        a.appendChild(document.createTextNode(config.layout.topmenu[i].title));
        li.appendChild(a);
        nav.appendChild(li);
    }
    
    //RSS
    if (config.layout.global_params.hasOwnProperty('rssurl') && config.layout.global_params.rssurl.length > 0) {
        setupRSS(config.layout.global_params.rssurl);
    }
   
    //Tab content
    var tabcontent = document.getElementById('tab-content');
    for (i=0 ; i < config.layout.topmenu.length ; i++) {
        var divtabpane = document.createElement('div');
        (i==0) ? divtabpane.setAttribute('class','tab-pane fade show active') : divtabpane.setAttribute('class','tab-pane fade'); 
        divtabpane.setAttribute('id',config.layout.topmenu[i].id);
        var divrow = document.createElement('div');
        divrow.setAttribute('class','row');
        
        //Main left column
        //Bottom layer
        var divleftcol = document.createElement('div');
        if (config.layout.topmenu[i].content.hasOwnProperty('rightview')) { 
            divleftcol.setAttribute('class','col-sm-9');
        } else {
            divleftcol.setAttribute('class','col-sm-12');
        }
        if (config.layout.topmenu[i].content.mainview.hasOwnProperty('bgimage') && config.layout.topmenu[i].content.mainview.bgimage.length > 0) {
            divleftcol.setAttribute('style','background: url(\'images/' + config.layout.topmenu[i].content.mainview.bgimage + '\');background-repeat: repeat');
        }

        //Middle layer
        var divovbg = document.createElement('div');
        divovbg.setAttribute('id','ovbg_' + config.layout.topmenu[i].id);
        if (config.layout.topmenu[i].content.mainview.hasOwnProperty('overlaybgimage') && config.layout.topmenu[i].content.mainview.overlaybgimage) {
            divovbg.setAttribute('style','background: url(\'images/' + config.layout.topmenu[i].content.mainview.overlaybgimage + '\');background-repeat: no-repeat;background-position: center; ');
        }

        //Top layer
        var divovbtns = document.createElement('div');
        divovbtns.setAttribute('id','ovbtns_' + config.layout.topmenu[i].id);
        divovbtns.setAttribute('style','margin:auto;position:relative');

        var divsubrow = document.createElement('div');
        divsubrow.setAttribute('class','row');
        for(var j=0; j < config.layout.topmenu[i].content.mainview.overlay.length; j++) {
            if (config.layout.topmenu[i].content.mainview.layout == "grid") { 
                var divsubcol = document.createElement('div');
                divsubcol.setAttribute('class','col');
                var itemPosition = "";
            } else {
                var itemPosition = 'bottom: ' + config.layout.topmenu[i].content.mainview.overlay[j].position.y + 'px;left: ' + config.layout.topmenu[i].content.mainview.overlay[j].position.x + 'px;position:absolute';
            }
            if (config.layout.topmenu[i].content.mainview.overlay[j].type == "rounded-button" || config.layout.topmenu[i].content.mainview.overlay[j].type == "button") {
                //Rounded button
                var divwidget = document.createElement('div');
                divwidget.setAttribute('class','text-center');
                divwidget.setAttribute('style','padding:0px 0px 0px 0px;' + itemPosition);
                var buttonround = document.createElement('button');
                buttonround.setAttribute('onclick','handleButtonClick(event);');
                buttonround.setAttribute('id','btn_' + config.layout.topmenu[i].content.mainview.overlay[j].entity_id);
                if (config.layout.topmenu[i].content.mainview.overlay[j].type == "button") {
                    buttonround.setAttribute('class','btn btn-icon waves-effect waves-light btn-dark m-b-5');
                } else {
                    buttonround.setAttribute('class','btn btn-icon waves-effect waves-light btn-dark m-b-5 rounded-button');
                }
                if (config.layout.topmenu[i].content.mainview.overlay[j].hasOwnProperty('size')) {
                    buttonround.setAttribute('style','width:' + config.layout.topmenu[i].content.mainview.overlay[j].size.width + 'px;height:' + config.layout.topmenu[i].content.mainview.overlay[j].size.height + 'px');
                } 
                var itag = document.createElement('i');
                itag.setAttribute('id','btnicon_' + config.layout.topmenu[i].content.mainview.overlay[j].entity_id);
                itag.setAttribute('class',"mdi " + config.layout.topmenu[i].content.mainview.overlay[j].icon);
                if (config.layout.topmenu[i].content.mainview.overlay[j].hasOwnProperty('size')) {
                    itag.setAttribute('style','font-size:' + parseInt(config.layout.topmenu[i].content.mainview.overlay[j].size.height)/2 + 'px;');
                }
                buttonround.appendChild(itag);
                if (config.layout.topmenu[i].content.mainview.overlay[j].hasOwnProperty('label') && config.layout.topmenu[i].content.mainview.overlay[j].label.length > 0) {
                    var brk = document.createElement('br');
                    var btnlabel = document.createElement('label');
                    btnlabel.setAttribute('for','btn_' + config.layout.topmenu[i].content.mainview.overlay[j].entity_id);
                    if (config.layout.topmenu[i].content.mainview.overlay[j].hasOwnProperty('label_color') && config.layout.topmenu[i].content.mainview.overlay[j].hasOwnProperty('label_background') ) {
                        btnlabel.setAttribute('style','font-size:' + config.layout.topmenu[i].content.mainview.overlay[j].text_size + 'px;color:' + config.layout.topmenu[i].content.mainview.overlay[j].label_color + ';background-color:' + config.layout.topmenu[i].content.mainview.overlay[j].label_background + ';padding:2px 6px 2px 6px');
                    } else {
                        btnlabel.setAttribute('style','color:white;');
                    }
                    btnlabel.appendChild(document.createTextNode(config.layout.topmenu[i].content.mainview.overlay[j].label));
                    divwidget.appendChild(buttonround);
                    divwidget.appendChild(brk);
                    divwidget.appendChild(btnlabel);
                    if (config.layout.topmenu[i].content.mainview.layout == "grid") { 
                        divsubcol.appendChild(divwidget);
                    }
                } else {
                    buttonround.appendChild(itag);
                    divwidget.appendChild(buttonround);
                    if (config.layout.topmenu[i].content.mainview.layout == "grid") { 
                        divsubcol.appendChild(divwidget);
                    }
                }
            } else if (config.layout.topmenu[i].content.mainview.overlay[j].type == "panel") {
                //Info panel
                var divwidget = document.createElement('div');
                divwidget.setAttribute('class','widget-bg-color-icon card-box fadeInDown animated');
                if (config.layout.topmenu[i].content.mainview.overlay[j].hasOwnProperty('size')) {
                    divwidget.setAttribute('style','position:relative;height:' + config.layout.topmenu[i].content.mainview.overlay[j].size.height + 'px;width:' + config.layout.topmenu[i].content.mainview.overlay[j].size.width + 'px;' + itemPosition);
                } else {
                    divwidget.setAttribute('style','position:relative;' + itemPosition);
                }
                var divwidgetcontent = document.createElement('div');
                divwidgetcontent.setAttribute('style','margin:0;position:absolute;top:50%;left:50%;margin-right:-50%;transform: translate(-50%, -50%)');
                var headline = document.createElement('h5');
                headline.setAttribute('class','m-t-10 text-dark');
                headline.appendChild(document.createTextNode(config.layout.topmenu[i].content.mainview.overlay[j].title));
                var subheadline = document.createElement('p');
                subheadline.setAttribute('class','m-t-10 text-dark text-center');
                var unit = "";
                (config.layout.topmenu[i].content.mainview.overlay[j].hasOwnProperty('unit') && config.layout.topmenu[i].content.mainview.overlay[j].unit.length > 0) ? unit = " " + config.layout.topmenu[i].content.mainview.overlay[j].unit : unit = ""; 
                subheadline.innerHTML = '<span style="font-size:'+ config.layout.topmenu[i].content.mainview.overlay[j].text_size + 'px" id="panel_' + config.layout.topmenu[i].content.mainview.overlay[j].entity_id +'" class="text-info lead m-b-0"><b>' + config.settings.strings.off +'</b></span><span class="text-info lead m-b-0" style="font-size:'+ config.layout.topmenu[i].content.mainview.overlay[j].text_size + 'px">' + unit + '</span>';
                var divclearfix = document.createElement('div');    
                divclearfix.setAttribute('class','clearfix');
                divwidgetcontent.appendChild(headline);
                divwidgetcontent.appendChild(subheadline);
                divwidgetcontent.appendChild(divclearfix);
                divwidget.appendChild(divwidgetcontent);
                if (config.layout.topmenu[i].content.mainview.layout == "grid") { 
                    divsubcol.appendChild(divwidget);
                }
            } else if (config.layout.topmenu[i].content.mainview.overlay[j].type == "camera-panel") {
                //Camera panel
                var divwidget = document.createElement('div');
                divwidget.setAttribute('class','card-box fadeInDown animated');
                divwidget.setAttribute('style','width:' + config.layout.topmenu[i].content.mainview.overlay[j].size.width + 'px;height:' + config.layout.topmenu[i].content.mainview.overlay[j].size.height + 'px;padding:2px 2px 2px 2px;' + itemPosition);
                var imgwidgetcontent = document.createElement('img');
                imgwidgetcontent.setAttribute('style','width:100%;height:100%;');
                imgwidgetcontent.setAttribute('id','cam_panel_img_' + config.layout.topmenu[i].content.mainview.overlay[j].entity_id);
                imgwidgetcontent.setAttribute('onclick','showCameraPopup(this)');
                divwidget.appendChild(imgwidgetcontent);
                if (config.layout.topmenu[i].content.mainview.layout == "grid") { 
                    divsubcol.appendChild(divwidget);
                }
            } else if (config.layout.topmenu[i].content.mainview.overlay[j].type == "label") {
                //Label
                var divwidget = document.createElement('div');
                divwidget.setAttribute('style','z-index:99;font-size:' + config.layout.topmenu[i].content.mainview.overlay[j].text_size + 'px;color:' + config.layout.topmenu[i].content.mainview.overlay[j].label_color + ';background-color:' + config.layout.topmenu[i].content.mainview.overlay[j].label_background + ';padding:2px 6px 2px 6px;' + itemPosition);
                divwidget.innerHTML = '<span id="label_' + config.layout.topmenu[i].content.mainview.overlay[j].entity_id +'"></span>' + " " + config.layout.topmenu[i].content.mainview.overlay[j].unit;
                if (config.layout.topmenu[i].content.mainview.layout == "grid") { 
                    divsubcol.appendChild(divwidget);
                }
            }
            if (config.layout.topmenu[i].content.mainview.layout == "grid") { 
                divsubrow.appendChild(divsubcol);
                divovbtns.appendChild(divsubrow);
            } else {
                divovbtns.appendChild(divwidget);
            }
        }   
        
        divovbg.appendChild(divovbtns);
        divleftcol.appendChild(divovbg);

        //Main right column
        if (config.layout.topmenu[i].content.hasOwnProperty('rightview')) { 
            var divrightcol = document.createElement('div');
            divrightcol.setAttribute('class','col-sm-3');
            var divrightrow = document.createElement('div');
            divrightrow.setAttribute('class','row');
            var divrightrowcol = document.createElement('div');
            divrightrowcol.setAttribute('class','col-sm-12');

            for(var j=0; j < config.layout.topmenu[i].content.rightview.panels.length; j++) {
                var divwidget = document.createElement('div');
                divwidget.setAttribute('class','widget-bg-color-icon card-box fadeInDown animated');
                divwidget.setAttribute('id','rp_' + config.layout.topmenu[i].content.rightview.panels[j].entity_id);
                divwidget.setAttribute('onclick','handleRPClick(\'' + config.layout.topmenu[i].content.rightview.panels[j].entity_id + '\')');
                var divrpicon = document.createElement('div');
                divrpicon.setAttribute('id','rpicon_' + config.layout.topmenu[i].content.rightview.panels[j].entity_id);
                divrpicon.setAttribute('class','bg-icon bg-icon-dark pull-left small-rounded-icon');
                var itag = document.createElement('i');
                itag.setAttribute('class',"mdi " + config.layout.topmenu[i].content.rightview.panels[j].icon);
                itag.setAttribute('style','font-size:25px');
                divrpicon.appendChild(itag);
                
                var divwidgetcontent = document.createElement('div');
                divwidgetcontent.setAttribute('class','text-right');
                var headline = document.createElement('h5');
                headline.setAttribute('class','m-t-10 text-dark');
                headline.appendChild(document.createTextNode(config.layout.topmenu[i].content.rightview.panels[j].title));
                var subheadline = document.createElement('p');
                subheadline.setAttribute('class','text-muted mb-0');
                subheadline.innerHTML = config.settings.strings.status + ': <span id="rpstatus_' + config.layout.topmenu[i].content.rightview.panels[j].entity_id + '" class="text-info">' + config.settings.strings.off + '</span>';
                var divclearfix = document.createElement('div');    
                divclearfix.setAttribute('class','clearfix');
                divwidgetcontent.appendChild(headline);
                divwidgetcontent.appendChild(subheadline);
                divwidgetcontent.appendChild(divclearfix);
                divwidget.appendChild(divrpicon);
                divwidget.appendChild(divwidgetcontent);
                divrightrowcol.appendChild(divwidget);
            }
            
            divrightcol.appendChild(divrightrowcol);
            divrow.appendChild(divleftcol);
            divrow.appendChild(divrightcol);
            divtabpane.appendChild(divrow);
            tabcontent.appendChild(divtabpane);
        } else {
            divrow.appendChild(divleftcol);
            divtabpane.appendChild(divrow);
            tabcontent.appendChild(divtabpane);
        }
    }

}

function setUpLongPressButtons() {
    $("[id^='btn_'],[id^='rp_']").each(function () {
        var btn_id = $(this).attr('id');
        var entity_id = btn_id.replace("btn_","");
        entity_id = entity_id.replace("rp_","");
        
        var brightness = "";
        var brightness_string = "";
        var color_temp = "";
        var color_temp_string = "";
        
        if (glentities[entity_id.split(".")[0] + "." + entity_id.split(".")[1]].attributes.hasOwnProperty('brightness')) {
            brightness = glentities[entity_id.split(".")[0] + "." + entity_id.split(".")[1]].attributes['brightness'];
            brightness_string = '<h5>' + config.settings.strings.brightness + ' (<span id="brightness_label_' + entity_id + '">' + brightness + '</span>)</h5><input id="range_bright_' + entity_id + '" onchange="setBrightness(this);" oninput="document.getElementById(\'brightness_label_' + entity_id + '\').innerHTML = this.value;" value="' + brightness + '" style="width:200px" class="form-control my-slider" type="range" name="range" min="0" max="255">'; 
        }
        if (glentities[entity_id.split(".")[0] + "." + entity_id.split(".")[1]].attributes.hasOwnProperty('color_temp')) {
            color_temp = glentities[entity_id.split(".")[0] + "." + entity_id.split(".")[1]].attributes['color_temp'];
            if (glentities[entity_id.split(".")[0] + "." + entity_id.split(".")[1]].attributes.hasOwnProperty('max_mireds')) {
                var min_temp = glentities[entity_id.split(".")[0] + "." + entity_id.split(".")[1]].attributes.min_mireds;
                var max_temp = glentities[entity_id.split(".")[0] + "." + entity_id.split(".")[1]].attributes.max_mireds;
            } else {
                var min_temp = "250";
                var max_temp = "454";
            }
            color_temp_string = '<h5>' + config.settings.strings.color_temp + ' (<span id="color_temp_label_' + entity_id + '">' + color_temp + '</span>)</h5><input id="range_temp_' + entity_id + '" onchange="setColorTemp(this);" oninput="document.getElementById(\'color_temp_label_' + entity_id + '\').innerHTML = this.value;" value="' + color_temp + '" style="width:200px" class="form-control my-slider" type="range" name="range" min="' + min_temp + '" max="' + max_temp + '">';
        }

        if (brightness > 0 || color_temp > 0) {
            
            var a = document.getElementById(btn_id);

            longpressevent = function(e) {
                $(this).popover({
                    container: 'body',
                    placement: 'auto',
                    trigger:'click',
                    html:true,
                    content: brightness_string + color_temp_string
                });
                $(this).addClass('marked-as-having-a-popover');
                $(this).popover('show');
            };
            a.addEventListener('longpress', longpressevent,false);
        }   
    });
}

function refreshCamera(node)
{
   var times = parseInt(config.settings.camera_refresh)*1000; // gap in Milli Seconds;

   (function startRefresh()
   {
      var address;
      if (node.src.length>0) { 
        if(node.src.indexOf('&time=')>-1)
        address = node.src.split('&time=')[0];
        else 
        address = node.src;
        node.src = address+"&time="+new Date().getTime();
      }
      setTimeout(startRefresh,times);
   })();
}

function setupRSS(url) {
    var htmlout = "";
    var newurl = "https://api.rss2json.com/v1/api.json?callback=showFeed&rss_url=" + url;
    $.get(newurl, function(data) {
        data = data.replace("/**/ showFeed(","");
        data = data.replace(");","");
        feed = JSON.parse(data);
        
        for (i = 0 ; i < feed.items.length ; i++) {
            item = {
                title: feed.items[i].title,
                link: feed.items[i].link,
                date: feed.items[i].pubDate
            }
            var dateobj = new Date(Date.parse(item.date));
            var newdate = checkTime(dateobj.getHours()) + ":" + checkTime(dateobj.getMinutes());
            htmlout = htmlout + "<li><span>" + item.date + "</span><a target=\"_blank\" href=\"" + item.link + "\">" + item.title + "</a></li>";
        }
        document.getElementById("rssfeed").innerHTML = htmlout;
        
        $("ul#rssfeed")
            .clearQueue().stop()       //stops animation
            .unwrap()                  //removes mask div
            .unwrap()                  //removes tickercontainer div
            .unbind()                  //unbinds any events attached (like hover)
            .removeClass('newsticker') //removes the extra class
            .removeAttr('style');      //removes the height style
        $("ul#rssfeed").liScroll();
        var t = setTimeout(function() { setupRSS(url) }, 3600000);

    });

}

$(document).ready(function() {
    //Disable caching
    $.ajaxSetup({ cache: false });

    //Remove popovers on click outside 
    $(document).on('click', function (e) {
        $('[data-toggle="popover"],[data-original-title]').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            $(this).removeClass("marked-as-having-a-popover");
            document.getElementById(this.id).removeEventListener('longpress',longpressevent,false);
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {                
                (($(this).popover('dispose').data('bs.popover')||{}).inState||{}).click = false  // fix for BS 3.3.6
            }
    
        });
    });

    //Load config
    $.getJSON("config/config.json", function(json) {
        config = json;
        buildPage();
        startTime();
        setDivSize();
        initConnection();
        $('[id^="cam_panel_img_"]').each(function () {
            refreshCamera(this);
        });
    
    })
    .fail(function() { 
        alert('Error loading config.json!'); 
    });

    // iOS web app full screen hacks.
    if(window.navigator.standalone == true) {
        // make all link remain in web app mode.
        $('a').click(function() {
            window.location = $(this).attr('href');
            return false;
        });
    }
    
});

