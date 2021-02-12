(function() {
    //https://console.developers.google.com/apis/credentials?project=wav-recorder
    if (typeof(NeighborScience) === "undefined") {
        NeighborScience = {};
    }
    if (typeof(NeighborScience.Service) === "undefined") {
        NeighborScience.Service = {}; 
    }
    NeighborScience.Service.Upload = uploadService();

    function uploadService() {
        return {
            Init: handleClientLoad,
            OnSignInClicked: onSignInClicked,
            OnSignOutClicked: onSignOutClicked
        }
    }

    // Client ID and API key from the Developer Console
    var CLIENT_ID = '159278953767-dr599rvaun6j2r3g3apgi2fmdg3h9ei7.apps.googleusercontent.com';
    var API_KEY = 'AIzaSyD9KECw-ZXckHHNcXw0HrOyTpuaXm9vQ2s';

    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    var SCOPES = 'https://www.googleapis.com/auth/drive.file';

    var elements = {
        btnAuthorize: null,
        btnSignout: null
    };

    /**
     *  On load, called to load the auth2 library and API client library.
     */
    function handleClientLoad() {
        gapi.load('client:auth2', init);
    }

    function init() {        
        Object.getOwnPropertyNames(elements)
            .forEach(name => elements[name] = document.getElementById(name));
        return initClient();
    }

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    function initClient() {
        let initConfig = {
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        };
        return gapi.client.init(initConfig)
            .then(function () {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
                // Handle the initial sign-in state.
                updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            }, console.error);
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            elements.btnAuthorize.style.display = 'none';
            elements.btnSignout.style.display = 'block';
        } else {
            elements.btnAuthorize.style.display = 'block';
            elements.btnSignout.style.display = 'none';
        }
    }

    /**
     *  Sign in the user upon button click.
     */
    function onSignInClicked(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function onSignOutClicked(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    function createFile(fileName) {
        //gapi.auth2.
    }

})();