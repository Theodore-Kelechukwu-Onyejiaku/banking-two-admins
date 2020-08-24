var Autience = null

window.defineAutience = function (autience_callback) {

    var cycle = null,
        lifecycle = null

    var lifecycles = ['displayValidation', 'onPageLoad', 'render', 'postRender', 'display', 'beforeClose', 'close', 'afterClose']

    if (Autience != null) {
        return
    }

    Autience = {
        lifecycle: {},
        utils: {},
        listeners: [],
        emitted: {},
        executors: {},
        lifecycle_executed: false,
        yeloniTriggerPopup: function (widget_id) {
            var matching_widget = Autience.setup.widgets.filter(function (widget) {
                return widget.code == widget_id
            })
            if (matching_widget.length > 0) {
                matching_widget = matching_widget[0]
            }
            console.log('Triggering matching popup from customjs event')
            Autience.executors.displayWidget(matching_widget)

        },
        yeloniTriggerAllPopups: function () {
            console.log('Triggering all popups from customjs event')
            Autience.setup.widgets.map(function (widget) {
                Autience.executors.displayWidget(widget)
            })
        }
    }

    lifecycles.forEach(function (l) {

        Autience.lifecycle[l] = [function () {
            //console.log('in ' + l + ' lifecycle')
            return true
        }]
    })



    //simple functions with no dependencies
    Autience.executors.defineUtils = function () {

        //1. Ajax object - shifted to common

        //2b. autience utils sendEvent
        Autience.utils.sendEvent = function (event, data) {

            return

            //Disabled Event Logging
            var now = Math.round(new Date().getTime() / 1000);
            // var ten_minutes = 10 * 60
            var six_hours = 6 * 60 * 60
            var created = Autience.utils.nestedValue(Autience, ['setup', 'first_widget_time']);
            var time_gap = now - created
            var like_text = 'popup_day_'


            //send popup liked event after 1 day
            if (event == 'popup_liked') {
                var one_day = 1 * 24 * 60 * 60,
                    days_limit = 7,
                    sent_array = []

                var widget_time = data.widget_time
                time_gap = now - widget_time
                if (widget_time && time_gap > 0) {
                    var day = Math.ceil(time_gap / one_day)
                    //if day is not present in sent_array -> send event for the day and add it to the array
                    if (sent_array.indexOf(day) < 0 && day <= days_limit) {
                        window.yetience.sendEvent(like_text + day, Autience.setup.id, data)
                        sent_array.push(day)
                    }
                }
            } else {
                //logging client events only for 10 minutes after popup creation
                if (created && time_gap > 0 && time_gap < six_hours) {
                    // console.log('fresh widget, sending event')
                    if (Autience.setup && Autience.setup.id) {
                        window.yetience.sendEvent(event, Autience.setup.id, data)
                    }
                }
            }
        }

        //3a. emitAutienceEvent
        Autience.utils.emitAutienceEvent = function (eventName, forget) {
            eventName = "autience_" + eventName
            //only emit if this event was not already emitted
            if (!Autience.emitted[eventName]) {
                var event; // The custom event that will be created
                if (document.createEvent) {
                    event = document.createEvent("HTMLEvents");
                    event.initEvent(eventName, true, true);
                } else {
                    event = document.createEventObject();
                    event.eventType = eventName;
                }

                event.eventName = eventName;

                if (document.createEvent) {
                    document.dispatchEvent(event);
                } else {
                    document.fireEvent("on" + event.eventType, event);
                }
                if (eventName == 'autience_load' || eventName == 'autience_exit') {
                    //Autience.utils.sendEvent('client_' + eventName + '_triggered')
                }

                //console.log('emitting - '+eventName)
                if (!forget) {
                    //this event can happen only once on the page
                    Autience.emitted[eventName] = true
                }
            }
        }


        //3b. listenAutienceEvent
        Autience.utils.listenAutienceEvent = function (eventName, fn) {
            var autience_event = "autience_" + eventName
            Autience.utils.listen(document, autience_event, fn)
        }

        //3c. delayed Listener
        Autience.utils.delayedListenAutienceEvent = function (autience_event, delay, fn) {
            Autience.listenAutienceEvent(autience_event, function () {
                setTimeout(fn, delay)
            })
        }

        //4. getting document height
        Autience.utils.getDocHeight = function () {
            var D = document
            return Math.max(
                D.body.scrollHeight, D.documentElement.scrollHeight,
                D.body.offsetHeight, D.documentElement.offsetHeight,
                D.body.clientHeight, D.documentElement.clientHeight
            )
        }

        //5. createCookies
        Autience.utils.createCookie = function (name, value, permanent) {
            var cookie = name + "=" + value + ";path=/"
            if (permanent) {

                var expiration_date = new Date();
                expiration_date.setFullYear(expiration_date.getFullYear() + 5);
                cookie = cookie + ";expires=" + expiration_date.toGMTString()
            }
            document.cookie = cookie
        }

        Autience.utils.readCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }


        //6. bind function on all elements with the clas
        Autience.utils.executeOnClass = function (class_name, fn) {
            var els = document.getElementsByClassName(class_name)
            if (els) {
                for (var i = 0; i < els.length; i++) {
                    fn(els[i])
                }
            }
        }

        Autience.utils.executeOnId = function (id, fn) {
            var el = document.getElementById(id)
            if (el) {
                fn(el)
            }
        }

        Autience.utils.idListen = function (id, event, fn) {
            Autience.utils.executeOnId(id, function (el) {
                Autience.utils.listen(el, event, fn)
            })
        }


        //7. Listen on elements by class name
        Autience.utils.classListen = function (class_name, evt, fn) {
            Autience.utils.executeOnClass(class_name, function (el) {
                Autience.utils.listen(el, 'click', fn)
            })
        }

        //8. Execute array of functions without input
        Autience.utils.cycle = function (fn_array, widget) {

            if (fn_array) {
                for (var i = 0; i < fn_array.length; i++) {
                    fn_array[i](widget)
                }
            }
        }

        //9. Execute validators in sequence and return true if all are valid
        Autience.utils.checkCycle = function (fn_array, inp) {
            if (fn_array) {
                for (var i = 0; i < fn_array.length; i++) {
                    if (!fn_array[i](inp)) {
                        //console.log('in validateSequence ' + i + ' th function is returning false')
                        return false
                    }
                }
            }
            return true
        }

        //10. get a smart setting value
        Autience.utils.smartSetting = function (extension, key) {
            if (autience_settings && autience_settings.smart && autience_settings.smart[extension]) {
                return autience_settings.smart[extension][key]
            }
        }

        //11. close widget
        Autience.utils.closeWidget = function (widget) {
            Autience.utils.cycle(Autience.lifecycle.close, widget)
            Autience.utils.cycle(Autience.lifecycle.afterClose, widget)
            Autience.utils.sendEvent('popup_closed');
        }

        //12. base64 decoding
        Autience.utils.decode = function (s) {
            if (window.atob) {
                try {
                    var decoded = window.atob(s)
                    return decoded
                } catch (err) {
                    //console.log('Unable to to decode')
                    //console.log(s)
                    return alternateDecode(s)
                }

            }

            function alternateDecode(s) {
                if (!s || s.length == 0) {
                    return ''
                }
                var e = {},
                    i, b = 0,
                    c, x, l = 0,
                    a, r = '',
                    w = String.fromCharCode,
                    L = s.length;
                var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                for (i = 0; i < 64; i++) {
                    e[A.charAt(i)] = i;
                }
                for (x = 0; x < L; x++) {
                    c = e[s.charAt(x)];
                    b = (b << 6) + c;
                    l += 6;
                    while (l >= 8) {
                        ((a = (b >>> (l -= 8)) & 0xff) || (x < (L - 2))) && (r += w(a));
                    }
                }
                return r;
            }

        }

        Autience.utils.nestedValue = function (obj, fields) {

            var nested = obj
            for (var i = 0; i < fields.length; i++) {
                nested = nested[fields[i]]

                if (typeof nested == 'undefined') {

                    return null
                }
            }

            return nested
        }

        Autience.utils.stripAndExecuteScript = function (text) {
            var scripts = '';
            var cleaned = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function () {
                scripts += arguments[1] + '\n';
                return '';
            });

            if (window.execScript) {
                window.execScript(scripts);
            } else {
                var head = document.getElementsByTagName('head')[0];
                var scriptElement = document.createElement('script');
                scriptElement.setAttribute('type', 'text/javascript');
                scriptElement.innerText = scripts;
                head.appendChild(scriptElement);
                head.removeChild(scriptElement);
            }
            return cleaned;
        }

        Autience.utils.emitLinkClick = function (url, target, evt) {
            Autience.current_link = url
            Autience.current_target = target

            var host = window.location.host
            var host_without_www = host.replace('www.', '')
            var host_with_www = 'www.' + host

            //if the user clicks on a button which has js function, it has href = javascript. the popup should not show up
            if (url.indexOf('javascript') > -1) {
                return
            }

            if (url.indexOf(host) >= 0 || url.indexOf(host_with_www) >= 0 || url.indexOf(host_without_www) >= 0) {
                emitAndDisableRedirect('internal')
            } else {
                emitAndDisableRedirect('external')
            }

            emitAndDisableRedirect('any')
            emitAndDisableRedirect('custom')

            function emitAndDisableRedirect(type) {
                Autience.clickEvent = evt
                Autience.utils.emitAutienceEvent('link_' + type, true)

                if (Autience['disable_link_' + type]) {

                    console.log('Disable link redirection for ', 'disable_link_' + type)

                    //evt.preventDefault()
                }
            }
        }

        Autience.utils.redirect = function (url, target) {
            if (!target) {
                window.location = url
            } else {
                window.open(url, target);
            }
        }

        Autience.utils.isDefined = function (a) {
            return (typeof a != 'undefined')
        }

        Autience.utils.isMobile = function () {
            if (/Mobi/.test(navigator.userAgent)) {
                return true
            }
            return false
        }

        Autience.utils.randomString = function () {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        Autience.utils.hasFeature = function (feature) {
            if (Autience.setup && Autience.setup.package_id != 'default') {
                return true
            }

            //All features if premiumSubscription is present
            if (Autience.utils.nestedValue(Autience, ['setup', 'extensions', 'premiumSubscription'])) {
                return true
            }

            if (Autience.utils.nestedValue(Autience, ['setup', 'extensions', feature])) {
                return true
            }

            return false
        }
    }


    //define Listeners for the common events
    Autience.executors.defineListeners = function () {
        //console.log('defining autience listeners')
        Autience.listeners = [{
            target: document,
            trigger: 'scroll',
            reaction: function () {
                var ratio = (window.innerHeight + window.scrollY) / (Autience.utils.getDocHeight());
                var percentage = 25 * Math.floor(ratio * 4.1) //percentage is in multiples of 25
                //console.log('percentage- ' + percentage)
                Autience.utils.emitAutienceEvent('scroll_' + percentage)
            },
            target_name: 'document'
        }, {
            target: document.body,
            trigger: 'mouseout',
            reaction: function (e) {
                e = e ? e : window.event;
                var from = e.relatedTarget || e.toElement;
                if ((!from || from.nodeName == "HTML") && (!e.clientY || (e.clientY <= 0))) {
                    // console.log('exit is triggered')

                    Autience.utils.emitAutienceEvent('exit')
                }
            },
            target_name: 'body'
        }, {
            target: document.getElementsByTagName('a'),
            trigger: 'click',
            reaction: function (evt_obj, evt_name, el) {
                Autience.utils.emitLinkClick(el.href, el.getAttribute('target'), evt_obj)
            },
            target_name: 'links'
        }, {
            target: window,
            trigger: 'hashchange',
            reaction: function (evt_obj, evt_name, el) {
                //alert('in hashchange '+ window.location.hash )
                if (Autience.hash_set) {
                    //emit this event only after a hash has been set in the current cycle
                    Autience.utils.emitAutienceEvent('back')
                }

            },
            target_name: 'window'
        }, {
            target: window,
            trigger: 'popstate',
            reaction: function (evt_obj, evt_name, el) {
                Autience.utils.emitAutienceEvent('back')
            },
            target_name: 'window'
        }]
    }



    Autience.executors.bindListeners = function () {
        //iterate through all the listeners and bind them
        //console.log('binding autience listeners')
        var listener = null,
            triggers = null

        Autience.listeners.forEach(function (listener) {

            //if trigger is a string, put the single string in an array
            if (typeof listener.trigger === 'string') {
                triggers = [listener.trigger]
            } else {
                triggers = listener.trigger
            }

            triggers.forEach(function (trigger) {
                if (listener.target.length) {

                    //targets are an array of elements
                    for (var i in listener.target) {

                        Autience.utils.listen(listener.target[i], trigger, listener.reaction)
                    }
                } else {

                    //target is a single element
                    Autience.utils.listen(listener.target, trigger, listener.reaction, listener.target_name)
                }
            })
        })
    }

    Autience.executors.displayWidget = function (widget) {
        console.log('Call for displayWidget')
        Autience.utils.cycle(Autience.lifecycle.display, widget)
    }

    Autience.executors.runWidgetCycle = function (widget) {

        var cycle = Autience.utils.cycle

        if (Autience.utils.checkCycle(lifecycle.displayValidation, widget)) {
            cycle(lifecycle.onPageLoad, widget)

            cycle(lifecycle.render, widget)

            cycle(lifecycle.postRender, widget)
        }
    }

    Autience.executors.runLifecycles = function () {
        //console.log('Starting widget lifecycle')
        if (Autience.lifecycle_executed) {
            //ensure that this function is run only once
            return
        }
        if (window.autience_setup) {
            Autience.lifecycle_executed = true
            //decode and convert setup to json
            //Commented to avoid being marked for code obfuscation
            Autience.setup = JSON.parse(decodeURIComponent(Autience.utils.decode(autience_setup)))
            //Autience.setup = JSON.parse(decodeURIComponent(autience_setup))
            // console.log(Autience.setup)
            //console.log('yeloni client is loaded with ' + Autience.setup.widgets.length + ' widgets ')
            //Autience.utils.sendEvent('client_script_loaded')

            Autience.setup.widgets.forEach(function (widget) {
                Autience.executors.runWidgetCycle(widget)
            })
        } else {
            //console.log('window.autience_setup is not defined')
        }
    }

    //execute defineUtils and defineListeners
    //Everything else happens when some event occurs


    lifecycle = Autience.lifecycle


    function assignAutienceListen(callback) {
        //console.log('inside assignAutienceListen')
        if (window.autience_listen) {
            ////console.log('Autience.utils.listen is assigned')
            Autience.utils.listen = window.autience_listen
            if (callback) {
                callback()
            }
        } else {
            setTimeout(function () {
                assignAutienceListen(callback)
            }, 500)
        }
    }

    assignAutienceListen(function () {
        //console.log('in callback of assignAutienceListen')
        Autience.executors.defineUtils()
        Autience.executors.defineListeners()
        Autience.executors.bindListeners()
        if (autience_callback) {
            autience_callback()
        }
    })

};
window.defineAutienceWhen = function (yetience_callback) {

    //log for popup displayed
    Autience.lifecycle.display.push(function (widget) {
        //checking if the popup code is present and sending popup_displayed event
        if (document.getElementById(widget.code)) {
            var code = document.getElementById(widget.code).innerHTML
            if (code) {
                Autience.utils.sendEvent('d_popup_displayed');
                if (Autience.utils.nestedValue(widget, ['widget_time'])) {
                    Autience.utils.sendEvent('popup_liked', {
                        widget_time: widget.widget_time
                    });
                }
            } else {
                Autience.utils.sendEvent('popup_empty');
            }
        } else {
            console.log('Widget ' + widget.code + ' is not loaded')
        }

    })

    //Zopim related functionality
    Autience.lifecycle.display.push(function (widget) {

        if (Autience.utils.nestedValue(widget, ['components', 'zopimChat']) && typeof $zopim !== 'undefined') {
            $zopim(function () {

                var yel_body_height = window.innerHeight
                var yel_body_width = window.innerWidth
                var yel_zopim_height = 400
                var yel_zopim_width = 310
                var yel_popup_offset = 76

                $zopim.livechat.window.show();
                var yel_loc = document.getElementById("yel-chat-wrapper").getBoundingClientRect();
                //console.log(yel_body_width)
                //console.log(yel_loc.left)
                //console.log(yel_loc.top)

                $zopim.livechat.window.setOffsetHorizontal(yel_body_width - yel_zopim_width - yel_loc.left - 5);
                $zopim.livechat.window.setOffsetVertical((yel_body_height - yel_zopim_height) - yel_popup_offset);

                if (yel_body_width < 767) {
                    $zopim.livechat.window.setOffsetVertical((yel_body_height - yel_zopim_height) - yel_loc.top);
                    $zopim.livechat.window.setOffsetHorizontal((yel_body_width - yel_zopim_width) / 2);
                }

            });
        }
    })

    //attach listener to display when the event occurs
    Autience.lifecycle.onPageLoad.push(function (widget) {
        // console.log('Attaching display on trigger')
        //first check if the  widget is enabled
        if (Autience.utils.nestedValue(widget, ['configuration', 'what', 'enable'])) {
            var when = widget.configuration.when

            var is_mobile = Autience.utils.isMobile()
            // console.log('is mobile- ' + is_mobile)
            var different_for_mobiles = when.smallDifferent
            var device = 'large',
                delay = 0,
                links_to_match = null,
                prevent_redirect = false


            if (is_mobile && different_for_mobiles) {
                device = 'small'
            }

            var trigger = when[device]
            var autience_event = trigger
            switch (trigger) {
                //handle these trigger cases differently
                case 'scroll':
                    autience_event = 'scroll_' + when.scroll[device]
                    break
                case 'delay':
                    autience_event = 'load'
                    delay = when.delay[device]
                    break
                case 'link':
                    var link_type = when.link[device]
                    autience_event = 'link_' + link_type

                    if (link_type == 'custom') {
                        links_to_match = when.customLink[device]
                    }
                    //Autience['disable_link_' + link_type] = true
                    prevent_redirect = true
                    break
            }

            displayPopupOnEvent(autience_event, delay, links_to_match, prevent_redirect)
            widget.trigger = {
                trigger: trigger,
                autience_event: autience_event,
                delay: delay
            }

        } else {
            Autience.utils.sendEvent('client_widget_disabled')
            console.log('widget is disabled')
        }

        function displayPopupOnEvent(autience_event, delay, links_to_match, prevent_redirect) {
            //Listen to the defined event and run the display lifecycle
            //console.log('Attached Event Listener for Popup for event ', autience_event)
            Autience.utils.listenAutienceEvent(autience_event, function (evt) {
                // console.log('Autience event triggered ', autience_event)
                // console.log('Autience event is' + autience_event + ' Check if the clicked link matches ', evt)

                if (matchingLink(links_to_match)) {
                    if (prevent_redirect && Autience.clickEvent) {
                        //alert('preventDefault for clickEvent')
                        Autience.clickEvent.preventDefault()
                    }

                    setTimeout(function () {
                        Autience.utils.cycle(Autience.lifecycle.display, widget)
                        // console.log('Popup is triggered')
                        //Autience.utils.sendEvent('popup_triggered')
                    }, delay * 1000)
                }
                //alert('hold on')


            })
        }

        function matchingLink(links) {
            //check links with Autience.current_link
            if (!links) {
                //there is no link, so no need to check
                return true
            }

            var matched = false
            links.split(',').map(function (link) {
                link = link.trim()

                matched = matched || directMatch(Autience.current_link, link) || matchWithoutProtocol(Autience.current_link, link) || matchWithoutHost(Autience.current_link, link)
            })

            return matched

            function directMatch(link1, link2) {
                link1 = stripTrailingSlash(link1)
                link2 = stripTrailingSlash(link2)
                return link1 == link2
            }

            function matchWithoutProtocol(link1, link2) {
                link1 = stripTrailingSlash(link1)
                link2 = stripTrailingSlash(link2)
                link1 = link1.replace('http://', '')
                link1 = link1.replace('https://', '')
                link2 = link2.replace('http://', '')
                link2 = link2.replace('https://', '')
                return link1 == link2
            }

            function matchWithoutHost(link1, link2) {
                link1 = stripTrailingSlash(link1)
                link2 = stripTrailingSlash(link2)
                link1 = link1.replace('http://', '')
                link1 = link1.replace('https://', '')
                link2 = link2.replace('http://', '')
                link2 = link2.replace('https://', '')
                link1 = link1.replace('www.', '')
                link2 = link2.replace('www.', '')
                link1 = link1.replace(window.location.host, '')
                link2 = link2.replace(window.location.host, '')

                return link1 == link2
            }

            function stripTrailingSlash(str) {
                if (str.substr(-1) === '/') {
                    return str.substr(0, str.length - 1);
                }
                return str;
            }
        }

    })


    //adding the analytics tracking code to the body
    Autience.lifecycle.display.push(function (widget) {


        // if (widget.components.commonanalytics.values.measureAnalyticsBoolean && widget.components.commonanalytics.values.analyticsTrackingCode) {
        if ((Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'measureAnalyticsBoolean'])) && (Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'analyticsTrackingCode']))) {

            var yel_measure_analytics = widget.components.commonanalytics.values.measureAnalyticsBoolean;
            var yel_tracking_code = widget.components.commonanalytics.values.analyticsTrackingCode;


            //adding the analytics script
            if (document.body != null) {
                var tracking_code_div = document.createElement("script");
                tracking_code_div.type = "text/javascript";

                var yel_popup_name = 'Yeloni'

                // if (widget.components.commonanalytics.values.analyticsPopupName)
                if ((Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'analyticsPopupName']))) {
                    var yel_temp_popup_name = widget.components.commonanalytics.values.analyticsPopupName;
                    var yel_popup_name = 'Yeloni-' + yel_temp_popup_name.split(' ').join('-');
                }


                //removing <script> tags
                yel_tracking_code = yel_tracking_code.replace("<script>", " ");
                yel_tracking_code = yel_tracking_code.replace("</script>", " ");

                //removing new lines
                yel_tracking_code = yel_tracking_code.replace(/\n/g, " ");
                //yel_tracking_code = yel_tracking_code.replace("pageview", "Page-Load");

                //adding the code to the script
                tracking_code_div.innerHTML = yel_tracking_code;


                document.body.appendChild(tracking_code_div);

                //send the popup display event
                //sending the page load event
                if (typeof ga === "function") {
                    ga('send', 'event', yel_popup_name, 'Popup-Display');
                }
            }
        }

    })

    Autience.lifecycle.render.push(function (widget) {
        var extensions = Autience.utils.nestedValue(Autience, ['setup', 'extensions'])
        //dont show for premium users
        if (extensions && Object.keys(extensions).length > 0) {
            return
        }


        // if (document.getElementsByClassName('logged-in').length > 0) {
        //     return
        // }

        var widget_element = document.getElementById(widget.code)
        var poweredBy = document.createElement('div')
        var url = 'https://yeloni.com'
        url = url + '?utm_source=' + window.location.hostname + '&utm_campaign=poweredby&from_site=' + window.location.hostname

        var message = 'Get an <b>Email Optin</b> for your Website'
        if (widget.goalType != 'subscribe') {
            message = 'Powered by <b>Yeloni</b>'
        }

        poweredBy.innerHTML = "<a href='" + url + "' target='_blank'>" + message + "</a>"

        var style = poweredBy.style,
            astyle = poweredBy.getElementsByTagName('a')[0].style
        Object.assign(style, {
            color: 'white',
            fontSize: '15px',
            fontFamily: 'arial',
            textAlign: 'center'
        })
        Object.assign(astyle, {
            color: 'white'
        })
        widget_element.appendChild(poweredBy)
    })
    /*
    //showing the affiliate link if applicable
    Autience.lifecycle.render.push(function(widget) {

        //console.log("show link-- "+Autience.setup.showAffiliateLink)


        // if (Autience.setup.showAffiliateLink)         {
        if ((Autience.utils.nestedValue(Autience, ['setup', 'poweredBy']))) {
            var yelPopups = document.getElementsByClassName('yel-popup-template'),
                noOfPopups = yelPopups.length,
                shareMessage = 'Sharing Powered by <span style="text-decoration: underline;">Yeloni</span>',
                emailMessage = 'Subscription Powered by <span style="text-decoration: underline;">Yeloni</span>',
                message = 'Powered by <span style="text-decoration: underline;">Yeloni</span>'

            while (noOfPopups--) {
                //add an element at the end of the yel-popup-template div
                var currentNode = yelPopups[noOfPopups]
                var newNode = document.createElement("div")
                newNode.className = "yel-powered"

                if (widget.isSocial && widget.isSocial == true) {
                    message = shareMessage
                } else if (widget.isEmail && widget.isEmail == true) {
                    message = emailMessage
                } else {
                    message = message
                }

                newNode.innerHTML = message

                //so that powered by yeloni shows up only once per widget
                if (!widget.insertedBranding) {
                    currentNode.parentNode.insertBefore(newNode, currentNode.nextSibling)
                    widget.insertedBranding = true
                }
                //Set the branding on bottom right
                document.getElementsByClassName('yel-powered')[noOfPopups].style = 'float:right;margin-right:2%;position: absolute;right: 0px;bottom: 20px;';

            }
            //console.log("autience setup")
            //console.dir(Autience.setup.affiliate_code)

            Autience.utils.classListen('yel-powered', 'click', function() {
                var linkhere = "?utm_source=" + Autience.setup.initial_domain + "&utm_medium=poweredBy"
                var utmLink = "http://www.yeloni.com" + linkhere;
                window.open(utmLink, '_blank');
            })
        }

    })
    */

    if (yetience_callback) {
        yetience_callback()
    }
};
window.defineAutienceWhere = function (yetience_callback) {
    // //for display by contain url
    Autience.lifecycle.displayValidation.push(function (widget) {
        //honor show on homepage condition
        if (location.pathname == '/' && (Autience.utils.nestedValue(widget, ['configuration', 'where', 'home']) == true)) {
            return true
        }
        if (Autience.utils.nestedValue(widget, ['configuration', 'where', 'show_contain_tags'])) {
            var contain_tags = widget.configuration.where.show_contain_tags
            if (contain_tags.length == 0) {
                return true
            }
            console.log('location.pathname is ' + location.pathname)
            for (var i = contain_tags.length - 1; i >= 0; i--) {

                if (location.pathname.indexOf(contain_tags[i].text) > -1) {
                    console.log(location.pathname + ' has ' + contain_tags[i].text)
                    return true
                }
            }
            // console.log('contain tags')
            // console.log(contain_tags)
        } else {

            return true
        }


    })

    //for show by match url
    Autience.lifecycle.displayValidation.push(function (widget) {
        // console.log('location.pathname is ' + location.pathname)
        // console.log(widget.configuration.where)
        if (Autience.utils.nestedValue(widget, ['configuration', 'where', 'show_match_tags'])) {
            //honor show on homepage condition
            if (location.pathname == '/' && (Autience.utils.nestedValue(widget, ['configuration', 'where', 'home']) == true)) {
                return true
            }
            var match_tags = widget.configuration.where.show_match_tags
            if (match_tags.length == 0) {
                return true
            }
            // console.log('location.pathname is ' + location.pathname)
            for (var i = match_tags.length - 1; i >= 0; i--) {
                // console.log('------------------')
                console.log(location.pathname + ' is /' + match_tags[i].name)
                if (location.pathname.indexOf(match_tags[i].name) >= 0) {
                    return true
                }
            }
            // console.log('match tags')
            // console.log(match_tags)
        } else {
            return true
        }

    })

    Autience.lifecycle.displayValidation.push(function (widget) {
        //return true = show, false = show
        var showAdmin = widget.configuration.showAdmin

        if (showAdmin != null) { //by default it's not defined
            if (!showAdmin) { //if it is set to false - don't show to logged in users
                if (is_logged_in) {
                    // console.log('dont show popup to admin - logged in as admin')
                    return false
                } else {
                    // console.log('dont show popup to admin - not logged in')
                    return true
                }
            }
        }
        return true

    })
    // //for display by contain url
    Autience.lifecycle.displayValidation.push(function (widget) {
        //return true = show, false = hide
        //honor show on homepage condition
        if (location.pathname == '/' && (Autience.utils.nestedValue(widget, ['configuration', 'where', 'home']) == true)) {
            return true
        }
        if (Autience.utils.nestedValue(widget, ['configuration', 'where', 'hide_contain_tags'])) {
            //honor show on homepage condition
            if (location.pathname == '/' && (Autience.utils.nestedValue(widget, ['configuration', 'where', 'home']) == true)) {
                return true
            }

            var contain_tags = widget.configuration.where.hide_contain_tags
            if (contain_tags.length == 0) {
                return true
            }
            console.log('location.pathname is ' + location.pathname)
            for (var i = contain_tags.length - 1; i >= 0; i--) {
                if (location.pathname.indexOf(contain_tags[i].text) > -1) {
                    console.log(location.pathname + ' has ' + contain_tags[i].text)
                    return false
                }
            }
            // console.log('contain tags')
            // console.log(contain_tags)
        }
        return true

    })

    //for hide by match url
    Autience.lifecycle.displayValidation.push(function (widget) {
        //return true = show, false = hide
        // console.log('location.pathname is ' + location.pathname)
        // console.log(widget.configuration.where)
        if (Autience.utils.nestedValue(widget, ['configuration', 'where', 'hide_match_tags'])) {
            //honor show on homepage condition
            if (location.pathname == '/' && (Autience.utils.nestedValue(widget, ['configuration', 'where', 'home']) == true)) {
                return true
            }
            var match_tags = widget.configuration.where.hide_match_tags
            if (match_tags.length == 0) {
                return true
            }
            console.log('location.pathname is ' + location.pathname)
            for (var i = match_tags.length - 1; i >= 0; i--) {
                console.log('------------------')
                console.log(location.pathname + ' is /' + match_tags[i].name)
                if (location.pathname.indexOf(match_tags[i].name) >= 0) {
                    return false
                }
            }
            // console.log('match tags')
            // console.log(match_tags)
        }
        return true

    })

    Autience.lifecycle.displayValidation.push(function (widget) {
        //return true = show, false = hide
        var showAdmin = widget.configuration.showAdmin

        if (showAdmin != null) { //by default it's not defined
            if (!showAdmin) { //if it is set to false - don't show to logged in users
                if (is_logged_in) {
                    // console.log('dont show popup to admin - logged in as admin')
                    return false
                } else {
                    // console.log('dont show popup to admin - not logged in')
                    return true
                }
            }
        }
        return true

    })

    Autience.lifecycle.displayValidation.push(function (widget) {
        var isMobile = Autience.utils.isMobile()

        if (isMobile && !Autience.utils.hasFeature('mobileScreens')) {
            console.log('Popup is not shown on mobile in lite version')
            return false
        }
        if (isMobile && Autience.utils.hasFeature('mobileScreens')) {
            if (Autience.utils.nestedValue(widget, ['configuration', 'when', 'smallEnabled'])) {
                console.log('enabled on small screen')
                return true
            } else {
                console.log('disabled on small screens')
                return false
            }
        }
        // console.log('default')
        return true
    })


    //show on specific pages
    Autience.lifecycle.displayValidation.push(function (widget) {
        var where = widget.configuration.where
        var cat = null
        var where_categories = widget.configuration.where_categories
        var where_titles = widget.configuration.where_titles

        //sometimes the value given by wordpress is not correct
        autience_is_home = autience_is_home || (((window.location.pathname == '/') || (window.location.pathname == '')) && window.location.search.length == 0)
        if (autience_is_home) {
            //console.log('where.home is ', where.home)
            return where.home
        }

        if (window.autience_page_name == 'checkout') {
            return where.checkout
        }

        switch (where.other) {
            case 'all':
                return true
            case 'none':
                return false
            case 'specific':
                switch (where.specific.selector) {
                    case 'pageType':
                        switch (window.autience_post_type) {
                            case 'post':
                                return where.pageTypes.posts
                            case 'product':
                                return where.pageTypes.products
                            case 'page':
                                return where.pageTypes.pages
                        }
                        break;
                    case 'category':

                        for (var i = 0; i < window.autience_categories.length; i++) {
                            cat = autience_categories[i].cat_ID
                            if (where_categories.indexOf(cat) >= 0 || where_categories.indexOf(cat.toString()) >= 0) {

                                return true
                            }
                        }

                        console.log('returning false')
                        return false
                        break;
                    case 'title':

                        var index = where_titles.indexOf(window.autience_post_id)

                        console.log('title at ' + index)
                        return (index >= 0)
                        break;
                    case 'url':
                        return true
                        break;
                    case 'custom':
                        //check if the current page type matches the custom page type
                        console.log('Current post type is ', window.autience_post_type)
                        console.log('post type to check is ', where.pageTypes.custom)

                        return (window.autience_post_type.toLowerCase() == where.pageTypes.custom.toLowerCase())
                }

        }

        return true
    })

    //for hide on specific pages
    Autience.lifecycle.displayValidation.push(function (widget) {
        var where = widget.configuration.where
        var cat = null
        var where_categories_hide = widget.configuration.where_categories_hide
        var where_titles_hide = widget.configuration.where_titles_hide

        // console.log('widget is')
        // console.log(widget)

        if (where.showOrHide == 'hide' && where.hideOn && where.hideOn.hideselector) {
            switch (where.hideOn.hideselector) {
                case 'pageType':
                    switch (window.autience_post_type) {
                        case 'post':
                            return !(where.pageTypes.posts)
                        case 'product':
                            return !(where.pageTypes.products)
                        case 'page':
                            return !(where.pageTypes.pages)
                    }
                    break;
                case 'category':

                    for (var i = 0; i < window.autience_categories.length; i++) {
                        cat = autience_categories[i].cat_ID
                        if (where_categories_hide.indexOf(cat) >= 0 || where_categories_hide.indexOf(cat.toString()) >= 0) {

                            return false
                        }
                    }
                    return true
                    break;
                case 'title':

                    var index = where_titles_hide.indexOf(window.autience_post_id)

                    // console.log('title at ' + index)
                    //return true - show
                    return (index < 0)

                    break;
                case 'url':
                    //see the logic in first two displayValidation
                    return true
                case 'custom':
                    //check if the current page type matches the custom page type
                    console.log('Current post type is ', window.autience_post_type)
                    console.log('post type to check is ', where.pageTypes.custom)

                    return !(window.autience_post_type.toLowerCase() == where.pageTypes.custom.toLowerCase())

            }



            return false
        } else {
            return true
        }
    })




    if (yetience_callback) {
        yetience_callback()
    }
};
window.defineAutienceHow = function (yetience_callback) {
    //Make sure that Action button shows up above anything else
    Autience.lifecycle.postRender.push(function (widget) {
        //console.log('Adding zindex to action buttons')
        var button_classes = ['yel-cta-wrapper', 'yel-arrow-wrapper', 'yel-circle-wrapper', 'yel-cta-button']
        button_classes.map(function (this_class) {
            //check if there is an element with this class.
            //if it exists, then assign the highest z index
            var els = document.getElementsByClassName(this_class)
            if (els && els.length > 0) {
                for (var i = 0; i < els.length; i++) {
                    els[i].style.zIndex = highestZIndex() + 1
                }
            }
        })
    })

    //Make sure that Popups show up above anything else
    Autience.lifecycle.display.push(function (widget) {
        //core function which shows the popup
        if (document.getElementById(widget.code)) {
            document.getElementById(widget.code).style.visibility = 'visible'
            widget.default_display = document.getElementById(widget.code).style.display
            document.getElementById(widget.code).style.display = 'block'
            document.getElementById(widget.code).style.zIndex = (highestZIndex()) * 10
        } else {
            console.log('Widget ' + widget.code + ' is not loaded')
        }

    })

    function highestZIndex() {
        var highest = 1
        var types = ['div', 'nav', 'span']
        types.map(function (type) {
            var all_divs = document.getElementsByTagName(type)
            //console.log('elements of type ', type, all_divs.length)
            for (var i = 0; i < all_divs.length; i++) {
                var zIndex = getStyle(all_divs[i], 'z-index')
                //console.log('z Index ', zIndex)
                if (!isNaN(zIndex) && zIndex > highest) {
                    highest = parseInt(zIndex)
                }
            }
        })

        console.log('highest z index ', highest)
        return highest
    }

    function getStyle(el, styleProp) {

        if (window.getComputedStyle) {
            var y = window.getComputedStyle(el, null).getPropertyValue(styleProp);
        } else if (el.currentStyle) {
            var y = el.currentStyle[styleProp];
        }

        return y;
    }

    //if analytics is enabled send an popup display event
    Autience.lifecycle.display.push(function (widget) {


        // if (widget.components.commonanalytics.values.measureAnalyticsBoolean)
        var yel_measure_analytics = Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'measureAnalyticsBoolean'])
        if (yel_measure_analytics) {
            var yel_popup_name = 'Yeloni'

            // if (widget.components.commonanalytics.values.analyticsPopupName) {
            if (Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'analyticsPopupName'])) {
                var yel_temp_popup_name = widget.components.commonanalytics.values.analyticsPopupName;
                var yel_popup_name = 'Yeloni-' + yel_temp_popup_name.split(' ').join('-');
            }
        }
    })



    //function to add widget rendered into a wrapper div
    Autience.lifecycle.render.push(function (widget) {

        // console.log("WIDGET IS --")
        // console.dir(widget)

        //create a new widget with a wrapper if it does not already exist
        if (!document.getElementById(widget.code) || true) {

            //based on the type of widget render it differently.
            //types of widgets are selected by widget.widgetType
            //the list of all types is in widget_type_data.json - name field

            var widgetDiv = document.createElement('div')
            widgetDiv.id = widget.code
            var typeOfWidget = widget.themeType;

            //console.log("widget.placementType:"+ widget.placementType)
            // console.log('Type of Popup- ' + typeOfWidget)

            switch (typeOfWidget) {
                case "Popups":
                    // console.log("THIS IS OF TYPE - Popups");
                    widgetDiv.style.visibility = 'hidden'
                    widgetDiv.className = "yel-popup-main-wrapper"

                    var base64_decoded = Autience.utils.decode(widget.rendered)
                    //var base64_decoded = widget.rendered

                    if (!base64_decoded || base64_decoded.length == 0) {
                        Autience.utils.sendEvent('client_template_empty')
                    }
                    var inner_html = Autience.utils.stripAndExecuteScript(decodeURIComponent(base64_decoded))
                    widgetDiv.innerHTML = inner_html
                    widgetDiv.style.background = "url('" + window.yetience.path + "/common/images/opaque-bg.png') top left repeat"
                    document.body.appendChild(widgetDiv)
                    break;

                case "ActionButtons":
                    // console.log("THIS IS OF TYPE - ActionButtons");
                    widgetDiv.className = "yel-ab-main-wrapper"


                    var base64_decoded = Autience.utils.decode(widget.rendered)
                    //var base64_decoded = widget.rendered
                    if (!base64_decoded || base64_decoded.length == 0) {
                        Autience.utils.sendEvent('client_template_empty')
                    }
                    var inner_html = Autience.utils.stripAndExecuteScript(decodeURIComponent(base64_decoded))
                    widgetDiv.innerHTML = inner_html
                    widgetDiv.className = "yel-ab-main-wrapper";
                    document.body.appendChild(widgetDiv)

                    //shift the elements to the right
                    if (document.getElementById("yel-main-box-wrapper")) {
                        document.getElementById("yel-main-box-wrapper").className = "yel-main-box-wrapper";
                        //hide the two boxes and show only the cta button
                        document.getElementById("yel-main-box-wrapper").style.display = "none"
                        document.getElementById("yel-main-box-wrapper").style.zIndex = highestZIndex() + 1
                    }

                    if (document.getElementById("yel-circle-wrapper")) {
                        document.getElementById("yel-circle-wrapper").className = "yel-circle-wrapper";

                        document.getElementById("yel-arrow-wrapper").style.display = "none"
                    }

                    if (document.getElementById("yel-arrow-wrapper")) {
                        document.getElementById("yel-arrow-wrapper").className = "yel-arrow-wrapper";
                        //show the arrow box after 5 secs
                        setTimeout(function () {
                            document.getElementById("yel-arrow-wrapper").style.display = "block"
                        }, 5000);
                    }





                    break;

                case "InpostWidgets":
                    //code
                    //console.log("THIS IS OF TYPE - InpostWidgets");

                    var articles = document.getElementsByTagName("article");
                    var x = articles[0].querySelectorAll("p");

                    var numberOfElements = x.length;
                    var parentNode = x[0].parentNode;

                    // if (widget.components.inpostPosition.values.postStart) {
                    if (Autience.utils.nestedValue(widget, ['components', 'inpostPosition', 'values', 'postStart'])) {
                        parentNode.insertBefore(ElemToInsert(widget), x[0]);
                    }

                    // if (widget.components.inpostPosition.values.postCenter) {
                    if (Autience.utils.nestedValue(widget, ['components', 'inpostPosition', 'values', 'postCenter'])) {
                        console.log(numberOfElements)
                        console.log("center:" + (Math.round(numberOfElements / 2) - 1))
                        parentNode.insertBefore(ElemToInsert(widget), x[Math.round(numberOfElements / 2) - 1]);
                    }

                    // if (widget.components.inpostPosition.values.postEnd) {
                    if (Autience.utils.nestedValue(widget, ['components', 'inpostPosition', 'values', 'postEnd'])) {
                        parentNode.insertBefore(ElemToInsert(widget), x[numberOfElements]);
                    }

                    break;

                case "Sliders":
                    // console.log("THIS IS OF TYPE - Sliders");
                    widgetDiv.className = "yel-slider-main-wrapper"

                    var base64_decoded = Autience.utils.decode(widget.rendered)
                    //var base64_decoded = widget.rendered
                    if (!base64_decoded || base64_decoded.length == 0) {
                        Autience.utils.sendEvent('client_template_empty')
                    }
                    var inner_html = Autience.utils.stripAndExecuteScript(decodeURIComponent(base64_decoded))
                    widgetDiv.innerHTML = inner_html
                    widgetDiv.className = "yel-slider-main-wrapper yel-slider-left";
                    document.body.appendChild(widgetDiv)

                    break;

                case "Bars":
                    //console.log("THIS IS OF TYPE - Bars");
                    // widgetDiv.className = "yel-bars-main-wrapper"

                    //THIS NEEDS TO BE WRITTEN BETTER HERE
                    // if (widget.components.barPosition.values.topscroll) {
                    if (Autience.utils.nestedValue(widget, ['components', 'barPosition', 'values', 'topscroll'])) {
                        widgetDiv.className = "yel-bars-main-wrapper yel-bar-template-render-top";

                        var bodyclass = document.createAttribute("class");
                        bodyclass.value = "body-move";
                        document.getElementsByTagName("body")[0].setAttributeNode(bodyclass);
                        console.log("added class yel-bar-template-render");


                    }
                    // else if (widget.components.barPosition.values.topfixed) {
                    else if (Autience.utils.nestedValue(widget, ['components', 'barPosition', 'values', 'topfixed'])) {
                        widgetDiv.className = "yel-bars-main-wrapper yel-bar-template-render-top";
                        console.log("added class yel-bar-template-render")
                    }
                    // else if (widget.components.barPosition.values.bottomscroll) {
                    else if (Autience.utils.nestedValue(widget, ['components', 'barPosition', 'values', 'bottomscroll'])) {
                        widgetDiv.className = "yel-bars-main-wrapper yel-bar-template-render-bottom";
                        console.log("added class yel-bar-template-render")
                    }
                    // else if (widget.components.barPosition.values.bottomfixed) {
                    else if (Autience.utils.nestedValue(widget, ['components', 'barPosition', 'values', 'bottomfixed'])) {
                        widgetDiv.className = "yel-bars-main-wrapper yel-bar-template-render-bottom";
                        console.log("added class yel-bar-template-render")
                    }

                    var base64_decoded = Autience.utils.decode(widget.rendered)
                    //var base64_decoded = widget.rendered
                    if (!base64_decoded || base64_decoded.length == 0) {
                        Autience.utils.sendEvent('client_template_empty')
                    }

                    var inner_html = Autience.utils.stripAndExecuteScript(decodeURIComponent(base64_decoded))
                    widgetDiv.innerHTML = inner_html
                    document.body.insertBefore(widgetDiv, document.body.firstChild);
                    break;

                case "Sidebar":
                    //code
                    // console.log("THIS IS OF TYPE - Sidebar");
                    break;

                case "ContentGating":
                    //code
                    break;

                case "Mats":
                    var base64_decoded = Autience.utils.decode(widget.rendered)
                    //var base64_decoded = widget.rendered
                    if (!base64_decoded || base64_decoded.length == 0) {
                        Autience.utils.sendEvent('client_template_empty')
                    }
                    var inner_html = Autience.utils.stripAndExecuteScript(decodeURIComponent(base64_decoded))
                    widgetDiv.innerHTML = inner_html
                    widgetDiv.className = "yel-mat-main-wrapper yel-mat-onload";

                    var ydiv = document.createElement("div");
                    ydiv.id = "yel-wrap";
                    ydiv.className = "yel-wrap"
                    ydiv.appendChild(widgetDiv)
                    // Move the body's children into this wrapper
                    while (document.body.firstChild) {
                        ydiv.appendChild(document.body.firstChild);
                    }

                    // Append the wrapper to the body
                    document.body.appendChild(ydiv);

                    //check for scroll and hide the element after its outside viewport
                    yelTrackScroll(widgetDiv);

                    break;

                default:
                    console.log("WIDGET TYPE NOT DEFINED - DEFAULTING TO POPUPS")
                    //defaulting to popups
                    widgetDiv.style.visibility = 'hidden'
                    widgetDiv.className = "yel-popup-main-wrapper"

                    var base64_decoded = Autience.utils.decode(widget.rendered)
                    //var base64_decoded = widget.rendered

                    if (!base64_decoded || base64_decoded.length == 0) {
                        Autience.utils.sendEvent('client_template_empty')
                    }
                    var inner_html = Autience.utils.stripAndExecuteScript(decodeURIComponent(base64_decoded))
                    widgetDiv.innerHTML = inner_html
                    widgetDiv.style.background = "url('" + window.yetience.path + "/common/images/opaque-bg.png') top left repeat"
                    document.body.appendChild(widgetDiv)
                    break;

            }





            //document.body.appendChild(widgetDiv)


        } else {
            //console.log('widget with code ' + widget.code + ' already exists')
        }

    })

    function yelTrackScroll(widget) {
        //get the height of the widget
        var widgetHeight = document.getElementById(widget.id).style.height;
        console.log("Height:" + widgetHeight)
    }

    function ElemToInsert(widget) {
        var widgetDiv = document.createElement('div')
        widgetDiv.className = "yel-inline-wrapper"
        widgetDiv.id = ""
        //var base64_decoded = Autience.utils.decode(widget.rendered)
        var base64_decoded = widget.rendered
        if (!base64_decoded || base64_decoded.length == 0) {
            Autience.utils.sendEvent('client_template_empty')
        }
        var inner_html = Autience.utils.stripAndExecuteScript(decodeURIComponent(base64_decoded))
        widgetDiv.innerHTML = inner_html
        widgetDiv.style.background = "url('" + window.yetience.path + "/common/images/opaque-bg.png') top left repeat"

        return widgetDiv;
    }

    // var giveMePopupBaby = function(widgetDiv) {
    //     console.log("THIS IS OF TYPE - Popups");
    //     widgetDiv.style.visibility = 'hidden'
    //     widgetDiv.className = "yel-popup-main-wrapper"

    //     var base64_decoded = Autience.utils.decode(widget.rendered)
    //     if (!base64_decoded || base64_decoded.length == 0) {
    //         Autience.utils.sendEvent('client_template_empty')
    //     }
    //     var inner_html = Autience.utils.stripAndExecuteScript(decodeURIComponent(base64_decoded))
    //     widgetDiv.innerHTML = inner_html
    //     widgetDiv.style.background = "url('" + window.yetience.path + "/common/images/opaque-bg.png') top left repeat"
    //     document.body.appendChild(widgetDiv)
    // }

    Autience.lifecycle.render.push(function (widget) {
        var styles_to_add = decodeURIComponent(Autience.utils.decode(widget.styles))
        //var styles_to_add = decodeURIComponent((widget.styles))

        //addStyle(styles_to_add)


        var head = document.head || document.getElementsByTagName('head')[0]
        var style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = styles_to_add;
        } else {
            style.appendChild(document.createTextNode(styles_to_add));
        }

        head.appendChild(style);
    })

    if (yetience_callback) {
        yetience_callback()
    }
};
window.defineAutienceWhom = function (yetience_callback) {
    if (Autience) {
        Autience.lifecycle.display.push(function (widget) {
            //create cookies as required
            Autience.utils.createCookie("autience-displayed-visitor-" + widget.code, true, true)
            Autience.utils.createCookie("autience-displayed-session-" + widget.code, true)

        })

        Autience.lifecycle.displayValidation.push(function (widget) {

            if ((Autience.utils.nestedValue(widget, ['configuration', 'whom', 'limitByReferrerSetting']))) {
                //console.log('limitByReferrerSetting is set to ' + widget.configuration.whom.limitByReferrerSetting)
                //this is fallback for the old version of plugin where the setting was set to default
                if (Autience.utils.nestedValue(widget, ['configuration', 'whom', 'limitByReferrerSetting']) == 'default') {
                    return true
                }

                var return_value = null,
                    isFound = false
                if (Autience.utils.nestedValue(widget, ['configuration', 'whom', 'limitByReferrerSetting']) == 'show') {
                    return_value = true
                } else {
                    return_value = false
                }

                var referrer_array = widget.configuration.whom.limitByReferrer_array
                if (referrer_array) {
                    for (var i = referrer_array.length - 1; i >= 0; i--) {
                        // console.log('comparing ' + referrer_array[i].text + ' to ' + document.referrer)
                        if (document.referrer.indexOf(referrer_array[i].text) > 0) {
                            // console.log('Disable on referrer is enabled for ' + referrer_array[i].text)
                            isFound = true
                        }
                    }
                }

                if (isFound) {
                    return return_value
                } else {
                    return !return_value
                }
            }
            return true
        })


        Autience.lifecycle.displayValidation.push(function (widget) {



            // if (widget.configuration.whom.cta == true)
            // if ((Autience.utils.nestedValue(widget, ['configuration', 'whom', 'cta'])) == true)
            //     console.log('cta is set to ' + widget.configuration.whom.cta)

            if (Autience.utils.readCookie("autience-visitor-subscribed-" + widget.code)) {
                console.log('visitor subscribed, do not show popup')
                return false
            }

            return true
        })


        Autience.lifecycle.displayValidation.push(function (widget) {
            if (Autience.utils.nestedValue(widget, ['configuration', 'whom', 'once'])) {
                // console.log('once is ' + widget.configuration.whom.once)
                switch (widget.configuration.whom.once) {
                    case 'visitor':
                        if (Autience.utils.readCookie("autience-displayed-visitor-" + widget.code)) {
                            //console.log('visitor cookie exists')
                            return false
                        }
                        break
                    case 'session':
                        if (Autience.utils.readCookie("autience-displayed-session-" + widget.code)) {
                            //console.log('session cookie exists')
                            return false
                        }
                        break

                    case 'always':
                        return true
                        break
                }
            }

            return true
        })

        if (yetience_callback) {
            yetience_callback()
        }
    }


};
window.defineAutienceClose = function (yetience_callback) {

    //this function changes the close image url based on the url's http or https
    Autience.lifecycle.postRender.push(function (widget) {
        //check the browser url to see if its http or https
        var yel_current_url = window.location.href
        if (yel_current_url.indexOf('https') >= 0) {
            //url is an https
            //console.log("a https url "+window.location.href)
            if (document.getElementsByClassName('yeloni-close-image-url')) {
                //get the current close button image
                var yel_div_list = document.getElementsByClassName('yeloni-close-image-url'),
                    yel_lt = yel_div_list.length;
                while (yel_lt--) {
                    var yel_img_url = yel_div_list[yel_lt].src;
                    if (yel_img_url.indexOf('https:') < 0) {
                        //image is from an http source
                        //console.log("url is https and image is from an http source ")
                        yel_div_list[yel_lt].src = yel_div_list[yel_lt].src.replace('http://', 'https://');
                    }

                }
            }
        } else {
            //url is http - do nothing!
            //console.log("a http url " + window.location.href)
        }
    })

    /*var yeloni_comment = 'This widget is powered by yeloni.com. Get one for your site today.'
    //show comments before widget
    Autience.lifecycle.postRender.push(function(widget) {
        if (document.getElementById(widget.code)) {
            var top_comment = document.createComment(yeloni_comment);
            // console.log(widget.themeType)
            var yel_widget_wrapper = wrapperClass(widget.themeType)
            var popup = document.getElementsByClassName(yel_widget_wrapper)[0]
            document.getElementById(widget.code).insertBefore(top_comment, popup);
        } else {
            console.log('Widget ' + widget.code + ' is not loaded')
        }

    })*/

    function wrapperClass(themeType) {
        if (themeType == 'ActionButtons') {
            return 'yel-cta-wrapper'
        } else {
            return 'yel-popup-template'
        }
    }

    /*
    //show comments after widget
    Autience.lifecycle.postRender.push(function(widget) {
        var bottom_comment = document.createComment(yeloni_comment);
        if (document.getElementById(widget.code)) {
            document.getElementById(widget.code).appendChild(bottom_comment);
        } else {
            console.log('Widget ' + widget.code + ' is not loaded')
        }
    })
    */

    //attach close functionality to the close button
    //close button has an id called autience-close-widget_id
    Autience.lifecycle.postRender.push(function (widget) {
        Autience.utils.classListen('autience-close-' + widget.code, 'click', function (el) {
            Autience.utils.closeWidget(widget)
        })
    })

    Autience.lifecycle.postRender.push(function (widget) {

        Autience.utils.idListen('autience-close-' + widget.code, 'click', function (el) {
            //if the user clicks the close button on a link trigger, check if we need to redirect

            if (Autience.utils.nestedValue(widget, ['trigger', 'trigger']) == 'link' && Autience.utils.nestedValue(widget, ['configuration', 'when', 'link', 'close'])) {
                Autience.utils.redirect(Autience.current_link, Autience.current_target)
            }
        })
    })


    //hiding the facebook page like after popup close - only for facebook-page-like theme
    Autience.lifecycle.postRender.push(function (widget) {

        Autience.utils.idListen('autience-close-' + widget.code, 'click', function (el) {
            if (document.getElementById("yel-facebook-popup")) {
                document.getElementById("yel-facebook-popup").display = "none";
            }
        })
    })

    //for close clicking outside
    Autience.lifecycle.postRender.push(function (widget) {
        if (Autience.utils.nestedValue(widget, ['configuration', 'close', 'outside'])) {
            //console.log('close on clicking outside')

            Autience.utils.classListen('yel-popup-main-wrapper', 'click', function () {
                //console.log('clicked outside')
                Autience.utils.closeWidget(widget)
            })
            Autience.utils.classListen('yel-popup-template', 'click', function (e) {
                e.stopPropagation();
            })
        }
    }) //close lifecycle


    //adding event listeners for analytics
    Autience.lifecycle.postRender.push(function (widget) {


        // if (widget.components.commonanalytics.values.measureAnalyticsBoolean) {
        if (Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'measureAnalyticsBoolean'])) {
            var yel_measure_analytics = widget.components.commonanalytics.values.measureAnalyticsBoolean;

            var yel_popup_name = 'Yeloni'

            // if (widget.components.commonanalytics.values.analyticsPopupName) {
            if (Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'analyticsPopupName'])) {
                var yel_temp_popup_name = widget.components.commonanalytics.values.analyticsPopupName;
                var yel_popup_name = 'Yeloni-' + yel_temp_popup_name.split(' ').join('-');
            }

            if (typeof ga === "function") {
                //listening for linkedimage clicks
                Autience.utils.classListen('yel-atr-linked-image', 'click', function (el) {
                    //send the popup display event
                    //alert('pinterest follow clicked22')
                    ga('send', 'event', yel_popup_name, 'Linked-Image-Click');
                });

                //listening for linkedtext clicks
                Autience.utils.classListen('yel-atr-linked-text', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'Linked-Text-Click');
                });

                //listening for button clicks
                //========do something for yes no buttons
                Autience.utils.classListen('yel-atr-button', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'Button-Click');
                });

                Autience.utils.classListen('yel-yes-button', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'Yes-Button-Click');
                });
                Autience.utils.classListen('yel-no-button', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'No-Button-Click');
                });

                Autience.utils.classListen('yel-pinterest-follow-image', 'click', function (el) {
                    //send the popup display event
                    //alert('pinterest follow clicked')
                    ga('send', 'event', yel_popup_name, 'Pinterest-Follow-Click');
                });

                //social share popup begin
                Autience.utils.idListen('autience-network-pinterest', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'Pinterest-Follow-Click');
                });
                Autience.utils.idListen('autience-network-facebook', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'facebook-Follow-Click');
                });
                Autience.utils.idListen('autience-network-twitter', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'twitter-Follow-Click');
                });
                Autience.utils.idListen('autience-network-googleplus', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'googleplus-Follow-Click');
                });
                Autience.utils.idListen('autience-network-linkedin', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'linkedin-Follow-Click');
                });
                Autience.utils.idListen('autience-network-reddit', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'reddit-Follow-Click');
                });
                Autience.utils.idListen('autience-network-whatsapp', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'whatsapp-Follow-Click');
                });
                Autience.utils.idListen('autience-network-flipboard', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'flipboard-Follow-Click');
                });
                Autience.utils.idListen('autience-network-baidu', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'baidu-Follow-Click');
                });
                Autience.utils.idListen('autience-network-sinaweibo', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'sinaweibo-Follow-Click');
                });
                Autience.utils.idListen('autience-network-slashdot', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'slashdot-Follow-Click');
                });
                Autience.utils.idListen('autience-network-vkontakte', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'vkontakte-Follow-Click');
                });
                //social share popup end

                //email popup subscribe event
                Autience.utils.classListen('yel-ep-submit-button', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'Subscribe-Button-Click');
                });
                Autience.utils.classListen('yel-email-popup-button-large', 'click', function (el) {
                    //send the popup display event
                    ga('send', 'event', yel_popup_name, 'Subscribe-Button-Click');
                });
                //email popup subscribe event end
            }
        }

    })



    Autience.lifecycle.close.push(function (widget) {
        document.getElementById(widget.code).style.visibility = 'hidden'
        if (widget.default_display) {
            document.getElementById(widget.code).style.display = widget.default_display
        }
    })


    //close the zopim window if needed
    Autience.lifecycle.close.push(function (widget) {
        if (typeof $zopim != 'undefined') {
            $zopim.livechat.window.hide();
        }
    })


    //send an analytics event is applicable
    Autience.lifecycle.close.push(function (widget) {


        // if (widget.components.commonanalytics.values.measureAnalyticsBoolean) {
        if (Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'measureAnalyticsBoolean'])) {
            var yel_measure_analytics = widget.components.commonanalytics.values.measureAnalyticsBoolean;


            var yel_popup_name = 'Yeloni'

            // if (widget.components.commonanalytics.values.analyticsPopupName) 

            if (Autience.utils.nestedValue(widget, ['components', 'commonanalytics', 'values', 'analyticsPopupName'])) {
                var yel_temp_popup_name = widget.components.commonanalytics.values.analyticsPopupName;
                var yel_popup_name = 'Yeloni-' + yel_temp_popup_name.split(' ').join('-');
            }
            if (typeof ga === "function") {
                //send the popup display event
                ga('send', 'event', yel_popup_name, 'Popup-Closed');
            }
        }
    })


    Autience.lifecycle.postRender.push(function (widget) {
        //Show an alertbox before the browser window closes


        if (Autience.utils.nestedValue(widget, ['configuration', 'close', 'alert'])) {
            window.onbeforeunload = function (e) {
                return Autience.utils.nestedValue(widget, ['configuration', 'close', 'message'])
            };
        }
    })

    if (yetience_callback) {
        yetience_callback()
    }
};
window.defineAutienceEmail = function (yetience_callback) {
    //console.log('injecting email.js')
    if (Autience) {

        email_json = {}
        Autience.lifecycle.postRender.push(function (widget) {


            var name = null,
                email = null,
                name_field_id = 'autience-emailform-name-' + widget.code,
                email_field_id = 'autience-emailform-email-' + widget.code,
                email_error_id = 'autience-emailform-email-error-' + widget.code,
                name_error_id = 'autience-emailform-name-error-' + widget.code,
                submit_field_id = 'autience-emailform-submit-' + widget.code

            var values = Autience.utils.nestedValue(widget, ['components', 'emailSubscription', 'values'])
            if (!values) {
                return
            }
            // console.log(widget)

            // if (widget.components.emailSubscription) {

            if ((Autience.utils.nestedValue(widget, ['components', 'emailSubscription']))) {

                Autience.utils.idListen(submit_field_id, 'click', function () {
                    //console.log("submit clicked")

                    var default_thankyou_message = 'You have been subscribed',
                        custom_thankyou_message = null,
                        thankyou_message = ''

                    if ((Autience.utils.nestedValue(widget, ['components', 'emailSubscription', 'values', 'customMessage']))) {

                        custom_thankyou_message = (Autience.utils.nestedValue(widget, ['components', 'emailSubscription', 'values', 'customMessage']))
                    }

                    if (custom_thankyou_message) {
                        thankyou_message = custom_thankyou_message
                    } else {
                        thankyou_message = default_thankyou_message
                    }

                    var previous_submit_text = document.getElementById(submit_field_id).innerHTML
                    document.getElementById(submit_field_id).innerHTML = "Hold on.."

                    name = document.getElementById(name_field_id).value
                    if (!validateName(name)) {
                        //console.log("Invalid name"+name_error_id)
                        document.getElementById(name_error_id).innerHTML = 'Invalid Name'
                        document.getElementById(name_error_id).style.display = 'block'
                        document.getElementById(submit_field_id).innerHTML = previous_submit_text
                        return;
                    } else {
                        document.getElementById(name_error_id).style.display = 'none'
                    }


                    email = document.getElementById(email_field_id).value
                    if (!validateEmail(email)) {
                        //console.log("Invalid email")
                        document.getElementById(email_error_id).innerHTML = 'Invalid Email'
                        document.getElementById(email_error_id).style.display = 'block'
                        document.getElementById(submit_field_id).innerHTML = previous_submit_text
                        return;
                    } else {
                        document.getElementById(email_error_id).style.display = 'none'
                    }


                    var provider = widget.components.emailSubscription.values.provider
                    var list = widget.components.emailSubscription.values.list
                    var verify = widget.components.emailSubscription.values.verify
                    var send_welcome_email = Autience.utils.nestedValue(widget, ['components', 'welcomeEmail', 'values', 'sendWelcomeEmail'])


                    // if(!welcome_email){
                    //     send_welcome_email = false
                    // }

                    //creating a variable
                    var autience_user_details = {
                        "email": email,
                        "name": name,
                        "website_id": Autience.setup.id,
                        "provider": provider,
                        "list": list,
                        "verify": verify,
                        "send_welcome_email": send_welcome_email,
                        "widget_id": widget.code,
                        "website_domain": Autience.setup.initial_domain
                    }

                    if ((Autience.utils.nestedValue(widget, ['components', 'welcomeEmail', 'values', 'removeSignatureFeature']))) {
                        autience_user_details.remove_email_signature = (Autience.utils.nestedValue(widget, ['components', 'welcomeEmail', 'values', 'removeEmailSignature']))
                    }

                    Autience.utils.sendEvent('new_email_subscribed', autience_user_details);
                    //console.log("back from sendEvent")

                    var autience_subscription_url = yetience.server + '/api/EmailSubscriptions/new_subscription';
                    console.log(autience_subscription_url)


                    //display if premium thankyou page is found or not

                    // if (widget.components.emailSubscription.values.thankyou != 'yeloni') {
                    if ((Autience.utils.nestedValue(widget, ['components', 'emailSubscription', 'values', 'thankyou'])) != 'yeloni') {
                        console.log('premium thankyou page found')
                    } else {
                        console.log('default thankyou page')
                    }

                    //function(url, method, data, success, failure)
                    window.yetience.ajax(autience_subscription_url, 'POST', autience_user_details,
                        function (status_response) {
                            //success
                            console.log('email response')
                            console.log(status_response)
                            var status = JSON.parse(status_response).status;

                            if (status == "CREATED_SUBSCRIPTION") {
                                //create cookie if cta is selected - don't show popup after subscription feature
                                if (typeof window.yeloniSubscriptionCallback === 'function') {
                                    console.log('Found a subscription callback function ')
                                    window.yeloniSubscriptionCallback(autience_user_details)
                                }

                                // if (widget.configuration.whom.cta == true) {
                                if ((Autience.utils.nestedValue(widget, ['configuration', 'whom', 'cta'])) == true) {
                                    Autience.utils.createCookie("autience-visitor-subscribed-" + widget.code, true, true)
                                }

                                Autience.utils.sendEvent('provider_email_saved', autience_user_details);


                                //go to thankyou page, if it's enabled

                                // if (widget.components.emailSubscription.values.thankyou == 'custom') {
                                if ((Autience.utils.nestedValue(widget, ['components', 'emailSubscription', 'values', 'thankyou'])) == 'custom') {
                                    console.log('custom redirect')
                                    setTimeout(function () {
                                        window.location = widget.components.emailSubscription.values.thankyouUrl
                                    }, 3000);
                                    return
                                } else {
                                    document.getElementById('yeloni-email-form').innerHTML = thankyou_message
                                    document.getElementById('yeloni-email-form').style.textAlign = "center"
                                    document.getElementById('yeloni-email-form').style.fontSize = "16px"

                                    if (widget.themeType == "ActionButtons") {
                                        setTimeout(function () {
                                            document.getElementById('yel-main-box-wrapper').style.display = "none"
                                            document.getElementById('yel-arrow-wrapper').style.display = "none"
                                        }, 3000);
                                    } else {
                                        setTimeout(function () {
                                            Autience.utils.closeWidget(widget)
                                        }, 3000);
                                    }
                                    return
                                }
                                //ignore thankyou page if disabled, close the widget

                                // window.location="http://yeloni.com/emails/subscription-thankyou.html"
                                return
                            }

                            document.getElementById(submit_field_id).innerHTML = previous_submit_text

                            if (status == "ALREADY_SUBSCRIBED" || status == "SUBSCRIPTION_ERROR") {
                                document.getElementById(email_error_id).innerHTML = 'Email is already subscribed'
                                document.getElementById(email_error_id).style.display = 'block'
                            }

                            if (status == "SUBSCRIPTION_ERROR") {
                                document.getElementById(email_error_id).innerHTML = 'There was an error during susbcription'
                                document.getElementById(email_error_id).style.display = 'block'
                            }


                        },
                        function () {
                            //error
                            console.log("something went wrong")
                        });


                })

            }


            function validateEmail(email) {
                if (!email || email.length < 2) {
                    return false
                }
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                return re.test(email);
            }

            function validateName(name) {
                if (typeof (Autience.utils.nestedValue(widget, ['components', 'emailSubscription', 'values', 'askName'])) != 'undefined') {
                    if (!(Autience.utils.nestedValue(widget, ['components', 'emailSubscription', 'values', 'askName']))) {
                        return true
                    }
                }

                if (!(Autience.utils.nestedValue(widget, ['components', 'namePlaceholder', 'values', 'showName']))) {
                    return true
                }

                if (!name || name.length < 2) {
                    return false
                }

                //var r_name = new RegExp(/^[a-zA-Z. ]+$/);//check that only alphabets are allowed. This is disabled because european names can have other characters
                var r_name = new RegExp(/^([^0-9]*)$/) //dont allow numbers

                var ret_reg = r_name.test(name)

                return ret_reg
            }

        })

        if (yetience_callback) {
            yetience_callback()
        }

    }



};
window.defineAutienceGDPR = function (yetience_callback) {
    //console.log('injecting email.js')
    if (Autience) {

        Autience.lifecycle.postRender.push(function (widget) {
            // console.log('Inside GDPR client side code')
            toggleSubmitButton(widget)

            Autience.utils.classListen('yel-gdpr-checkbox-' + widget.code, 'click', function (el) {
                toggleSubmitButton(widget)
            })
        })



        if (yetience_callback) {
            yetience_callback()
        }

    }

    function toggleSubmitButton(widget) {
        var submit_id = 'autience-emailform-submit-' + widget.code
        var gdpr_checkboxes = document.getElementsByClassName('yel-gdpr-checkbox-' + widget.code)
        var num_checked = 0

        //  console.log('checkboxes ', gdpr_checkboxes)

        var show_consent = Autience.utils.nestedValue(widget, ['components', 'gdprPlaceholder', 'values', 'showConsentCheckbox'])
        var show_terms = Autience.utils.nestedValue(widget, ['components', 'gdprPlaceholder', 'values', 'showTermsOfService']) || Autience.utils.nestedValue(widget, ['components', 'gdprPlaceholder', 'values', 'showPrivacyPolicy'])
        //  console.log("consent = ", show_consent, " show terms = ", show_terms);
        var num_to_be_checked = show_consent + show_terms


        for (var i = 0; i < gdpr_checkboxes.length; i++) {
            num_checked = num_checked + gdpr_checkboxes[i].checked
        }
        // console.log('num_to_be_checked ', num_to_be_checked, 'num_checked ', num_checked)

        var submit_button = document.getElementById(submit_id)
        if (submit_button) {
            if (num_checked == num_to_be_checked) {
                //submit_button.style.visibility = 'visible'
                submit_button.classList.remove("yel-grayed-button");
            } else {
                //submit_button.style.visibility = 'hidden'
                submit_button.classList.add("yel-grayed-button");
            }

        }
    }



};
window.defineAutienceSocial = function(yetience_callback) {
    //console.log('injecting social.js')
    if (Autience) {
        //console.log('really injecting social.js')
        Autience.lifecycle.postRender.push(function(widget) {

            Autience.setup.networks.forEach(function(N) {
                //console.log(N)
                bindAutienceShare(N.label, 'autience-network-' + N.label, N.sharing_link, N.sharing_param)
            })


            function bindAutienceShare(network, button_id, share_link, share_param) {

                //console.log('binding ' + network + ' to ' + button_id)

                var Config = {
                    Link: "a.share",
                    Width: 500,
                    Height: 500
                }
                var encoded_url = encodeURIComponent(window.location)

                Autience.utils.idListen(button_id, 'click', PopupHandler)

                function PopupHandler(e) {
                    console.log('clicked on ' + network)


                    console.log('share_link- ' + share_link)
                    console.log('share_param- ' + share_param)

                    e = (e ? e : window.event);
                    var t = (e.target ? e.target : e.srcElement);

                    // popup position
                    var
                        px = Math.floor(((screen.availWidth || 1024) - Config.Width) / 2),
                        py = Math.floor(((screen.availHeight || 700) - Config.Height) / 2);

                    // open popup
                    var popup = window.open(share_link + '?' + share_param + '=' + encoded_url, "social",
                        "width=" + Config.Width + ",height=" + Config.Height +
                        ",left=" + px + ",top=" + py +
                        ",location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1");
                    if (popup) {
                        popup.focus();
                        if (e.preventDefault) e.preventDefault();
                        e.returnValue = false;
                    }

                    return !!popup;
                }
            }

        })

        if (yetience_callback) {
            yetience_callback()
        }
    }
};
window.defineAutienceRedirect = function(yetience_callback) {
    Autience.lifecycle.postRender.push(function(widget) {

        var component_array = []

        for (var tag in widget.components) {
            component_array.push({
                tag: tag,
                component: widget.components[tag]
            })
        }

        component_array.forEach(function(item) {
            Autience.utils.executeOnClass('autience-redirect-' + item.tag, function(el) {
                console.log('found redirect button ' + item.tag)

                Autience.utils.listen(el, 'click', function() {
                    //console.log('redirect button clicked')
                    //console.log(item.component)
                    var operation = item.component.values.operation
                    var url = null
                    switch (operation) {
                        case 'redirect':
                            url = item.component.values.redirectTo
                            break
                        case 'redirectClicked':
                            url = Autience.current_link
                            break
                    }

                    console.log('redirect to ' + url)
                    switch (item.component.values.redirectOn) {
                        case 'same':

                            Autience.utils.redirect(url)
                            break

                        case 'new':

                            Autience.utils.redirect(url, '_blank')
                            break
                    }

                    Autience.utils.closeWidget(widget)
                })
            })
        })

    })

    if (yetience_callback) {
        yetience_callback()
    }


};
window.defineAutienceChat = function (yetience_callback) {
    if (Autience) {
        Autience.lifecycle.postRender.push(function (widget) {

            Autience.setup.networks.forEach(function (N) {
                bindAutienceChat("zopim")
            })


            function bindAutienceChat(chatProvider) {
                //close popup
                Autience.utils.classListen('autience-open-chat', 'click', function () {
                    if (typeof zE != 'undefined' && typeof $zopim != 'undefined') {
                        zE.activate()
                        $zopim.livechat.window.show();
                        //$zopim.livechat.window.openPopout()
                    } else {
                        console.log('Zopim is not installed')
                    }
                })

            }
        })


        Autience.lifecycle.display.push(function (widget) {
            if (typeof $zopim != 'undefined') {
                //for zopim popup to be shown as "in the popup"
                var yel_body_height = window.innerHeight;
                var yel_body_width = window.innerWidth;
                var yel_zopim_height = 400;
                var yel_zopim_width = 310;
                var yel_popup_offset = 76;
                var chat_wrapper = document.getElementById("yel-chat-wrapper")

                if (chat_wrapper) {
                    var yel_loc = chat_wrapper.getBoundingClientRect();

                    $zopim(function () {
                        //open the chat if it is closed
                        $zopim.livechat.window.show();

                        //change location
                        $zopim.livechat.window.setOffsetHorizontal(yel_body_width - yel_zopim_width - yel_loc.left - 5);
                        $zopim.livechat.window.setOffsetVertical((yel_body_height - yel_zopim_height) - yel_popup_offset);

                        /*var ua = navigator.userAgent.toLowerCase(),
                        platform = navigator.platform.toLowerCase();
                        platformName = ua.match(/ip(?:ad|od|hone)/) ? ‘ios’ : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || [‘other’])[0],
                        isMobile = /ios|android|webos/.test(platformName);*/
                        console.log(yel_body_width)
                        if (yel_body_width < 481) {
                            console.log("ot is mobile")
                            $zopim.livechat.window.setOffsetVertical((yel_body_height - yel_zopim_height) - yel_popup_offset);
                        }

                    })
                }



            }
        })

        if (yetience_callback) {
            yetience_callback()
        }
    }


};
window.defineAutienceBack = function(yetience_callback) {
    /*
    Autience.lifecycle.render.push(function(widget) {
        // console.log('inside back button code')
        // console.log(widget.trigger)
        //console.log('checking for  trigger for back button')


        if (((Autience.utils.nestedValue(widget, ['trigger', 'trigger'])) == 'back') && !window.location.hash) {
            //console.log('inserting  trigger for back button')
            var history_length = window.history.length
                //console.log('history length before - ' + history_length)

            setTimeout(function() {
                //console.log('setting hash using window.location.hash')
                window.location.hash = Autience.utils.randomString(); //

                setTimeout(function() {
                    Autience.hash_set = true
                }, 1000)

                setTimeout(function() {
                    //console.log('history length after setting hash using window.location.hash ' + window.history.length)
                    //if history length is still the same that means popup on back button wont work
                    if (history_length == window.history.length) {
                        //console.log('changing hash by changing location')
                        var new_location = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + Autience.utils.randomString()
                        window.location = new_location

                        setTimeout(function() {
                            //console.log('history length after setting hash using window.location ' + window.history.length)
                            if (history_length == window.history.length) {
                                if (window.history.pushState) {
                                    new_location = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + Autience.utils.randomString()
                                        //console.log('inserting using window.history.pushState')
                                    window.history.pushState(null, null, new_location)
                                    setTimeout(function() {
                                        //console.log('history length after pushState- '+window.history.length)
                                    }, 1000)
                                }

                            }
                        }, 1000)
                    }
                }, 1000)
            }, 1000)


        } else {
            //console.log('no need to insert trigger for back button')
            //console.log('hash at this point of time- ' + window.location.hash)
            if (!window.location.hash) {
                console.log('hash is not defined')
            }
        }

    })
    */

    Autience.lifecycle.render.push(function(widget) {
        if ((Autience.utils.nestedValue(widget, ['trigger', 'trigger'])) == 'back') {
            //Add an extra state in the browser with the same url as current one
            if (window.history && window.history.pushState) {
                history.pushState({
                    foo: "bar"
                }, "page 2", window.location.pathname);
            } else {
                console.log('window.history is not defined on this browser')
            }

        }
    })

    if (yetience_callback) {
        yetience_callback()
    }
}

