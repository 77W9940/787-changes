class HSB78X_COM extends BaseAirliners {
    constructor() {
        super(...arguments);
        this.allPages = [];
        this.currentPageId = 0;
        this.storedFrequencies = new Array(24).fill(""); 
    }
    get templateID() {
        return "B787_10_Com";
    }
    get instrumentAlias() {
        return "AS01B_Com";
    }
    connectedCallback() {
        super.connectedCallback();
        this.allPages.push(new B787_10_Com_Menu(this)); // 0
        this.allPages.push(new B787_10_Com_VHF(this)); // 1
        this.allPages.push(new B787_10_Com_HF(this)); // 2
        this.allPages.push(new B787_10_Com_SAT(this)); // 3
        this.allPages.push(new B787_10_Com_CAB(this)); // 4
        this.allPages.push(new B787_10_Com_GPWS(this)); // 5
        this.allPages.push(new B787_10_Com_WXR(this)); // 6
        this.allPages.push(new B787_10_Com_XPDR(this)); // 7
        this.allPages.push(new B787_10_Com_NAV(this)); // 8
        this.allPages.push(new B787_10_Com_WXR2(this)); // 9
        this.allPages.push(new B787_10_Com_Stored(this)); // 10
        this.allPages.push(new B787_10_Com_NAV1(this)); // 11
        this.allPages.push(new B787_10_Com_SAT2(this)); // 12
        this.allPages.push(new B787_10_Com_RadioMisc(this)); // 13
        this.allPages.push(new B787_10_Com_SystemPower(this)); // 14
        this.showPage(0);
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.syncStoredFrequencies();
        if (this.allPages[this.currentPageId]) {
            this.allPages[this.currentPageId].onUpdate(_deltaTime);
        }
    }
    syncStoredFrequencies() {
        for (let i = 0; i < 24; i++) {
            const simVal = SimVar.GetSimVarValue("L:HS787_COM_STORED_FREQ" + i, "number");
            const strVal = (simVal > 0) ? fastToFixed(simVal, 3) : "";
            if (this.storedFrequencies[i] !== strVal) {
                this.storedFrequencies[i] = strVal;
            }
        }
    }
    saveStoredFrequencies() {
        for (let i = 0; i < 24; i++) {
            const valStr = this.storedFrequencies[i];
            const valNum = (valStr && valStr !== "" && valStr !== "-------") ? parseFloat(valStr) : 0;
            SimVar.SetSimVarValue("L:HS787_COM_STORED_FREQ" + i, "number", valNum);
        }
    }
    onEvent(_event) {
        if (this.currentPageId === 10 && (_event === "next" || _event === "prev")) {
            const storePage = this.allPages[10];
            
            if (_event === "prev") {
                if (storePage.pageIndex === 0) {
                    this.showPage(1); 
                    return;
                }
            } else if (_event === "next") {
                const max = storePage.getMaxPages();
                if (storePage.pageIndex >= max) {
                    this.showPage(1); 
                    return;
                }
            }
            
            this.allPages[10].onEvent(_event);
            return;
        }

        switch (_event) {
            case "menu":
                this.showPage(0);
                break;
            case "vhf":
                this.showPage(1);
                break;
            case "hf":
                this.showPage(2);
                break;
            case "sat":
                this.showPage(3);
                break;
            case "cab":
                this.showPage(4);
                break;
            case "gpws":
                this.showPage(5);
                break;
            case "wxr":
                this.showPage(6);
                break;
            case "xpdr":
                this.showPage(7);
                break;
            case "nav":
                this.showPage(11);
                break;
            case "next":
                this.nextPage();
                break;
            case "prev":
                this.prevPage();
                break;
            default:
                this.allPages[this.currentPageId].onEvent(_event);
                break;
        }
    }
    showPage(_id) {
        this.currentPageId = _id;
        for (let i = 0; i < this.allPages.length; i++) {
            if (i === this.currentPageId) {
                this.allPages[i].show();
            } else {
                this.allPages[i].hide();
            }
        }
        if (this.currentPageId === 7) {
            this.updateXPDRCode();
        } else if (this.currentPageId === 8) {
            this.updateNAVData();
        }
    }
    nextPage() {
        if (this.currentPageId === 6) {
            this.showPage(9);
        } else if (this.currentPageId === 9) {
            this.showPage(6);
        }
        if (this.currentPageId === 1) {
            this.showPage(10);
        } else if (this.currentPageId === 10) {
            this.showPage(1);
        }
        if (this.currentPageId === 11) {
            this.showPage(8);
        } else if (this.currentPageId === 8) {
            this.showPage(11);
        }
        if (this.currentPageId === 3) {
            this.showPage(12);
        } else if (this.currentPageId === 12) {
            this.showPage(3);
        }
    }
    prevPage() {
        if (this.currentPageId === 6) {
            this.showPage(9);
        } else if (this.currentPageId === 9) {
            this.showPage(6);
        }
        if (this.currentPageId === 10) {
            this.showPage(1);
        } else if (this.currentPageId === 1) {
            this.showPage(10);
        }
        if (this.currentPageId === 8) {
            this.showPage(11);
        } else if (this.currentPageId === 11) {
            this.showPage(8);
        }
        if (this.currentPageId === 3) {
            this.showPage(12);
        } else if (this.currentPageId === 12) {
            this.showPage(3);
        }
    }
    updateXPDRCode() {
        const code = SimVar.GetSimVarValue("TRANSPONDER CODE:1", "number");
        const xpdrPage = this.allPages[7];
        xpdrPage.setFreq(xpdrPage.l1, code);
    }
    updateNAVData() {
        const course = SimVar.GetSimVarValue("L:FLIGHTPLAN_APPROACH_COURSE", "number");
        const fmcILS = SimVar.GetSimVarValue("L:FLIGHTPLAN_APPROACH_ILS", "number");
        const navPage = this.allPages[8];
        navPage.setCourse(navPage.l2, course);
        navPage.setFreq(navPage.l1, fmcILS);
    }
}

class B787_10_Com_Page {
    constructor(_com, _elementName) {
        this.inputMax = 20;
        this.inputClr = "CLEAR";
        this.inputInvalid = "INVALID ENTRY";
        this.visible = false;
        this.com = _com;
        this.input = this.com.querySelector(".Input");
        this.lastClrTime = 0;
        this.setRoot(_elementName);
    }
    setRoot(_elementName) {
        if (this.root) {
            diffAndSetAttribute(this.root, "visibility", "hidden");
        }
        this.root = this.com.querySelector(_elementName);
        if (this.root) {
            this.l1 = this.root.querySelector(".L1");
            this.l2 = this.root.querySelector(".L2");
            this.l3 = this.root.querySelector(".L3");
            this.l4 = this.root.querySelector(".L4");
            this.r1 = this.root.querySelector(".R1");
            this.r2 = this.root.querySelector(".R2");
            this.r3 = this.root.querySelector(".R3");
            this.r4 = this.root.querySelector(".R4");
            diffAndSetAttribute(this.root, "visibility", (this.visible) ? "visible" : "hidden");
        }
    }
    show() {
        diffAndSetAttribute(this.root, "visibility", "visible");
        this.visible = true;
    }
    hide() {
        diffAndSetAttribute(this.root, "visibility", "hidden");
        this.visible = false;
    }
    onUpdate(_deltaTime) {}
    onEvent(_event) {
        if (_event.startsWith("BTN_")) {
            const key = _event.replace("BTN_", "");
            if (this.input.textContent == this.inputClr || this.input.textContent == this.inputInvalid) {
                diffAndSetText(this.input, key);
            } else if (this.input.textContent.length < this.inputMax) {
                this.input.textContent += key;
            }
            return;
        }

        switch (_event) {
            case "clr":
                const now = Date.now();
                const isDoubleClick = (now - this.lastClrTime < 400);
                this.lastClrTime = now;
                const specialMessages = [this.inputClr, this.inputInvalid, "STORED ACTIVE"];

                if (specialMessages.includes(this.input.textContent)) {
                    diffAndSetText(this.input, "");
                } else if (isDoubleClick) {
                    diffAndSetText(this.input, "");
                } else {
                    if (this.input.textContent.length === 0) {
                        diffAndSetText(this.input, this.inputClr);
                    } else {
                        diffAndSetText(this.input, this.input.textContent.slice(0, -1));
                    }
                }
                return;

            case "star":
                if (this.input.textContent.length < this.inputMax) {
                    this.input.textContent += ".";
                }
                break;
        }
    }
    setValue(_elem, _val) {
        if (_elem == this.l1 || _elem == this.l2 || _elem == this.l3 || _elem == this.l4) {
            diffAndSetText(_elem, "<" + _val);
        } else if (_elem == this.r1 || _elem == this.r2 || _elem == this.r3 || _elem == this.r4) {
            diffAndSetText(_elem, _val + ">");
        }
    }
    getValue(_elem) {
        if (_elem == this.l1 || _elem == this.l2 || _elem == this.l3 || _elem == this.l4) {
            return _elem.textContent.substring(1);
        } else if (_elem == this.r1 || _elem == this.r2 || _elem == this.r3 || _elem == this.r4) {
            return _elem.textContent.substring(0, _elem.textContent.length - 1);
        }
        return "";
    }
    setHTML(_elem, _val) {
        if (_elem == this.l1 || _elem == this.l2 || _elem == this.l3 || _elem == this.l4) {
            diffAndSetHTML(_elem, "<" + _val);
        } else if (_elem == this.r1 || _elem == this.r2 || _elem == this.r3 || _elem == this.r4) {
            diffAndSetHTML(_elem, _val + ">");
        }
    }
    parseInputFreq(input) {
        let freq = parseFloat(input);
        if (!isNaN(freq)) {
            if (!input.includes(".")) {
                if (freq >= 118000) {
                    freq = freq / 1000.0;
                } else if (freq >= 11800) {
                    freq = freq / 100.0;
                } else if (freq >= 1180) {
                    freq = freq / 10.0;
                }
            }
        }
        return freq;
    }
}

