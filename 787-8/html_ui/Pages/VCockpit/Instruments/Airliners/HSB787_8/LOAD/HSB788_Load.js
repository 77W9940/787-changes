class HSB788_LOAD extends BaseInstrument {
    constructor() {
        //Kuro.

        //loadingScreen
        //
        const imageList = [//Add Images HERE
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/AAL/LoadingScreen_AAL.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/ACA/LoadingScreen_ACA.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/ANA_1/LoadingScreen_ANAs.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/ANA/LoadingScreen_ANA.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/AVA/LoadingScreen_AVA.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/BAW/LoadingScreen_BAW.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/BOE/LoadingScreen_BOE.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/CPT/LoadingScreen_CPT.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/ETH/LoadingScreen_ETH.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/JAL/LoadingScreen_JAL.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/QTR/LoadingScreen_QTR.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/TUI/LoadingScreen_TUI.jpg",
            "coui://html_ui/Pages/VCockpit/Instruments/Airliners/HSB787_8/Assets/images/Loading/UAL/LoadingScreen_UAL.jpg",
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