window.defineAutienceActionButton = function (yetience_callback) {
    //honor disable widget setting

    Autience.lifecycle.displayValidation.push(function (widget) {
        //return true = show, false = hide
        if (isActionButtonTheme(widget.themeType)) {
            var widget_enabled = widget.configuration.what.enable

            if (widget_enabled) {
                //console.log('enabled')
                return true
            } else {
                // console.log('disabled')
                return false
            }
        }
        return true
    })



    //Keep the button on screen when "no" is clicked in yes no popup
    Autience.lifecycle.postRender.push(function (widget) {
        if (isActionButtonTheme(widget.themeType) && widget.theme == "action-button-yesno") {

            // for button 1 - YES
            // if (widget.components.button1Link.values.operation == 'close') {
            if ((Autience.utils.nestedValue(widget, ['components', 'button1Link', 'values', 'operation'])) == 'close') {
                Autience.utils.classListen('yel-yes-button', 'click', function (el) {
                    document.getElementsByClassName("yel-ab-main-wrapper")[0].style.visibility = "visible"
                    document.getElementById("yel-main-box-wrapper").style.display = "none"
                    document.getElementById("yel-circle-wrapper").style.display = "block"

                })
            }

            // for button 2 - NO
            // if (widget.components.button2Link.values.operation == 'close') {
            if ((Autience.utils.nestedValue(widget, ['components', 'button2Link', 'values', 'operation'])) == 'close') {
                Autience.utils.classListen('yel-no-button', 'click', function (el) {
                    document.getElementsByClassName("yel-ab-main-wrapper")[0].style.visibility = "visible"
                    document.getElementById("yel-main-box-wrapper").style.display = "none"
                    document.getElementById("yel-circle-wrapper").style.display = "block"

                })
            }
        }
    })

    //close on closing small popup
    Autience.lifecycle.postRender.push(function (widget) {
        if (isActionButtonTheme(widget.themeType)) {
            Autience.utils.classListen('yel-arrow-box-close', 'click', function (el) {
                //console.log('yel-arrow-box-close clicked')
                document.getElementById("yel-arrow-wrapper").style.display = "none"
            })
        }
    })

    //close on closing Large popup
    Autience.lifecycle.postRender.push(function (widget) {
        if (isActionButtonTheme(widget.themeType)) {
            Autience.utils.classListen('yel-mb-close', 'click', function (el) {
                //console.log('yel-main-box-close clicked')
                document.getElementById("yel-main-box-wrapper").style.display = "none"
            })
        }
    })

    //big popup on clicking button
    Autience.lifecycle.postRender.push(function (widget) {
        if (isActionButtonTheme(widget.themeType)) {
            document.getElementsByClassName("yel-main-box-wrapper")[0].style.display = "none";
            Autience.utils.classListen('yel-cta-button', 'click', function (el) {
                //Open big popup
                //set css as display:block for yel-main-box-wrapper
                document.getElementsByClassName("yel-main-box-wrapper")[0].style.display = "block";
            })
        }
    })

    //check if it is an action button theme, only then execute the functions
    function isActionButtonTheme(themeType) {
        if (themeType == "ActionButtons")
            return true
        else
            return false
    }


    if (yetience_callback) {
        yetience_callback()
    }
}