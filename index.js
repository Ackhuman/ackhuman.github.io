(function() {

    if (typeof(NeighborScience) === "undefined") {
        NeighborScience = {};
    }
    if (typeof(NeighborScience.Controller) === "undefined") {
        NeighborScience.Controller = {}; 
    }

    NeighborScience.Controller.Main = {
        Init: init
    };

    var templateInserts = [
        ['tplControls', 'containerControls'],
        ['tplDisplay', 'displayContainer'],
        ['tplIntroText', 'introTextContainer'],
        ['tplCloudControls', 'containerCloud']
    ];

    function init() {
        templateInserts.forEach(tplConfig => insertTemplate(...tplConfig));
        Object.assign(NeighborScience.Controller.Main, NeighborScience.Controller.Recording);
    }
    
    function insertTemplate(templateId, containerId) {
        let controlTemplate = document.getElementById(templateId);
        let controlContainer = document.getElementById(containerId);
        controlContainer.innerHTML = controlTemplate.innerHTML;
    }

})();