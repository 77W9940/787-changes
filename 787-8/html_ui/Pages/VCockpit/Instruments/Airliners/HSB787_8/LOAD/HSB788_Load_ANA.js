class HSB788_LOAD extends BaseInstrument {
    constructor() {
        //Kuro.

        //loadingScreen
        //
        const imageList = [//Add Images HERE
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/ANA/LoadingScreen_ANA.jpg",
        ];
        const LoadImage = imageList[Math.floor(Math.random() * imageList.length)];
        Coherent.trigger("SET_BACKGROUND_IMAGE", LoadImage);
        super();
    }
    get templateID() {
        return "HSB788_LOAD";
    }
    connectedCallback() {
        const gameState = document.body.getAttribute("gamestate") || (window.parent && window.parent.document.body.getAttribute("gamestate"));
        function loadingScreen() {
            if (gameState !== "loading") {
                Coherent.trigger("SET_BACKGROUND_IMAGE", null);
            } else {
                setTimeout(loadingScreen, 1000);
            }
        }
        loadingScreen();

        var guid = this.getAttribute("Guid");
        LaunchFlowEvent("ON_VCOCKPIT_INSTRUMENT_INITIALIZED", guid, "HSB788_LOAD", false, false);
    }
}
registerInstrument('hsb788-load', HSB788_LOAD);
