(function() {
    var BASE_URL = "https://vis91490.infusionsoft.app";

    function buildDataModel() {
        var resolution = screen.width + "x" + screen.height;
        var pluginsArray = [];

        if (window.ActiveXObject) {
            pluginsArray = detectIEPlugins();

        } else {
            pluginsArray = []
                .filter.call(navigator.plugins, function(plugin) {
                    var pluginName = simplifiedPluginName(plugin.name);

                    return pluginName ? true : false;
                })
                .map(function(plugin) {
                    return simplifiedPluginName(plugin.name);
                });
        }

        return {
            screenResolution: resolution,
            plugins: pluginsArray,
            javaEnabled: navigator.javaEnabled(),
            domain: window.location.hostname,
            location: window.location.href,
            referrer: document.referrer
        };
    }

    function simplifiedPluginName(plugin) {
        var simplifiedPluginName = "";

        if (plugin.indexOf("Adobe Reader") > 0) {
            simplifiedPluginName = "Adobe Reader";
        }

        if (plugin.indexOf("Shockwave") > 0 || plugin.indexOf("director") > 0) {
            simplifiedPluginName = "Shockwave";
        }

        if (plugin.indexOf("Flash") > 0) {
            simplifiedPluginName = "Flash";
        }

        if (plugin.indexOf("QuickTime") > 0) {
            simplifiedPluginName = "Quick Time";
        }
        
        if (plugin.indexOf("RealPlayer") > 0 || plugin.indexOf("Real Player") > 0) {
            simplifiedPluginName = "RealPlayer";
        }
        
        if (plugin.indexOf("Windows Media Player") > 0) {
            simplifiedPluginName = "Windows Media Player";
        }
        
        if (plugin.indexOf("Silverlight") > 0) {
            simplifiedPluginName = "Silverlight";
        }

        return simplifiedPluginName;
    }

    function detectIEPlugins() {
        var activeXNames = {'AcroPDF.PDF':'Adobe Reader',
            'ShockwaveFlash.ShockwaveFlash':'Flash',
            'QuickTime.QuickTime':'Quick Time',
            'SWCtl':'Shockwave',
            'WMPLayer.OCX':'Windows Media Player',
            'AgControl.AgControl':'Silverlight'};
        
        var plugins = [];
        for (var activeKey in activeXNames) {
            if (activeXNames.hasOwnProperty(activeKey)) {
                try {
                    // Attempt to verify that the plugin exists by creating it.
                    new ActiveXObject(activeKey);

                    plugins.push(activeXNames[activeKey]);
                } catch (e) {
                    // do nothing, the plugin is not installed
                }
            }
        }

        var realPlayerNames = ['rmockx.RealPlayer G2 Control',
            'rmocx.RealPlayer G2 Control.1',
            'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
            'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
            'RealPlayer'];

        var hasRealPlayerPlugin = false;
        for (var i = 0; i < realPlayerNames.length; i++) {
            var realPlayerPlugin = null;
            try {
                // Attempting to create a real player plugin
                realPlayerPlugin = new ActiveXObject(realPlayerNames[i]);
            } catch (e) {
                continue;
            }

            if (realPlayerPlugin) {
                hasRealPlayerPlugin = true;
                break;
            }
        }

        if (hasRealPlayerPlugin) {
            plugins.push('RealPlayer');
        }

        return plugins;
    }

    function getParameterByName(name) {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function getContactIdFromExistingCookie() {
        return document.cookie.replace(/(?:(?:^|.*;\s*)contactId\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    }

    function triggerEventForContactId(contactId, seed) {
        var contactIdImage = new Image(1, 1);
        contactIdImage.onLoad = function() {};
        contactIdImage.src = BASE_URL + '/app/webTracking/contact/' + seed + '?contactId=' + contactId + buildRequestParams();

        unbindCookieListener();
    }

    function triggerEventForContactKey(contactKey, seed) {
        var contactHashImage = new Image(1, 1);
        contactHashImage.onLoad = function() {};
        contactHashImage.src = BASE_URL + '/app/webTracking/contactByHash/' + seed + '?contactKey=' + contactKey + buildRequestParams();

        unbindCookieListener();
    }

    function buildRequestParams() {
        var data = buildDataModel();
        return '&screenResolution=' + data.screenResolution +
            '&plugins=' + data.plugins.join(',') +
            '&javaEnabled=' + data.javaEnabled +
            '&domain=' + data.domain +
            '&location=' + data.location +
            '&referrer=' + data.referrer;
    }

    function createCookie(contactId) {
        var fourWeeksInSeconds = 60 * 60 * 24 * 28;
        document.cookie = 'contactId=' + contactId + ';path=/;max-age=' + fourWeeksInSeconds
                +'; SameSite=None; Secure';
    }

    function buildIframe() {
        var iframe = document.createElement('iframe');
        iframe.src = BASE_URL + '/app/webTracking/websiteTriggerIframe';
        iframe.hidden = true;
        document.body.appendChild(iframe);
    }

    function unbindCookieListener() {
        window.removeEventListener('message', iframeCookieHandler);
    }

    function iframeCookieHandler(e) {
        if (e.data) {
            try {
                var eventData = JSON.parse(e.data);
            } catch (error) {
                return;
            }

            if (eventData !== null && typeof eventData === 'object' && e.origin === BASE_URL && eventData && eventData.eventName === 'inf-website-trigger-contact-event') {
                var contactId = eventData.contactId || 0;
                triggerEventForContactId(contactId, INITIAL_TIMESTAMP);

                if (contactId > 0) {
                    createCookie(contactId);
                }
            }
        }
    }

    var INITIAL_TIMESTAMP = new Date().getTime();

    document.onreadystatechange = function() {
        if (document.readyState === 'complete') {
            var contactKeyHash = getParameterByName('inf_contact_key');
            var contactIdFromExistingCookie = getContactIdFromExistingCookie();

            if (contactKeyHash) {
                triggerEventForContactKey(contactKeyHash, INITIAL_TIMESTAMP);

            } else if (contactIdFromExistingCookie > 0) {
                triggerEventForContactId(contactIdFromExistingCookie, INITIAL_TIMESTAMP);

            } else {
                window.addEventListener('message', iframeCookieHandler);
                buildIframe();
            }
        }
    };
    
})();
