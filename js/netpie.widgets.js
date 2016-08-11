/*  NETPIE widget plugin for Freeboard                            */
/*  Developed by Chavee Issariyapat                               */
/*  More information about NETPIE please visit https://netpie.io  */

if (typeof globalStore === "undefined") {
    globalStore = {};
}

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function runCode(cmd) {
    eval(eval(cmd));
}

function onConnectedHandler(microgearRef) {
    /* add code th handle microgearRef connected event */
}

(function() {
    var bcolor = {red:["#FFF","#e74c3c"],green:["#FFF","#2ecc71"],blue:["#FFF","#3498db"],yellow:["#FFF","#f1c40f"],white:["#454545","#ecf0f1"],grey:["#FFF","#bdc3c7"]};

    freeboard.loadWidgetPlugin({
        "type_name"   : "Button",
        "display_name": "Button",
        "description" : "A simple button widget that can perform Javascript action.",
        "fill_size" : false,
        "settings"  : [
            {
                "name"        : "caption",
                "display_name": "Button Caption",
                "type"        : "text"
            },
            {
                "name"        : "text",
                "display_name": "Label Text",
                "type"        : "text"
            },
            {
                "name"        : "color",
                "display_name": "Button Color",
                "type"        : "option",
                "options"     : [
                    {
                        "name" : "Red",
                        "value": "red"
                    },
                    {
                        "name" : "Green",
                        "value": "green"
                    },
                    {
                        "name" : "Blue",
                        "value": "blue"
                    },
                    {
                        "name" : "Yellow",
                        "value": "yellow"
                    },
                    {
                        "name" : "White",
                        "value": "white"
                    },
                    {
                        "name" : "Grey",
                        "value": "grey"
                    }

                ]
            },
            {
                "name"        : "onClick",
                "display_name": "onClick action",
                "type"        : "calculated",
                "description" : "Add some Javascript here. You can chat and publish with a datasource's microgear like this : microgear[\"mygear\"].chat(\"mylamp\",\"ON\"), where \"mygear\" is a microgear reference." 
            },
            {
                "name"          : "onCreatedAction",
                "display_name"  : "onCreated Action",
                "type"          : "text",
                "description"   : "JS code to run after a button is created"
            }

        ],
        newInstance   : function(settings, newInstanceCallback) {
            newInstanceCallback(new buttonWidgetPlugin(settings));
        }
    });

    var buttonWidgetPlugin = function(settings) {
        var self = this;
        var currentSettings = settings;

        self.widgetID = randomString(16);

        var buttonElement = $("<input type=\"button\" class=\"netpie-button\" id=\""+self.widgetID+"\" value=\""+settings.caption+"\" onClick=\"runCode('globalStore[\\'"+self.widgetID+"\\'][\\'onClick\\']')\">");
        var textElement = $("<div class=\"netpie-button-text\">"+(settings.text?settings.text:"")+"</div>");

        globalStore[self.widgetID] = {};
        globalStore[self.widgetID]['onClick'] = settings.onClick;
     
        function updateButtonColor(color) {
            if (bcolor[color]) {
                buttonElement.css({
                    "color" : bcolor[color][0],
                    "background-color" : bcolor[color][1]
                });
            }
        }

        updateButtonColor(settings.color);

        self.render = function(containerElement) {
            $(containerElement).append(buttonElement).append(textElement);
        }

        self.getHeight = function() {
            return 1;
        }

        self.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
            document.getElementById(self.widgetID).value = newSettings.caption;
            updateButtonColor(newSettings.color);
            textElement.text(newSettings.text?newSettings.text:"");
            globalStore[self.widgetID]['onClick'] = newSettings.onClick;
        }

        self.onCalculatedValueChanged = function(settingName, newValue) {
            if(settingName == "caption") {
                $(buttonElement).val(newValue);
            }
        }

        self.onDispose = function() {
        }

        if (settings.onCreatedAction) {
            var timer = setInterval(function() {
                if (Object.getOwnPropertyNames(microgear).length > 0) {
                    clearInterval(timer);
                    eval(settings.onCreatedAction);
                }
            },200);
        }
    }

    freeboard.loadWidgetPlugin({
        "type_name"   : "Toggle",
        "display_name": "Toggle",
        "description" : "A simple toggle widget that can perform Javascript action.",
        "fill_size" : false,
        "settings"  : [
            {
                "name"        : "caption",
                "display_name": "Toggle Caption",
                "type"        : "text"
            },
            {
                "name"          : "state",
                "display_name"  : "Toggle State",
                "type"          : "calculated",
                "description"   : "Add a condition to switch a toggle state here. Otherwise it just toggle by click."
            },
            {
                "name"          : "ontext",
                "display_name"  : "On Text",
                "type"          : "text",
                "default_value" : "ON"
            },
            {
                "name"          : "offtext",
                "display_name"  : "Off Text",
                "type"          : "text",
                "default_value" : "OFF"
            },
            {
                "name"          : "onaction",
                "display_name"  : "onToggleOn Action",
                "type"          : "text",
                "description"   : "JS code to run when a toggle is switched to ON"
            },
            {
                "name"          : "offaction",
                "display_name"  : "onToggleOff Action",
                "type"          : "text",
                "description"   : "JS code to run when a toggle is switched to OFF"
            },
            {
                "name"          : "onCreatedAction",
                "display_name"  : "onCreated Action",
                "type"          : "text",
                "description"   : "JS code to run after a toggle is created"
            }

        ],
        newInstance   : function(settings, newInstanceCallback) {
            newInstanceCallback(new toggleWidgetPlugin(settings));
        }
    });

    var toggleWidgetPlugin = function(settings) {
        var self = this;
        self.widgetID = randomString(16);

        var currentSettings = settings;
        var toggleElement = $("<div class=\"netpie-toggle\"><input type=\"checkbox\" name=\"toggle\" class=\"netpie-toggle-checkbox\" id=\""+self.widgetID+"\" onClick=\"runCode(globalStore['"+self.widgetID+"'][this.checked?'onaction':'offaction']); if(typeof(globalStore['"+self.widgetID+"']['statesource'])!='undefined' && globalStore['"+self.widgetID+"']['statesource']!='') {this.checked = !this.checked} ; \"><label class=\"netpie-toggle-label\" for=\""+self.widgetID+"\"><span class=\"netpie-toggle-inner\" ontext=\""+(settings.ontext||'')+"\" offtext=\""+(settings.offtext||'')+"\" id=\""+self.widgetID+"_inner\"></span><span class=\"netpie-toggle-switch\"></span></label></div><div class=\"netpie-toggle-text\" id=\""+self.widgetID+"_toggleText\">"+(settings.caption||"")+"</div>");

        globalStore[self.widgetID] = {};    
        globalStore[self.widgetID]['onaction'] = settings.onaction;
        globalStore[self.widgetID]['offaction'] = settings.offaction;
        globalStore[self.widgetID]['statesource'] = settings.state;

        self.render = function(containerElement) {
            $(containerElement).append(toggleElement);
        }

        self.getHeight = function() {
            return 1;
        }

        self.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;

            globalStore[self.widgetID]['onaction'] = newSettings.onaction;
            globalStore[self.widgetID]['offaction'] = newSettings.offaction;
            globalStore[self.widgetID]['statesource'] = newSettings.state;
            $('#'+self.widgetID+'_inner').attr('ontext',newSettings.ontext||'');
            $('#'+self.widgetID+'_inner').attr('offtext',newSettings.offtext||'');
            document.getElementById(self.widgetID+'_toggleText').innerHTML = newSettings.caption||'';
        }

        self.onCalculatedValueChanged = function(settingName, newValue) {
            if (settingName == 'state') {
                document.getElementById(self.widgetID).checked = newValue;
            }
        }

        self.onDispose = function() {
            console.log("sss");
        }

        if (settings.onCreatedAction) {
            var timer = setInterval(function() {
                if (Object.getOwnPropertyNames(microgear).length > 0) {
                    clearInterval(timer);
                    eval(settings.onCreatedAction);
                }
            },200);
        }

    }

