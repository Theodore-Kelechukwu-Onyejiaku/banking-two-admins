//console.log('inside loader.js');


window.defineYetience = function(yetience_callback) {
    if (!window.yetience) {
        //console.log('window.yetience was not defined. initializing')
        window.yetience = {}
    };

    window.yetience.fileLoader = {
        script: function(src, callback) {
            var s = document.createElement('script');
            s.setAttribute('src', src);
            s.onload = window.yetience.callBackAfterDelay(callback);
            document.body.appendChild(s);
        },
        style: function(href, callback) {
            var styles = document.createElement('link');
            styles.rel = 'stylesheet';
            styles.type = 'text/css';
            styles.media = 'screen';
            styles.href = href;
            document.getElementsByTagName('head')[0].appendChild(styles);

            styles.onload = window.yetience.callBackAfterDelay(callback);
            //document.body.appendChild(styles);
        }
    };

    window.yetience.callBackAfterDelay = function(cb) {
        return function() {
            setTimeout(function() {
                cb()
            }, 0)
        }

    };

    window.yetience.fileSuffix = {
        script: '.js',
        style: '.css'
    };

    window.yetience.loadApp = function(prefix, callback) {
        window.yetience.loadGroups(prefix, window.yetience.scripts, 'script', function() {
            window.yetience.loadGroups(prefix, window.yetience.styles, 'style', function() {

                callback()
                if (typeof Autience != 'undefined' && Autience) {
                    Autience.utils.emitAutienceEvent('load')
                }

            })
        })
    };


    window.yetience.loadGroups = function(prefix, script_groups, type, done) {
        if(script_groups && script_groups.length > 0){
            addGroup(0)
        }else{
            done()
        }
        


        function addGroup(group_i) {

            loadScriptGroup(script_groups[group_i], function() {
                if (group_i < script_groups.length - 1) {

                    addGroup(group_i + 1)
                } else {

                    done()
                }
            })
        };

        function loadScriptGroup(group, group_callback) {

            if (group) {
                addItem(0)
            } else {
                group_callback()
            }


            function addItem(script_i) {

                var src = prefix + group.base + '/' + group.items[script_i] + window.yetience.valueOrBlank(group.suffix) + window.yetience.fileSuffix[type]

                window.yetience.fileLoader[type](src, function() {

                    if (script_i < group.items.length - 1) {
                        addItem(script_i + 1)
                    } else {
                        group_callback()
                    }
                })

            }
        }
    };

    window.yetience.valueOrBlank = function(value) {
        if (value)
            return value
        else
            return ''
    };

    window.yetience.ajax = function(url, method, data, success, failure) {
        if (!this.xhr) {
            this.xhr = window.ActiveX ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
        }
        var self = this.xhr

        self.onreadystatechange = function() {
            if (self.readyState === 4 && self.status === 200) {
                // the request is complete, parse data and call callback
                if (success) {
                    success(self.responseText)
                }

            } else if (self.readyState === 4) {
                // something went wrong but complete
                if (failure) {
                    failure()
                }

            }
        }

        this.xhr.open(method, url, true)
        this.xhr.setRequestHeader("Content-Type", "application/json")

        if (data) {
            this.xhr.send(JSON.stringify(data))
        } else {
            this.xhr.send()
        }

    };

    window.yetience.browserVersion = function() {
        //finding OS
        var browser_data = {}
        var OSName = "Unknown OS";
        if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
        if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
        browser_data.OS = OSName;

        // finding browser version
        navigator.sayswho = (function() {
            var N = navigator.appName,
                ua = navigator.userAgent,
                tem;
            var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
            if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
            M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
            return M;
        })();

        browser_data.browser_version = navigator.sayswho;
        return browser_data;
    };

    window.yetience.sendEvent = function(event, website_id, data) {
        //console.log("In yetience sendEvent")
        if (!data) {
            data = {}
        }
        data.source = "browser"
        data.version = window.yetience.version
        //console.log('Plugin version = '+data.version)
        data.path = window.location.href
        data.wordpress_version = window.yetience.wordpress_version;

        var browser_data = window.yetience.browserVersion()
        data.browser_version = browser_data.browser_version;
        data.OS = browser_data.OS

        if (!website_id) {
            var setup = window.yetience.readFromPlatform()
            website_id = setup.id
        }


        if (!website_id) {
            //console.log('There is no website_id to send the event')
            return false
        }

    
        var img = document.createElement("img");
        var image_url = window.yetience.server + '/track/api/EventLogs/image?event=' + event + '&client_id=' + website_id;
        image_url = image_url + '&time=' + Date.now()
        if (window.btoa) {
            var encoded_data = window.btoa(JSON.stringify(data))
            image_url = image_url + '&data=' + encoded_data
        }
        img.src = image_url
        img.style.visibility = 'hidden'
        document.body.appendChild(img);
        //console.log("Appended image")
    };

    //sending error event if there is any error in the client or admin scripts
    window.onerror = function(message, source, lineno, colno, error) {
        if (source.indexOf('client.min.js') >= 0 || source.indexOf('admin.min.js') >= 0) {
            data = {}
            data.message = message
            data.source = source
            data.lineno = lineno
            data.colno = colno
            data.error = error
                //log error even without client id
            var website_id = 'X',
                send_event = true
            if (typeof Autience !== 'undefined' && Autience && Autience.setup && Autience.setup.id) {
                website_id = Autience.setup.id

                //send client error events for only one hour after popup creation
                var now = Math.round(new Date().getTime() / 1000);
                // var one_hour = 3600
                var six_hours =  6 * 60 * 60
                var created = Autience.utils.nestedValue(Autience, ['setup', 'first_widget_time']);
                var time_gap = now - created

                if (created && time_gap > 0 && time_gap < six_hours) {
                    send_event = true
                } else {
                    send_event = false
                }
            }
            if (send_event) {
                window.yetience.sendEvent('d_client_error', website_id, data);
            }

        }
    };

    if(yetience_callback){
        yetience_callback()
    };

};