// import logo from './logo.svg';
// import './App.css';

import { useEffect, useState } from 'react';
import { appendScript } from './script';

const ggParams = {
    appName: "classic",
    id: "applet",
    borderColor: "#cccccc",
    width: 700,
    height: 900,
    showMenuBar: false,
    showAlgebraInput: false,
    showToolBar: false,
    showToolBarHelp: false,
    showResetIcon: false,
    enableLabelDrags: false,
    enableShiftDragZoom: false,
    enableRightClick: false,
    errorDialogsActive: false,
    useBrowserForJS: false,
    allowStyleBar: false,
    preventFocus: false,
    noScaleMargin: true,
    showZoomButtons: false,
    autoHeight: false,
    capturingThreshold: 3,
    showFullscreenButton: false,
    scaleContainerClass: "wrap",
    scale: 1,
    autoScale: true,
    disableAutoScale: false,
    allowUpscale: true,
    clickToLoad: false,
    showSuggestionButtons: false,
    language: "en",
    sendScreenshotToFirebase: false
};

const views = {
    is3D: 0,
    AV: 0,
    SV: 0,
    CV: 0,
    EV2: 0,
    CP: 0,
    PC: 0,
    DA: 0,
    FI: 0,
    macro: 0
};

let globalApi;

window.evalXML = function (xml, updateConstruction = false) {
    if (globalApi) {
        if(xml)
            globalApi.evalXML(xml);
        if(updateConstruction)
            globalApi.evalCommand("UpdateConstruction()");
    }
};

function Applet({ id, cacheManager }) {

    const [ggbState, setGgbState] = useState(false);
    const idParam = window.location.search.replace('?', '').split('&').filter(_ => _.indexOf('id=') != -1)[0].split('id=')[1];
    const filename = window.location.search.replace('?', '').split('&').filter(_ => _.indexOf('url=') != -1)[0].split('url=')[1];

    useEffect(() => {
        console.log(`iframe window height`, window.innerHeight);
        window.collab = true;
        appendScript(
            "https://cdn.geogebra.org/apps/deployggb.js",
            "geogebraScript",
            () => {
                setGgbState(true);
            }
        );


        function receiveMessage(event) {
            const eventJsonData = JSON.parse(event.data);
            console.log(`msg coming from other side`, eventJsonData);
            window.collab = false;
            // if(eventJsonData.type === "contentHeight") {
            //     eventJsonData.msg.
            // }
             if(eventJsonData.msg && eventJsonData.msg.events && eventJsonData.msg.events.length > 0) {
                for(let i=0;i<eventJsonData.msg.events.length;i++) {
                    window.evalXML(eventJsonData.msg.events[i].xml);
                }
                window.evalXML(null, true);
            }
            window.collab = true;
        }
        window.addEventListener("message", receiveMessage, false);
    }, []);

    useEffect(() => {

        if (ggbState) {
            let appletParams = {
                ...ggParams,
                id: idParam,
                appletOnLoad: function (api) {
                    globalApi = api;
                    function addListener(label) {
                        let parent = window.parent;
                        parent.postMessage(JSON.stringify({
                            id: idParam, msg: {
                                listener: 'ADD_LISTENER',
                                cmd: null,
                                xml: api.getXML(label)
                            }
                        }), 'https://main-ui-math-git-tenx-applet-fixes.whjr.dev');
                    }

                    function removeListener(objName) {
                    }

                    function renameListener(oldObjName, newObjName) {
                    }

                    function updateListener(objName) {
                        if(!window.collab) return;
                        let strVal = api.getValueString(objName);
                        let parent = window.parent;
                        parent.postMessage(JSON.stringify({
                            id: idParam, msg: {
                                listener: 'UPDATE_LISTENER',
                                cmd: strVal,
                                xml: api.getXML(objName)
                            }
                        }), 'https://main-ui-math-git-tenx-applet-fixes.whjr.dev');
                    }

                    const printConstructionState = () => {
                        var objNumber = api.getObjectNumber();
                        var strState = "Number of objects: " + objNumber;
                        for (let i = 0; i < objNumber; i++) {
                            let strName = api.getObjectName(i);
                            let strType = api.getObjectType(strName);
                            let strCommand = api.getCommandString(strName);
                            strState += "\n" + strType + " " + strName + ", " + strCommand;
                        }
                    }
                    window.printConstructionState = printConstructionState;
                    // register add, remove, rename and update listeners
                    api.registerAddListener(addListener);
                    api.registerRemoveListener(removeListener);
                    api.registerRenameListener(renameListener);
                    api.registerUpdateListener(updateListener);
                }
            };
            appletParams.filename = filename;
            let ggApplet = new window.GGBApplet(appletParams, "5.0", { ...views, AV: 0 });
            ggApplet.setHTML5Codebase(
                "https://www.geogebra.org/apps/5.0.636.0/web3d"
            );
            ggApplet.inject(idParam);
        }

    }, [ggbState])

    return (
        <div id={idParam}>
        </div>
    );
}

export default Applet;