//--------------------

    freeboard.loadWidgetPlugin({
        "type_name"   : "FeedView",
        "display_name": "FeedView",
        "description" : "",
        "fill_size" : true,
        "settings"  : [
            // {
            //     "name"        : "caption",
            //     "display_name": "FeedView Caption",
            //     "type"        : "text"
            // },
            {
                name: "apikey",
                display_name: "Api Key",
                type: "text",
                required : true
                // "description"   : ""
            },
            {
                name: "granularity",
                display_name: "Granularity",
                type: "option",
                options:[
                    {
                        name: "Second",
                        value: "seconds"
                    },
                    {
                        name: "Minute",
                        value: "minutes"
                    },
                    {
                        name: "Hour",
                        value: "hours"
                    },
                    {
                        name: "Day",
                        value: "days"
                    },
                    {
                        name: "Month",
                        value: "months"
                    },
                    {
                        name: "Year",
                        value: "years"
                    }
                ]
            },
            {
                name: "data",
                display_name: "Data",
                type: "text",
                required : true
                // "description"   : ""
            },
            {
                name: "aggregate",
                display_name: "Aggregate",
                type: "option",
                options:[
                    {
                        name: "Average",
                        value: "avg"
                    }
                ]
            },
            {
                name: "since",
                display_name: "Since",
                type: "text",
                required : true
                // "description"   : ""
            },
            {
                name: "type",
                display_name: "Type of Chart",
                type: "option",
                // description: "",
                options:[
                    {
                        name: "Line",
                        value: "line"
                    },
                     {
                        name: "Step",
                        value: "step"
                    }
                ]
            },
            {
                name: "xaxis",
                display_name: "Xaxis",
                type: "text",
                // "description"   : ""
            },
            {
                name: "yaxis",
                display_name: "Yaxis",
                type: "text",
                // "description"   : ""
            },
            {
                name: "min",
                display_name: "min of yaxis",
                type: "text",
                default_value: "auto"
                // "description"   : ""
            },
            {
                name: "max",
                display_name: "max of yaxis",
                type: "text",
                default_value: "auto"
                // "description"   : ""
            },
            {
                name: "color",
                display_name: "color of yaxis",
                type: "text",
                default_value: "auto"
                // "description"   : ""
            },
            {
                name: "pointer",
                display_name: "Pointer",
                type: "boolean",
            },
            {
                name: "hook",
                display_name: "Hook",
                type: "boolean"
            },
            {
                name: "refresh",
                display_name: "refresh every",
                type: "text",
                default_value: "10"
                // "description"   : ""
            },
            {
                name: "height_block",
                display_name: "Height Blocks",
                type: "option",
                // description: "",
                options:[
                    {
                        name: "4",
                        value: "240"
                    },
                     {
                        name: "5",
                        value: "300"
                    },
                    {
                        name: "6",
                        value: "360"
                    },
                    {
                        name: "7",
                        value: "420"
                    },
                    {
                        name: "8",
                        value: "480"
                    },
                    {
                        name: "9",
                        value: "540"
                    },
                    {
                        name: "10",
                        value: "600"
                    }
                ]
            },

        ],
        newInstance   : function(settings, newInstanceCallback) {
            newInstanceCallback(new feedviewWidgetPlugin(settings));
        }


    });

    var feedviewWidgetPlugin = function(settings) {
        var self = this;
        var sizeWidth = {"240":"4","300":"5","360":"6","420":"7","480":"8","540":"9","600":"10"}; 
        self.widgetID = randomString(16);
        var currentSettings = settings;
        var feedviewElement = feedviewElement = $("<div id=\"chart"+self.widgetID+"\"></div>");
        var timer;

        function stopTimer()
        {
            if(timer)
            {
                clearInterval(timer);
                timer = null;
            }
        }

        self.render = function(containerElement) {
            
            currentSettings.height = sizeWidth[currentSettings.height_block];
            $(containerElement).append(feedviewElement);

            feedviewElement.css({
                height:currentSettings.height_block+"px",
            });
            var option = {
                // name : "Piesensor Graph",
                xaxis : currentSettings.xaxis,
                yaxis : currentSettings.yaxis,
                hookyaxis : currentSettings.hook,//true,false
                max:currentSettings.max,
                min:currentSettings.min,
                color:currentSettings.color,
                type : currentSettings.type, //bar,line,step
                pointer : currentSettings.pointer, //true,false
            }

            // jQuery(window).ready(function( $ ) {
            //     $.getJSON( currentSettings.apikey+"&granularity="+currentSettings.granularity+"&timezone=7&data="+currentSettings.data+"&aggregate="+currentSettings.aggregate+"&since="+currentSettings.since, function(datajson) { 
            //         updateChart('chart'+self.widgetID,datajson,option);
            //     }); 
            // });  
        }

        this.getHeight = function () {
            if(currentSettings.height===undefined){
                currentSettings.height = 4;
            }
            return Number(currentSettings.height);
        }

        self.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
            currentSettings.height = sizeWidth[currentSettings.height_block];
            feedviewElement.css({
                height:currentSettings.height_block+"px",
            });
            var option = {
                // name : "Piesensor Graph",
                xaxis : currentSettings.xaxis,
                yaxis : currentSettings.yaxis,
                hookyaxis : currentSettings.hook,//true,false
                max:currentSettings.max,
                min:currentSettings.min,
                color:currentSettings.color,
                type : currentSettings.type, //bar,line,step
                pointer : currentSettings.pointer, //true,false
            }
            stopTimer();
            jQuery(window).ready(function( $ ) {
                $.getJSON( currentSettings.apikey+"&granularity="+currentSettings.granularity+"&timezone=7&data="+currentSettings.data+"&aggregate="+currentSettings.aggregate+"&since="+currentSettings.since, function(datajson) { 
                    updateChart('chart'+self.widgetID,datajson,option);
                }); 
            }); 
            jQuery(window).ready(function( $ ) {
                timer = setInterval(function(){
                    $.getJSON( currentSettings.apikey+"&granularity="+currentSettings.granularity+"&timezone=7&data="+currentSettings.data+"&aggregate="+currentSettings.aggregate+"&since="+currentSettings.since, function(datajson) { 
                        updateChart('chart'+self.widgetID,datajson,option);
                    });
                },Number(newSettings.refresh) * 1000); 
            });  

        }

        self.onCalculatedValueChanged = function(settingName, newValue) {

        }

        self.onDispose = function() {
            stopTimer()
        }

        this.onSettingsChanged(settings);

        
    }
}());