class B787_10_Com_VHF extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#VHF");
        this._activeLine = -1;
        this.noFreq = "-----";
        this.l1Title = this.root.querySelector(".L1_Title");
        this.l2Title = this.root.querySelector(".L2_Title");
        this.l3Title = this.root.querySelector(".L3_Title");
        this.r1Title = this.root.querySelector(".R1_Title");
        this.r2Title = this.root.querySelector(".R2_Title");
        this.r3Title = this.root.querySelector(".R3_Title");
        this.arrows = this.root.querySelector("#Arrows");
        this.l1 = this.root.querySelector(".L1");
        this.l2 = this.root.querySelector(".L2");
        this.l3 = this.root.querySelector(".L3");
        this.r1 = this.root.querySelector(".R1");
        this.r2 = this.root.querySelector(".R2");
        this.r3 = this.root.querySelector(".R3");
        this.info = this.root.querySelector(".Info");

        this.lastInteractionTime = 0;
    }
    show() {
        super.show();
        this.setFreq(this.l1, this.com.radioNav.getVHF1ActiveFrequency(this.com.instrumentIndex));
        this.setFreq(this.r1, this.com.radioNav.getVHF1StandbyFrequency(this.com.instrumentIndex));
        this.setFreq(this.l2, this.com.radioNav.getVHF2ActiveFrequency(this.com.instrumentIndex));
        this.setFreq(this.r2, this.com.radioNav.getVHF2StandbyFrequency(this.com.instrumentIndex));
        this.setFreq(this.l3, this.com.radioNav.getVHF3ActiveFrequency(this.com.instrumentIndex));
        this.setFreq(this.r3, this.com.radioNav.getVHF3StandbyFrequency(this.com.instrumentIndex));
        this.activeLine = 0;
    }

    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        if (this.com.allPages[10] && this.info) {
            const storePage = this.com.allPages[10];
            const storedPagesCount = storePage.getMaxPages() + 1;
            const totalPages = 1 + storedPagesCount;
            diffAndSetText(this.info, `1/${totalPages}`);
        }

        if (Date.now() - this.lastInteractionTime < 1000) return;
        const v1a = SimVar.GetSimVarValue("COM ACTIVE FREQUENCY:1", "MHz");
        const v1s = SimVar.GetSimVarValue("COM STANDBY FREQUENCY:1", "MHz");
        const v2a = SimVar.GetSimVarValue("COM ACTIVE FREQUENCY:2", "MHz");
        const v2s = SimVar.GetSimVarValue("COM STANDBY FREQUENCY:2", "MHz");
        const v3a = SimVar.GetSimVarValue("COM ACTIVE FREQUENCY:3", "MHz");
        const v3s = SimVar.GetSimVarValue("COM STANDBY FREQUENCY:3", "MHz");

        if (Math.abs(this.readFreq(this.l1) - v1a) > 0.001) this.setFreq(this.l1, v1a);
        if (Math.abs(this.readFreq(this.r1) - v1s) > 0.001) this.setFreq(this.r1, v1s);
        if (Math.abs(this.readFreq(this.l2) - v2a) > 0.001) this.setFreq(this.l2, v2a);
        if (Math.abs(this.readFreq(this.r2) - v2s) > 0.001) this.setFreq(this.r2, v2s);
        if (Math.abs(this.readFreq(this.l3) - v3a) > 0.001) this.setFreq(this.l3, v3a);
        if (Math.abs(this.readFreq(this.r3) - v3s) > 0.001) this.setFreq(this.r3, v3s);

        const activeIdx = SimVar.GetSimVarValue("L:VHF_ACTIVE_INDEX:" + this.com.instrumentIndex, "number");
        if (this.activeLine !== activeIdx) {
            this.activeLine = activeIdx;
        }
    }

    get activeLine() {
        return this._activeLine;
    }
    set activeLine(_id) {
        if (this._activeLine != _id) {
            this._activeLine = _id;
            SimVar.SetSimVarValue("L:VHF_ACTIVE_INDEX:" + this.com.instrumentIndex, "number", _id);
            this.updateFontSizes();
            diffAndSetText(this.l1Title, "");
            diffAndSetText(this.l2Title, "");
            diffAndSetText(this.l3Title, "");
            diffAndSetText(this.r1Title, "");
            diffAndSetText(this.r2Title, "");
            diffAndSetText(this.r3Title, "");

            switch (this._activeLine) {
                case 0:
                    diffAndSetText(this.l1Title, "ACTIVE");
                    diffAndSetText(this.r1Title, "STBY");
                    this.arrows.style.transform = "translate(250px, 85px)";
                    break;
                case 1:
                    diffAndSetText(this.l2Title, "ACTIVE");
                    diffAndSetText(this.r2Title, "STBY");
                    this.arrows.style.transform = "translate(250px, 165px)";
                    break;
                case 2:
                    diffAndSetText(this.l3Title, "ACTIVE");
                    diffAndSetText(this.r3Title, "STBY");
                    this.arrows.style.transform = "translate(250px, 240px)";
                    break;
            }

            this.updateStbyTitle();
        }
    }
    updateFontSizes() {
        this.setFontSize(this.l1, this.activeLine === 0 ? '13em' : '10em');
        this.setFontSize(this.l2, this.activeLine === 1 ? '13em' : '10em');
        this.setFontSize(this.l3, this.activeLine === 2 ? '13em' : '10em');
        this.setFontSize(this.r1, this.activeLine === 0 ? '13em' : '10em');
        this.setFontSize(this.r2, this.activeLine === 1 ? '13em' : '10em');
        this.setFontSize(this.r3, this.activeLine === 2 ? '13em' : '10em');
    }
    setFontSize(element, size) {
        element.style.fontSize = size;
    }

    handleLineSelection(lineIndex, element, isRightSide) {
        this.activeLine = lineIndex;
        if (this.input.textContent !== "") {
            this.writeFreq(element);
        }
    }

    onEvent(_event) {
        super.onEvent(_event);
        this.lastInteractionTime = Date.now();
        if (this.input.textContent === "STORED ACTIVE" || this.input.textContent === "DUPLICATE") {
            this.input.style.color = "";
            this.input.style.fontSize = "";
            diffAndSetText(this.input, "");
        }

        switch (_event) {
            case "L1":
                this.handleLineSelection(0, this.l1, false);
                break;
            case "R1":
                if (this.input.textContent !== "") {
                    this.activeLine = 0;
                    this.writeFreq(this.r1);
                } else {
                    this.writeFreq(this.r1);
                }
                break;
            case "L2":
                this.handleLineSelection(1, this.l2, false);
                break;
            case "R2":
                if (this.input.textContent !== "") {
                    this.activeLine = 1;
                    this.writeFreq(this.r2);
                } else {
                    this.writeFreq(this.r2);
                }
                break;
            case "L3":
                this.handleLineSelection(2, this.l3, false);
                break;
            case "R3":
                if (this.input.textContent !== "") {
                    this.activeLine = 2;
                    this.writeFreq(this.r3);
                } else {
                    this.writeFreq(this.r3);
                }
                break;
            case "stbyup":
                this.stbyInc();
                break;
            case "stbydn":
                this.stbyDec();
                break;
            case "swap":
                this.swap();
                break;
            case "L4":
            case "store_active":
                this.storeActiveFrequency();
                break;
        }
    }

    getStbyElement() {
        switch (this.activeLine) {
            case 0:
                return this.r1;
            case 1:
                return this.r2;
            case 2:
                return this.r3;
        }
        return this.r1;
    }

    getStbyTitleElement() {
        switch (this.activeLine) {
            case 0:
                return this.r1Title;
            case 1:
                return this.r2Title;
            case 2:
                return this.r3Title;
        }
        return this.r1Title;
    }

    updateStbyTitle() {
        const elem = this.getStbyElement();
        const titleElem = this.getStbyTitleElement();
        const freqVal = this.readFreq(elem);
        const fixedFreq = fastToFixed(freqVal, 3);

        let foundIndex = -1;
        for (let i = 0; i < this.com.storedFrequencies.length; i++) {
            if (this.com.storedFrequencies[i] === fixedFreq) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex !== -1) {
            const page = Math.floor(foundIndex / 8) + 1;
            const listNum = foundIndex + 1;
            diffAndSetText(titleElem, `STBY - ${page}/${listNum}`);
        } else {
            diffAndSetText(titleElem, "STBY");
        }
    }

    stbyInc() {
        const stored = this.com.storedFrequencies.filter(f => f !== "" && f !== "-------");

        if (stored.length > 0) {
            const current = fastToFixed(this.readFreq(this.getStbyElement()), 3);
            let idx = stored.indexOf(current);

            let nextFreq;
            if (idx === -1) {
                nextFreq = stored[0];
            } else {
                idx = (idx + 1) % stored.length;
                nextFreq = stored[idx];
            }
            this.setFreq(this.getStbyElement(), parseFloat(nextFreq));
            this.updateStbyTitle();
        }
        this.updateSim();
    }

    stbyDec() {
        const stored = this.com.storedFrequencies.filter(f => f !== "" && f !== "-------");

        if (stored.length > 0) {
            const current = fastToFixed(this.readFreq(this.getStbyElement()), 3);
            let idx = stored.indexOf(current);

            let nextFreq;
            if (idx === -1) {
                nextFreq = stored[stored.length - 1];
            } else {
                idx--;
                if (idx < 0) idx = stored.length - 1;
                nextFreq = stored[idx];
            }
            this.setFreq(this.getStbyElement(), parseFloat(nextFreq));
            this.updateStbyTitle();
        }
        this.updateSim();
    }

    manualStbyChange(delta) {
        const elem = this.getStbyElement();
        const stby = this.readFreq(elem);
        let newValue = parseFloat(fastToFixed((stby + delta), 3));
        if (!RadioNav.isHz833Compliant(newValue)) {
            newValue = parseFloat(fastToFixed((newValue + delta), 3));
        }
        this.setFreq(elem, newValue);
        this.updateStbyTitle();
        this.updateSim();
    }

    swap() {
        switch (this.activeLine) {
            case 0:
                var activeFreq = this.readFreq(this.l1);
                var stbyFreq = this.readFreq(this.r1);
                this.setFreq(this.r1, activeFreq);
                this.setFreq(this.l1, stbyFreq);
                this.com.radioNav.swapVHFFrequencies(this.com.instrumentIndex, 1);
                break;
            case 1:
                var activeFreq = this.readFreq(this.l2);
                var stbyFreq = this.readFreq(this.r2);
                this.setFreq(this.r2, activeFreq);
                this.setFreq(this.l2, stbyFreq);
                this.com.radioNav.swapVHFFrequencies(this.com.instrumentIndex, 2);
                break;
            case 2:
                var activeFreq = this.readFreq(this.l3);
                var stbyFreq = this.readFreq(this.r3);
                this.setFreq(this.r3, activeFreq);
                this.setFreq(this.l3, stbyFreq);
                this.com.radioNav.swapVHFFrequencies(this.com.instrumentIndex, 3);
                break;
        }
        this.updateSim();
        this.updateStbyTitle();
    }

    storeActiveFrequency() {
        let activeElem;
        switch (this.activeLine) {
            case 0: activeElem = this.l1; break;
            case 1: activeElem = this.l2; break;
            case 2: activeElem = this.l3; break;
        }
        if (!activeElem) return;

        const freq = this.getValue(activeElem);

        let stored = false;
        for (let i = 0; i < this.com.storedFrequencies.length; i++) {
            if (this.com.storedFrequencies[i] === "" || this.com.storedFrequencies[i] === "-------") {
                this.com.storedFrequencies[i] = freq;
                stored = true;
                break;
            }
        }

        if (stored) {
            this.com.saveStoredFrequencies();

            if (this.l4) {
                this.l4.style.fill = "lime";
                this.l4.style.fontSize = "40px";
                if (this.storeAnimTimer) clearTimeout(this.storeAnimTimer);
                this.storeAnimTimer = setTimeout(() => {
                    if (this.l4) {
                        this.l4.style.fill = "";
                        this.l4.style.fontSize = "";
                    }
                }, 1500);
            }
            diffAndSetText(this.input, "");
        } 
    }

    checkFreq(_frq) {
        if (_frq >= 118 && _frq <= 136.9 && RadioNav.isHz833Compliant(_frq)) {
            return true;
        }
        return false;
    }
    setFreq(_elem, _frq) {
        if (isFinite(_frq) && _frq > 0) {
            this.setValue(_elem, fastToFixed(_frq, 3));
        } else {
            this.setValue(_elem, this.noFreq);
        }
    }
    writeFreq(_elem) {
        if (this.input.textContent == this.inputClr) {
            this.setValue(_elem, this.noFreq);
            this.updateSim();
            this.updateStbyTitle();
        } else {
            const freq = this.parseInputFreq(this.input.textContent);
            if (this.checkFreq(freq)) {
                this.setValue(_elem, fastToFixed(freq, 3));
                diffAndSetText(this.input, "");
                this.updateSim();
                this.updateStbyTitle();
            } else {
                diffAndSetText(this.input, this.inputInvalid);
            }
        }
    }
    readFreq(_elem) {
        const val = this.getValue(_elem);
        if (val != this.noFreq) {
            const frq = parseFloat(val);
            if (isFinite(frq)) {
                return frq;
            }
        }
        return 0;
    }
    updateSim() {
        switch (this.activeLine) {
            case 0:
                var activeFreq = this.readFreq(this.l1);
                var stbyFreq = this.readFreq(this.r1);
                this.com.radioNav.setVHF1ActiveFrequency(this.com.instrumentIndex, activeFreq);
                this.com.radioNav.setVHF1StandbyFrequency(this.com.instrumentIndex, stbyFreq);
                break;
            case 1:
                var activeFreq = this.readFreq(this.l2);
                var stbyFreq = this.readFreq(this.r2);
                this.com.radioNav.setVHF2ActiveFrequency(this.com.instrumentIndex, activeFreq);
                this.com.radioNav.setVHF2StandbyFrequency(this.com.instrumentIndex, stbyFreq);
                break;
            case 2:
                var activeFreq = this.readFreq(this.l3);
                var stbyFreq = this.readFreq(this.r3);
                this.com.radioNav.setVHF3ActiveFrequency(this.com.instrumentIndex, activeFreq);
                this.com.radioNav.setVHF3StandbyFrequency(this.com.instrumentIndex, stbyFreq);
                break;
        }
    }
}
class B787_10_Com_XPDR extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#XPDR");
        this.noFreq = "0000";
    }
    show() {
        super.show();
        this.switchSide(true);
        this.switchMode(false);
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                this.writeFreq(this.l1);
                break;
            case "L2":
                SimVar.SetSimVarValue("K:XPNDR_IDENT_ON", "bool", true);
                break;
        }
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        const code = SimVar.GetSimVarValue("TRANSPONDER CODE:1", "number");
        if (this.readFreq(this.l1) != code) {
            this.setFreq(this.l1, code);
        }
    }
    switchSide(_val) {
        if (_val) {
            this.setHTML(this.l4, "<tspan style='fill:lime'>L</tspan><tspan style='font-size:26px'>←→R</tspan>");
        } else {
            this.setHTML(this.l4, "<tspan style='font-size:26px'>L←→</tspan><tspan style='fill:lime'>R</tspan>");
        }
    }
    switchMode(_val) {
        if (_val) {
            this.setHTML(this.r4, "<tspan style='fill:lime'>ABS</tspan><tspan style='font-size:26px'>←→REL</tspan>");
        } else {
            this.setHTML(this.r4, "<tspan style='font-size:26px'>ABS←→</tspan><tspan style='fill:lime'>REL</tspan>");
        }
    }
    checkFreq(_frq) {
        return RadioNav.isXPDRCompliant(_frq);
    }
    setFreq(_elem, _frq) {
        if (isFinite(_frq) && _frq > 0) {
            this.setValue(_elem, fastToFixed(_frq, 0).padStart(4, "0"));
        } else {
            this.setValue(_elem, this.noFreq);
        }
    }
    writeFreq(_elem) {
        if (this.input.textContent == this.inputClr) {
            this.setValue(_elem, this.noFreq);
            this.updateSim();
        } else {
            const freq = parseFloat(this.input.textContent);
            if (this.checkFreq(freq)) {
                this.setValue(_elem, fastToFixed(freq, 0).padStart(4, "0"));
                diffAndSetText(this.input, "");
                this.updateSim();
            } else {
                diffAndSetText(this.input, this.inputInvalid);
            }
        }
    }
    readFreq(_elem) {
        const val = this.getValue(_elem);
        if (val != this.noFreq) {
            const frq = parseFloat(val);
            if (isFinite(frq)) {
                return frq;
            }
        }
        return 0;
    }
    updateSim() {
        var freq = this.readFreq(this.l1);
        SimVar.SetSimVarValue("K:XPNDR_SET", "Frequency BCD16", Avionics.Utils.make_xpndr_bcd16(freq));
    }
}
class B787_10_Com_NAV extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#NAV");
        this.noFreq = "-----";
        this.noCourse = "---";
        this.ils = 0;
        this.course = 0;
        this.fmcILS = 0;
        this.switchState = false;
    }
    show() {
        super.show();
        const savedState = this.getNavSwitchState();
        this.switch(savedState);

        if (this.ils === 0) {
            this.setValue(this.l1, "------");
        } else {
            this.setFreq(this.l1, this.ils);
        }

        if (this.course === 0) {
            this.setValue(this.l2, "---");
        } else {
            this.setCourse(this.l2, this.course);
        }
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        const fmcILS = SimVar.GetSimVarValue("L:FLIGHTPLAN_APPROACH_ILS", "number");
        if (fmcILS != this.fmcILS) {
            this.fmcILS = fmcILS;
            this.ils = fmcILS;
            this.course = SimVar.GetSimVarValue("L:FLIGHTPLAN_APPROACH_COURSE", "number");
            this.setFreq(this.l1, this.ils);
            this.setCourse(this.l2, this.course);
        }
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                if (this.switchState) {
                    this.writeFreq(this.l1);
                }
                break;
            case "L2":
                if (this.switchState) {
                    this.writeCourse(this.l2);
                }
                break;
            case "R1":
                const newState = !this.switchState;
                this.setNavSwitchState(newState);
                this.switch(newState);
                this.updateSim();
                break;
        }
    }
    switch(_val) {
        this.switchState = _val;
        if (_val) {
            this.setHTML(this.r1, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
        } else {
            this.setHTML(this.r1, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
        }
        this.setEditable(this.l1, _val);
        this.setEditable(this.l2, _val);
        this.updateDisplayColors();
        this.com.radioNav.setRADIONAVActive(this.com.instrumentIndex, _val);
    }
    getNavSwitchState() {
        return !!SimVar.GetSimVarValue("L:HS_B788_NAV_SWITCH", "Bool");
    }
    setNavSwitchState(val) {
        SimVar.SetSimVarValue("L:HS_B788_NAV_SWITCH", "Bool", !!val);
    }
    setEditable(_elem, _editable) {
        if (_editable) {
            _elem.removeAttribute("readonly");
        } else {
            _elem.setAttribute("readonly", true);
        }
    }
    updateDisplayColors() {
        const color = this.switchState ? "white" : "rgb(0, 183, 255)";
        this.setElemColor(this.l1, color);
        this.setElemColor(this.l2, color);
        
        const l1Title = document.querySelector("#NAV .L1_Title");
        const l2Title = document.querySelector("#NAV .L2_Title");
        const titleColor = this.switchState ? "white" : "rgb(0, 183, 255)";
        
        if (l1Title) l1Title.style.fill = titleColor;
        if (l2Title) l2Title.style.fill = titleColor;
    }
    setElemColor(_elem, _color) {
        if (_elem) _elem.style.fill = _color;
    }
    checkFreq(_frq) {
        return _frq >= 108 && _frq <= 111.95 && RadioNav.isHz50Compliant(_frq);
    }
    setFreq(_elem, _frq) {
        if (isFinite(_frq) && _frq > 0) {
            this.setValue(_elem, fastToFixed(_frq, 2));
        } else {
            this.setValue(_elem, this.noFreq);
        }
        this.updateDisplayColors();
    }
    writeFreq(_elem) {
        if (this.switchState) {
            if (this.input.textContent == this.inputClr) {
                this.setValue(_elem, this.noFreq);
                this.updateSim();
            } else {
                const freq = parseFloat(this.input.textContent);
                if (this.checkFreq(freq)) {
                    this.setValue(_elem, fastToFixed(freq, 2));
                    diffAndSetText(this.input, "");
                    this.updateSim();
                } else {
                    diffAndSetText(this.input, this.inputInvalid);
                }
            }
        }
    }
    setCourse(_elem, _crs) {
        if (isFinite(_crs) && _crs > 0) {
            this.setValue(_elem, fastToFixed(_crs, 0));
        } else {
            this.setValue(_elem, this.noCourse);
        }
        this.updateDisplayColors();
    }
    writeCourse(_elem) {
        if (this.switchState) {
            if (this.input.textContent == this.inputClr) {
                this.setValue(_elem, this.noCourse);
                this.updateSim();
            } else {
                const crs = parseFloat(this.input.textContent);
                if (crs > 0 && crs <= 360) {
                    this.setValue(_elem, fastToFixed(crs, 0));
                    diffAndSetText(this.input, "");
                    this.updateSim();
                } else {
                    diffAndSetText(this.input, this.inputInvalid);
                }
            }
        }
    }
    readFreq(_elem) {
        const val = this.getValue(_elem);
        if (val != this.noFreq) {
            const frq = parseFloat(val);
            return isFinite(frq) ? frq : 0;
        }
        return 0;
    }
    readCourse(_elem) {
        const val = this.getValue(_elem);
        if (val != this.noCourse) {
            const crs = parseInt(val);
            return isFinite(crs) ? crs : 0;
        }
        return 0;
    }
    updateSim() {
        this.ils = this.readFreq(this.l1);
        this.course = this.readCourse(this.l2);
        if (this.switchState) {
            this.com.radioNav.setILSActiveFrequency(1, this.ils);
        }
    }
}
class B787_10_Com_Menu extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#Menu");
    }
    show() {
        super.show();
        this.switchSide(false);
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                this.com.showPage(14); // Navigate to SYSTEM POWER page
                break;
            case "R4":
                this.com.showPage(13); // Navigate to RADIO MISC page
                break;
        }
    }
    switchSide(_val) {
        if (_val) {
            this.setHTML(this.r1, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
        } else {
            this.setHTML(this.r1, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
        }
    }
}
class B787_10_Com_SystemPower extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#SYSTEMPOWER");
        this.switchWxrL(true);
        this.switchXpdrL(true);
        this.switchWxrR(true);
        this.switchXpdrR(true);
    }
    show() {
        super.show();
        this.switchWxrL(this.getWxrLState());
        this.switchXpdrL(this.getXpdrLState());
        this.switchWxrR(this.getXpdrRState());
        this.switchXpdrR(this.getWxrRState());
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                const activeWxrL = this.getWxrLState();
                this.setWxrLState(!activeWxrL);
                this.switchWxrL(!activeWxrL);
                this.updateSim();
                break;
            case "L2":
                const activeXpdrL = this.getXpdrLState();
                this.setXpdrLState(!activeXpdrL);
                this.switchXpdrL(!activeXpdrL);
                this.updateSim();
                break;
            case "R1":
                const activeXpdrR = this.getXpdrRState();
                this.setXpdrRState(!activeXpdrR);
                this.switchWxrR(!activeXpdrR);
                this.updateSim();
                break;
            case "R2":
                const activeWxrR = this.getXpdrRState();
                this.setXpdrRState(!activeWxrR);
                this.switchXpdrR(!activeWxrR);
                this.updateSim();
                break;
        }
    }
    switchWxrL(_val) {
        if (_val) {
            this.setHTML(this.l1, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
        } else {
            this.setHTML(this.l1, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_WXR", "Bool", _val);
    }
    switchXpdrL(_val) {
        if (_val) {
            this.setHTML(this.l2, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
        } else {
            this.setHTML(this.l2, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_XPDR", "Bool", _val);
    }
    switchWxrR(_val) {
        if (_val) {
            this.setHTML(this.r1, "<tspan style='font-size:26px'>OFF←→</tspan><tspan style='fill:lime'>ON</tspan>");
        } else {
            this.setHTML(this.r1, "<tspan style='fill:lime'>OFF</tspan><tspan style='font-size:26px'>←→ON</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_WXR", "Bool", _val);
    }
    switchXpdrR(_val) {
        if (_val) {
            this.setHTML(this.r2, "<tspan style='font-size:26px'>OFF←→</tspan><tspan style='fill:lime'>ON</tspan>");
        } else {
            this.setHTML(this.r2, "<tspan style='fill:lime'>OFF</tspan><tspan style='font-size:26px'>←→ON</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_XPDR", "Bool", _val);
    }
    getWxrLState() {
        return !!SimVar.GetSimVarValue("L:HS_B788_WXR", "Bool");
    }
    setWxrLState(val) {
        SimVar.SetSimVarValue("L:HS_B788_WXR", "Bool", !!val);
    }
    getXpdrLState() {
        return !!SimVar.GetSimVarValue("L:HS_B788_XPDR", "Bool");
    }
    setXpdrLState(val) {
        SimVar.SetSimVarValue("L:HS_B788_XPDR", "Bool", !!val);
    }
    getXpdrRState() {
        return !!SimVar.GetSimVarValue("L:HS_B788_XPDR", "Bool");
    }
    setXpdrRState(val) {
        SimVar.SetSimVarValue("L:HS_B788_XPDR", "Bool", !!val);
    }
    setWxrRState() {
        return !!SimVar.GetSimVarValue("L:HS_B788_WXR", "Bool");
    }
    setWxrRState(val) {
        SimVar.SetSimVarValue("L:HS_B788_WXR", "Bool", !!val);
    }
}
class B787_10_Com_HF extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#HF");
        this._activeLine = -1;
        this.noFreq = "-----";
        this.l1Title = this.root.querySelector(".L1_Title");
        this.l2Title = this.root.querySelector(".L2_Title");
        this.r1Title = this.root.querySelector(".R1_Title");
        this.r2Title = this.root.querySelector(".R2_Title");
        this.r3Title = this.root.querySelector(".R3_Title");
        this.r4Title = this.root.querySelector(".R4_Title");
        this.arrows = this.root.querySelector("#Arrows");
        this.l1 = this.root.querySelector(".L1");
        this.l2 = this.root.querySelector(".L2");
        this.r1 = this.root.querySelector(".R1");
        this.r2 = this.root.querySelector(".R2");
        this.usbMode = true; // Track current mode: true = USB, false = AM
        this.sensValue = 100; // HF sensitivity value (0-100)
    }
    show() {
        super.show();
        this.switchSide(this.usbMode);
        this.updateSensDisplay(); //to avoid conflicts with vhf I had to do it this way
        this.setFreq(this.l1, 5.650);
        this.setFreq(this.r1, 6.650);
        this.setFreq(this.l2, 9.500);
        this.setFreq(this.r2, 13.350);
        this.activeLine = 0;
    }
    get activeLine() {
        return this._activeLine;
    }
    set activeLine(_id) {
        if (this._activeLine != _id) {
            this._activeLine = _id;
            this.updateFontSizes();
            switch (this._activeLine) {
                case 0:
                    diffAndSetText(this.l1Title, "ACTIVE");
                    diffAndSetText(this.l2Title, "");
                    diffAndSetText(this.r1Title, "STBY");
                    diffAndSetText(this.r2Title, "");
                    this.arrows.style.transform = "translate(250px, 85px)";
                    break;
                case 1:
                    diffAndSetText(this.l1Title, "");
                    diffAndSetText(this.l2Title, "ACTIVE");
                    diffAndSetText(this.r1Title, "");
                    diffAndSetText(this.r2Title, "STBY");
                    this.arrows.style.transform = "translate(250px, 165px)";
                    break;
            }
        }
    }
    updateFontSizes() {
        this.setFontSize(this.l1, this.activeLine === 0 ? '13em' : '10em');
        this.setFontSize(this.l2, this.activeLine === 1 ? '13em' : '10em');
        this.setFontSize(this.r1, this.activeLine === 0 ? '13em' : '10em');
        this.setFontSize(this.r2, this.activeLine === 1 ? '13em' : '10em');
    }
    setFontSize(element, size) {
        element.style.fontSize = size;
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                if (this.activeLine != 0) {
                    this.activeLine = 0;
                } else {
                    this.writeFreq(this.l1);
                    this.swap();
                }
                break;
            case "R1":
                this.writeFreq(this.r1);
                break;
            case "L2":
                if (this.activeLine != 1) {
                    this.activeLine = 1;
                } else {
                    this.writeFreq(this.l2);
                    this.swap();
                }
                break;
            case "R2":
                this.writeFreq(this.r2);
                break;
            case "R3":
                this.increaseSens();
                break;
            case "R4":
                this.decreaseSens();
                break;
            case "L4":
                this.usbMode = !this.usbMode;
                this.switchSide(this.usbMode);
                break;
            case "stbyup":
                this.stbyInc();
                break;
            case "stbydn":
                this.stbyDec();
                break;
            case "swap":
                this.swap();
                break;
        }
    }
    decreaseSens() {
        this.sensValue = Math.max(0, this.sensValue - 1);
        this.updateSensDisplay();
    }
    increaseSens() {
        this.sensValue = Math.min(100, this.sensValue + 1);
        this.updateSensDisplay();
    }
    updateSensDisplay() {
        if (this.r3Title) {
            diffAndSetText(this.r3Title, "HF SENS");
        }
        if (this.r4Title) {
            this.r4Title.textContent = this.sensValue.toString();
            this.r4Title.setAttribute("x", "-80");
            this.r4Title.style.fontSize = "40px";
        }
    }
    stbyInc() {
        const elem = (this.activeLine === 0) ? this.r1 : this.r2;
        const stby = this.readFreq(elem);
        let newValue = parseFloat(fastToFixed((stby + 0.001), 3));
        if (newValue > 30.0) {
            newValue = 30.0;
        }
        this.setFreq(elem, newValue);
    }
    stbyDec() {
        const elem = (this.activeLine === 0) ? this.r1 : this.r2;
        const stby = this.readFreq(elem);
        let newValue = parseFloat(fastToFixed((stby - 0.001), 3));
        if (newValue < 3.0) {
            newValue = 3.0;
        }
        this.setFreq(elem, newValue);
    }
    swap() {
        switch (this.activeLine) {
            case 0:
                var activeFreq = this.readFreq(this.l1);
                var stbyFreq = this.readFreq(this.r1);
                this.setFreq(this.r1, activeFreq);
                this.setFreq(this.l1, stbyFreq);
                break;
            case 1:
                var activeFreq = this.readFreq(this.l2);
                var stbyFreq = this.readFreq(this.r2);
                this.setFreq(this.r2, activeFreq);
                this.setFreq(this.l2, stbyFreq);
                break;
        }
    }
    checkFreq(_frq) {
        return (_frq >= 2.4 && _frq <= 2.499) ||
               (_frq >= 4.700 && _frq <= 4.799) ||
               (_frq >= 5.600 && _frq <= 5.699) ||
               (_frq >= 6.600 && _frq <= 6.699) ||
               (_frq >= 9.000 && _frq <= 9.999) ||
               (_frq >= 10.000 && _frq <= 10.999) ||
               (_frq >= 11.300 && _frq <= 11.399) ||
               (_frq >= 13.300 && _frq <= 13.399) ||
               (_frq >= 17.000 && _frq <= 17.999) ||
               (_frq >= 18.000 && _frq <= 23.210);
    }
    setFreq(_elem, _frq) {
        if (isFinite(_frq) && _frq > 0) {
            this.setValue(_elem, fastToFixed(_frq, 3));
        } else {
            this.setValue(_elem, this.noFreq);
        }
    }
    writeFreq(_elem) {
        if (this.input.textContent == this.inputClr) {
            this.setValue(_elem, this.noFreq);
        } else {
            const freq = parseFloat(this.input.textContent);
            if (this.checkFreq(freq)) {
                this.setValue(_elem, fastToFixed(freq, 3));
                diffAndSetText(this.input, "");
            } else {
                diffAndSetText(this.input, this.inputInvalid);
            }
        }
    }
    readFreq(_elem) {
        const val = this.getValue(_elem);
        if (val != this.noFreq) {
            const frq = parseFloat(val);
            if (isFinite(frq)) {
                return frq;
            }
        }
        return 0;
    }
    switchSide(_val) {
        if (_val) {
            this.setHTML(this.l4, "<tspan style='fill:lime'>USB</tspan><tspan style='font-size:26px'>←→AM</tspan>");
        } else {
            this.setHTML(this.l4, "<tspan style='fill:lime'>AM</tspan><tspan style='font-size:26px'>←→USB</tspan>");
        }
    }
}
class B787_10_Com_SAT extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#SAT");
        this.modes = ["LOW", "HGH", "EMG"];
        this.r1ModeIndex = 0; // Start with LOW
        this.r3ModeIndex = 0; // Start with LOW
    }
    show() {
        super.show();
        this.updateModeDisplay();
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "R1":
                this.cycleR1Mode();
                break;
            case "R3":
                this.cycleR3Mode();
                break;
        }
    }
    cycleR1Mode() {
        this.r1ModeIndex = (this.r1ModeIndex + 1) % this.modes.length;
        this.updateR1Display();
    }
    cycleR3Mode() {
        this.r3ModeIndex = (this.r3ModeIndex + 1) % this.modes.length;
        this.updateR3Display();
    }
    updateModeDisplay() {
        this.updateR1Display();
        this.updateR3Display();
    }
    updateR1Display() {
        const currentMode = this.modes[this.r1ModeIndex];
        if (this.r1) {
            this.setValue(this.r1, currentMode);
        }
    }
    updateR3Display() {
        const currentMode = this.modes[this.r3ModeIndex];
        if (this.r3) {
            this.setValue(this.r3, currentMode);
        }
    }
}
class B787_10_Com_SAT2 extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#SAT2");
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "R4":
                this.com.showPage(3); // Navigate back to SAT 1/2 (page 3)
                break;
        }
    }
}
class B787_10_Com_RadioMisc extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#RADIOMISC");
        this.switchSide(false);
        this.switchVhfL(true);
        this.switchVhfC(true);
        this.switchVhfR(true);
    }
    show() {
        super.show();
        this.switchVhfL(this.get1State());
        this.switchVhfC(this.get2State());
        this.switchVhfR(this.get3State());
        this.switchSide(this.get4State());
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                const active1 = this.get1State();
                this.set1State(!active1);
                this.switchVhfL(!active1);
                this.updateSim();
                break;
            case "L2":
                const active2 = this.get2State();
                this.set2State(!active2);
                this.switchVhfC(!active2);
                this.updateSim();
                break;
            case "L3":
                const active3 = this.get3State();
                this.set3State(!active3);
                this.switchVhfR(!active3);
                this.updateSim();
                break;
            case "R4":
                const active4 = this.get4State();
                this.set4State(!active4);
                this.switchSide(!active4);
                this.updateSim();
                break;
        }
    }
    switchVhfL(_val) {
        if (_val) {
            this.setHTML(this.l1, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
        } else {
            this.setHTML(this.l1, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool", _val);
    }
    switchVhfC(_val) {
        if (_val) {
            this.setHTML(this.l2, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
        } else {
            this.setHTML(this.l2, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool", _val);
    }
    switchVhfR(_val) {
        if (_val) {
            this.setHTML(this.l3, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
        } else {
            this.setHTML(this.l3, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool", _val);
    }
    switchSide(_val) {
        if (_val) {
            this.setHTML(this.r4, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
        } else {
            this.setHTML(this.r4, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_HFDL_GND", "Bool", _val);
    }
    get1State() {
        return !!SimVar.GetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool");
    }
    set1State(val) {
        SimVar.SetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool", !!val);
    }
    get2State() {
        return !!SimVar.GetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool");
    }
    set2State(val) {
        SimVar.SetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool", !!val);
    }
    get3State() {
        return !!SimVar.GetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool");
    }
    set3State(val) {
        SimVar.SetSimVarValue("L:HS_B788_VHF_SQUELCH", "Bool", !!val);
    }
    get4State() {
        return !!SimVar.GetSimVarValue("L:HS_B788_HFDL_GND", "Bool");
    }
    set4State(val) {
        SimVar.SetSimVarValue("L:HS_B788_HFDL_GND", "Bool", !!val);
    }
    updateSim() {
    }
}
class B787_10_Com_CAB extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#CAB");
    }
}
class B787_10_Com_GPWS extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#GPWS");
        this.switchFlap(true);
        this.switchGear(true);
        this.switchTerr(true);
        this.switchSide(false);
    }
    show() {
        super.show();
        this.switchSide(false);
        this.switchFlap(this.getGPWSFlapState());
        this.switchGear(this.getGPWSGearState());
        this.switchTerr(this.getGPWSTerrState());
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "R1":
                const active = this.getGPWSFlapState();
                this.setGPWSFlapState(!active);
                this.switchFlap(!active);
                this.updateSim();
                break;
            case "R2":
                const activeG = this.getGPWSGearState();
                this.setGPWSGearState(!activeG);
                this.switchGear(!activeG);
                this.updateSim();
                break;
            case "R3":
                const activeT = this.getGPWSTerrState();
                this.setGPWSTerrState(!activeT);
                this.switchTerr(!activeT);
                this.updateSim();
                break;
        }
    }
    switchFlap(_val) {
        if (_val) {
            this.setHTML(this.r1, "<tspan style='font-size:26px'>OVRD←→</tspan><tspan style='fill:lime'>NORM</tspan>");
        } else {
            this.setHTML(this.r1, "<tspan style='fill:lime'>OVRD</tspan><tspan style='font-size:26px'>←→NORM</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_GPWS_FLAP", "Bool", _val);
    }
    switchGear(_val) {
        if (_val) {
            this.setHTML(this.r2, "<tspan style='font-size:26px'>OVRD←→</tspan><tspan style='fill:lime'>NORM</tspan>");
        } else {
            this.setHTML(this.r2, "<tspan style='fill:lime'>OVRD</tspan><tspan style='font-size:26px'>←→NORM</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_GPWS_GEAR", "Bool", _val);
    }
    switchTerr(_val) {
        if (_val) {
            this.setHTML(this.r3, "<tspan style='font-size:26px'>OVRD←→</tspan><tspan style='fill:lime'>NORM</tspan>");
        } else {
            this.setHTML(this.r3, "<tspan style='fill:lime'>OVRD</tspan><tspan style='font-size:26px'>←→NORM</tspan>");
        }
        SimVar.SetSimVarValue("L:HS_B788_GPWS_TERR", "Bool", _val);
    }
    switchSide(_val) {
        if (_val) {
            this.setHTML(this.l4, "<tspan style='fill:lime'>L</tspan><tspan style='font-size:26px'>←→R</tspan>");
        } else {
            this.setHTML(this.l4, "<tspan style='font-size:26px'>L←→</tspan><tspan style='fill:lime'>R</tspan>");
        }
    }
    getGPWSFlapState() {
        return !!SimVar.GetSimVarValue("L:HS_B788_GPWS_FLAP", "Bool");
    }
    setGPWSFlapState(val) {
        SimVar.SetSimVarValue("L:HS_B788_GPWS_FLAP", "Bool", !!val);
    }
    getGPWSGearState() {
        return !!SimVar.GetSimVarValue("L:HS_B788_GPWS_GEAR", "Bool");
    }
    setGPWSGearState(val) {
        SimVar.SetSimVarValue("L:HS_B788_GPWS_GEAR", "Bool", !!val);
    }
    getGPWSTerrState() {
        return !!SimVar.GetSimVarValue("L:HS_B788_GPWS_TERR", "Bool");
    }
    setGPWSTerrState(val) {
        SimVar.SetSimVarValue("L:HS_B788_GPWS_TERR", "Bool", !!val);
    }
    updateSim() {
    }
}
class B787_10_Com_WXR extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#WXR");
        this.value = 0;
        this.selectedMode = 1; // 0 = WX, 1 = WX+T, 2 = MAP
        this.l2Title = this.root.querySelector(".L2_Title");
    }
    show() {
        super.show();
        this.switchSide(false);
        this.updateDisplay();
        this.updateModeDisplay();
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                if (this.value < 10) {
                    this.value += 1;
                    this.updateDisplay();
                }
                break;
            case "L2":
                if (this.value > -10) {
                    this.value -= 1;
                    this.updateDisplay();
                }
                break;
            case "R1":
                this.selectedMode = 0;
                this.updateModeDisplay();
                break;
            case "R2":
                this.selectedMode = 1;
                this.updateModeDisplay();
                break;
            case "R3":
                this.selectedMode = 2;
                this.updateModeDisplay();
                break;
        }
    }
    updateDisplay() {
        this.setHTML(this.c3, `<tspan style='font-size:30px'>${this.value}</tspan>`);
        if (this.l2Title) {
            this.l2Title.textContent = this.value.toString();
            this.l2Title.setAttribute("x", "80");
            this.l2Title.style.fontSize = "40px";
        }
    }
    updateModeDisplay() { // Update R1 (WX)
        if (this.r1) {
            if (this.selectedMode === 0) {
                this.r1.innerHTML = "<tspan style='fill:lime'>WX&gt;</tspan>";
            } else {
                this.r1.innerHTML = "<tspan style='fill:white'>WX&gt;</tspan>";
            }
        } // Update R2 (WX+T)
        if (this.r2) {
            if (this.selectedMode === 1) {
                this.r2.innerHTML = "<tspan style='fill:lime'>WX+T&gt;</tspan>";
            } else {
                this.r2.innerHTML = "<tspan style='fill:white'>WX+T&gt;</tspan>";
            }
        } // Update R3 (MAP)
        if (this.r3) {
            if (this.selectedMode === 2) {
                this.r3.innerHTML = "<tspan style='fill:lime'>MAP&gt;</tspan>";
            } else {
                this.r3.innerHTML = "<tspan style='fill:white'>MAP&gt;</tspan>";
            }
        }
    }
    switchSide(_val) {
        if (_val) {
            this.setHTML(this.r4, "<tspan style='fill:lime'>MAN</tspan><tspan style='font-size:26px'>←→AUTO</tspan>");
        } else {
            this.setHTML(this.r4, "<tspan style='font-size:26px'>MAN←→</tspan><tspan style='fill:lime'>AUTO</tspan>");
        }
    }
}

class B787_10_Com_Stored extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#VHF-STORE");
        this.l1Title = this.root.querySelector(".L1_Title");
        this.l2Title = this.root.querySelector(".L2_Title");
        this.l3Title = this.root.querySelector(".L3_Title");
        this.l4Title = this.root.querySelector(".L4_Title");
        this.r1Title = this.root.querySelector(".R1_Title");
        this.r2Title = this.root.querySelector(".R2_Title");
        this.r3Title = this.root.querySelector(".R3_Title");
        this.r4Title = this.root.querySelector(".R4_Title");
        this.info = this.root.querySelector(".Info");
        this.pageIndex = 0;
        this.lastRenderedState = new Array(8).fill(null);
    }
    setValue(_elem, _val) {
        diffAndSetText(_elem, _val);
    }

    show() {
        super.show();
        this.updateDisplay(true);
    }

    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.updateDisplay();
    }

    getFilledCount() {
        let count = 0;
        for (let i = 0; i < this.com.storedFrequencies.length; i++) {
            if (this.com.storedFrequencies[i] !== "" && this.com.storedFrequencies[i] !== "-------") {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    getMaxPages() {
        const filled = this.getFilledCount();
        let max = Math.floor(filled / 8);
        if (max > 2) max = 2;
        return max;
    }

    nextPage() {
        const max = this.getMaxPages();
        if (this.pageIndex < max) {
            this.pageIndex++;
            this.updateDisplay(true);
        } else {
            this.pageIndex = 0;
            this.updateDisplay(true);
        }
    }

    prevPage() {
        const max = this.getMaxPages();
        this.pageIndex--;
        if (this.pageIndex < 0) this.pageIndex = max;
        this.updateDisplay(true);
    }

    updateDisplay(force = false) {
        const stored = this.com.storedFrequencies;
        const offset = this.pageIndex * 8;
        const filledCount = this.getFilledCount();
        const maxPages = this.getMaxPages();
        let hasChanges = force;
        for (let i = 0; i < 8; i++) {
            const dataIndex = offset + i;
            let val = "";
            if (dataIndex < filledCount) {
                val = stored[dataIndex];
            } else if (dataIndex === filledCount) {
                val = "-------";
            }
            if (this.lastRenderedState[i] !== val) {
                hasChanges = true;
                this.lastRenderedState[i] = val;
            }
        }

        if (!hasChanges) return;
        const slots = [{
                el: this.l1,
                t: this.l1Title
            },
            {
                el: this.l2,
                t: this.l2Title
            },
            {
                el: this.l3,
                t: this.l3Title
            },
            {
                el: this.l4,
                t: this.l4Title
            },
            {
                el: this.r1,
                t: this.r1Title
            },
            {
                el: this.r2,
                t: this.r2Title
            },
            {
                el: this.r3,
                t: this.r3Title
            },
            {
                el: this.r4,
                t: this.r4Title
            }
        ];

        for (let i = 0; i < 8; i++) {
            const dataIndex = offset + i;
            const listNum = dataIndex + 1;
            if (slots[i].t) {
                if (dataIndex <= filledCount) {
                    diffAndSetText(slots[i].t, listNum.toString());
                } else {
                    diffAndSetText(slots[i].t, "");
                }
            }
            let val = this.lastRenderedState[i];

            this.setValue(slots[i].el, val);
        }

        if (this.info) {
            const currentVisualPage = this.pageIndex + 2;
            const totalPages = maxPages + 2;
            diffAndSetText(this.info, `${currentVisualPage}/${totalPages}`);
        }
    }

    onEvent(_event) {
        if (_event === "next") {
            this.nextPage();
            return;
        }
        if (_event === "prev") {
            this.prevPage();
            return;
        }

        if (_event === "clr") {
            const now = Date.now();
            const isDoubleClick = (now - this.lastClrTime < 500);
            this.lastClrTime = now;

            const currentInput = this.input.textContent;

            if (currentInput === "" && !isDoubleClick) {
                diffAndSetText(this.input, this.inputClr);
            } else if (isDoubleClick) {
                diffAndSetText(this.input, "CLEAR PAGE");
            } else if (currentInput === this.inputClr || currentInput === "CLEAR PAGE" || currentInput === this.inputInvalid) {
                diffAndSetText(this.input, "");
            } else {
                diffAndSetText(this.input, currentInput.slice(0, -1));
            }
            return; 
        }
        super.onEvent(_event);

        let index = -1;
        switch (_event) {
            case "L1":
                index = 0;
                break;
            case "L2":
                index = 1;
                break;
            case "L3":
                index = 2;
                break;
            case "L4":
                index = 3;
                break;
            case "R1":
                index = 4;
                break;
            case "R2":
                index = 5;
                break;
            case "R3":
                index = 6;
                break;
            case "R4":
                index = 7;
                break;
        }

        if (index !== -1) {
            this.handleLineKey(index);
        }
    }

    clearPage() {
        const offset = this.pageIndex * 8;
        this.com.storedFrequencies.splice(offset, 8);
        for (let k = 0; k < 8; k++) this.com.storedFrequencies.push("");
        const max = this.getMaxPages();
        if (this.pageIndex > max) this.pageIndex = max;
        this.com.saveStoredFrequencies();
        this.updateDisplay(true);
    }

    handleLineKey(uiIndex) {
        const dataIndex = (this.pageIndex * 8) + uiIndex;
        const filledCount = this.getFilledCount();

        if (this.input.textContent === "CLEAR PAGE") {
            this.clearPage(); 
            diffAndSetText(this.input, ""); 
            return;
        }

        if (this.input.textContent === this.inputClr) {
            if (dataIndex < filledCount) {
                this.com.storedFrequencies.splice(dataIndex, 1);
                this.com.storedFrequencies.push(""); 

                const max = this.getMaxPages();
                if (this.pageIndex > max) this.pageIndex = max;
                
                this.com.saveStoredFrequencies();
                diffAndSetText(this.input, "");
                this.updateDisplay(true);
            }
            return;
        }

        if (dataIndex > filledCount) return;

        if (this.input.textContent !== "" && this.input.textContent !== this.inputInvalid) {
            const freq = this.parseInputFreq(this.input.textContent);
            if (this.checkFreq(freq)) {
                this.com.storedFrequencies[dataIndex] = fastToFixed(freq, 3);
                this.com.saveStoredFrequencies();
                diffAndSetText(this.input, "");
                this.updateDisplay(true);
            } else {
                diffAndSetText(this.input, this.inputInvalid);
            }
        } else {
            if (dataIndex < filledCount) {
                diffAndSetText(this.input, this.com.storedFrequencies[dataIndex]);
            }
        }
    }

    checkFreq(_frq) {
        if (_frq >= 118 && _frq <= 136.9 && RadioNav.isHz833Compliant(_frq)) {
            return true;
        }
        return false;
    }
}



// WXR 2
class B787_10_Com_WXR2 extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#WXR2");
        this.tiltValue = 0; // Default tilt value
        this.l2Title = this.root.querySelector(".L2_Title");
    }
    show() {
        super.show();
        this.switchSide(true);
        this.switch(this.com.radioNav.getRADIONAVActive(this.com.instrumentIndex));
        this.updateTiltDisplay();
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                this.increaseTilt();
                break;
            case "L2":
                this.decreaseTilt();
                break;
            case "R1":
                const active = this.com.radioNav.getRADIONAVActive(this.com.instrumentIndex);
                this.com.radioNav.setRADIONAVActive(this.com.instrumentIndex, !active);
                this.switch(!active);
                this.updateSim();
                break;
        }
    }
    increaseTilt() {
        this.tiltValue = Math.min(10, this.tiltValue + 1);
        this.updateTiltDisplay();
    }
    decreaseTilt() {
        this.tiltValue = Math.max(-10, this.tiltValue - 1);
        this.updateTiltDisplay();
    }
    updateTiltDisplay() {
        if (this.l2Title) {
            this.l2Title.textContent = this.tiltValue.toString();
            this.l2Title.setAttribute("x", "-80");
            this.l2Title.style.fontSize = "40px";
        }
    }
    switch(_val) {
        if (_val) {
            this.setHTML(this.r1, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>←→OFF</tspan>");
            SimVar.SetSimVarValue("L:787_EXTERIOR_VOLUME", "Bool", true);
        } else {
            this.setHTML(this.r1, "<tspan style='font-size:26px'>ON←→</tspan><tspan style='fill:lime'>OFF</tspan>");
            SimVar.SetSimVarValue("L:787_EXTERIOR_VOLUME", "Bool", false);
        }
    }
    switchSide(_val) {
        if (_val) {
            this.setHTML(this.l4, "<tspan style='fill:lime'>L</tspan><tspan style='font-size:26px'>←→R</tspan>");
        } else {
            this.setHTML(this.l4, "<tspan style='font-size:26px'>L←→</tspan><tspan style='fill:lime'>R</tspan>");
        }
    }
    updateSim() {
        if (this.com.radioNav.getRADIONAVActive(this.com.instrumentIndex)) {
            this.com.radioNav.setILSActiveFrequency(1, this.ils);
        }
    }
}
class B787_10_Com_NAV1 extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#NAV1");
        this.l1 = this.root.querySelector(".L1");
        this.l2 = this.root.querySelector(".L2");
        this.l3 = this.root.querySelector(".L3");
        this.r1 = this.root.querySelector(".R1");
        this.r2 = this.root.querySelector(".R2");
        this.r3 = this.root.querySelector(".R3");
        this.r4 = this.root.querySelector(".R4");
        this.c5 = this.root.querySelector(".C5");
        this.c6 = this.root.querySelector(".C6");
        this.c7 = this.root.querySelector(".C7");
        this.lastAirspeed = null;
        this.lastLatitude = null;
        this.lastLongitude = null;
        this.updateTimer = setInterval(() => {
            this.updateAirspeed();
        }, 100);
        console.log("NAV1 Constructor: Timer started, elements found:", {
            c5: !!this.c5,
            c6: !!this.c6,
            c7: !!this.c7
        });
    }
    show() {
        super.show();
        this.updateAirspeed();
        this.switchSideL(true);
        this.switchSideR(false);
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L3":
                this.switchSideL(!this.lSideState);
                break;
            case "R3":
                this.switchSideR(!this.rSideState);
                break;
        }
    }
    switchSideL(_val) {
        this.lSideState = _val;
        if (_val) {
            this.setHTML(this.l3, "<tspan style='fill:lime'>N</tspan><tspan style='font-size:26px'>←→S</tspan>");
        } else {
            this.setHTML(this.l3, "<tspan style='font-size:26px'>N←→</tspan><tspan style='fill:lime'>S</tspan>");
        }
    }
    switchSideR(_val) {
        this.rSideState = _val;
        if (_val) {
            this.setHTML(this.r3, "<tspan style='fill:lime'>W</tspan><tspan style='font-size:26px'>←→E</tspan>");
        } else {
            this.setHTML(this.r3, "<tspan style='font-size:26px'>W←→</tspan><tspan style='fill:lime'>E</tspan>");
        }
    }
    updateSim() {
        super.updateSim();
        this.updateAirspeed();
    }
    updateAirspeed() {
        try {
            const airspeedIndicated = SimVar.GetSimVarValue("AIRSPEED INDICATED", "knots");
            const latitude = SimVar.GetSimVarValue("PLANE LATITUDE", "degrees");
            const longitude = SimVar.GetSimVarValue("PLANE LONGITUDE", "degrees");
            console.log(`Raw data - Speed: ${airspeedIndicated}, Lat: ${latitude}, Lon: ${longitude}`);
            const latDirection = latitude >= 0 ? 'N' : 'S';
            const latValue = Math.abs(latitude);
            const lonDirection = longitude >= 0 ? 'E' : 'W';
            const lonValue = Math.abs(longitude);
            const latDegrees = Math.floor(latValue);
            const latMinutes = (latValue - latDegrees) * 60;
            const lonDegrees = Math.floor(lonValue);
            const lonMinutes = (lonValue - lonDegrees) * 60;
            const airspeedText = `${Math.round(airspeedIndicated)}`;
            const latText = `${latDirection}${latDegrees}°${latMinutes.toFixed(1)}`;
            const lonText = `${lonDirection}${lonDegrees}°${lonMinutes.toFixed(1)}`;
            console.log(`Formatted - Speed: ${airspeedText}, Lat: ${latText}, Lon: ${lonText}`);
            if (this.c7) {
                this.c7.textContent = airspeedText;
                this.c7.innerHTML = airspeedText;
                while (this.c7.firstChild) {
                    this.c7.removeChild(this.c7.firstChild);
                }
                const textNode = document.createTextNode(airspeedText);
                this.c7.appendChild(textNode);
                this.c7.style.display = 'none';
                this.c7.offsetHeight;
                this.c7.style.display = '';
            }
            if (this.c6) {
                this.c6.textContent = lonText;
                this.c6.innerHTML = lonText;
            }
            if (this.c5) {
                this.c5.textContent = latText;
                this.c5.innerHTML = latText;
            }
            const c5Alt = this.root.querySelector('.C5');
            const c6Alt = this.root.querySelector('.C6');
            const c7Alt = this.root.querySelector('.C7');
            if (c7Alt && c7Alt !== this.c7) {
                c7Alt.textContent = airspeedText;
            }
            if (c6Alt && c6Alt !== this.c6) {
                c6Alt.textContent = lonText;
            }
            if (c5Alt && c5Alt !== this.c5) {
                c5Alt.textContent = latText;
            }
        } catch (error) {
            console.error("NavData:", error);
        }
    }
    forceUpdate() {
        this.lastAirspeed = null;
        this.lastLatitude = null;
        this.lastLongitude = null;
        this.updateAirspeed();
    }
    destroy() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        if (super.destroy) {
            super.destroy();
        }
    }
}
registerInstrument("b787-10-com-element", HSB78X_COM);
//# sourceMappingURL=B787_10_COM.js.map
