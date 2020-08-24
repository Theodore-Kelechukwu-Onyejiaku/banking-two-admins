//1. load loader.js
//2. once loader.js is loaded, load the client dependencies
//console.log('inside client-wordpress.js')

window.loadYetience = function (yetience_callback) {

    if (window.yetience && window.yetience.path) {

        window.yetience_load_app_called = true
        //console.log('calling window.yetience.loadApp')
        window.yetience.loadApp(window.yetience.path + "/client", function () {
            //console.log('completed window.yetience.loadApp')
            window.yetience.all_scripts_loaded = true
            //make sure that all other scripts are loaded before calling this

            if (yetience_callback) {
                yetience_callback()
            }

        })
    }

};