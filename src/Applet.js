// import logo from './logo.svg';
// import './App.css';

import { useEffect, useState } from 'react';
import { appendScript } from './script';

const ggParams = {
    appName: "classic",
    id: "applet",
    borderColor: "#cccccc",
    width: 880,
    height: 1035,
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

function Applet({ id, cacheManager }) {

    const [ggbState, setGgbState] = useState(false);
    const idParam = window.location.search.replace('?', '').split('&').filter(_ => _.indexOf('id=') != -1)[0].split('id=')[1];
    const filename = window.location.search.replace('?', '').split('&').filter(_ => _.indexOf('url=') != -1)[0].split('url=')[1];

    useEffect(() => {
        appendScript(
            "https://cdn.geogebra.org/apps/deployggb.js",
            "geogebraScript",
            () => {
                setGgbState(true);
            }
        );
    }, []);

    useEffect(() => {
        if (ggbState) {

            let appletParams = {
                ...ggParams,
                id: idParam,
                appletOnLoad: function (api) {
                    function addListener(objName) {
                        console.log(`addListener :- `, objName);
                        printConstructionState();
                    }

                    function removeListener(objName) {
                        // textarea1.value = "remove: " + objName + "\n" + textarea1.value.substring(0, strLength);
                        // printConstructionState();
                    }

                    function renameListener(oldObjName, newObjName) {
                        // textarea1.value = "rename: " + objName + "\n" + textarea1.value.substring(0, strLength);
                        // printConstructionState();
                    }

                    function updateListener(objName) {
                        let strVal = api.getValueString(objName);
                        console.log(`UpdateListener :- `, strVal);
                        var parent = window.parent;
                        parent.postMessage(JSON.stringify({ id:idParam, msg: strVal }), 'http://localhost:3000');
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
            fetch(filename).then((response) => {
                const responseClose = response.clone();
                cacheManager
                    .setUrlWithData(filename, responseClose)
                    .then(response => cacheManager.get(filename))
                    .then(res => {
                        appletParams.filename = res;
                        let ggApplet = new window.GGBApplet(appletParams, "5.0", { ...views, AV: 0 });
                        ggApplet.setHTML5Codebase(
                            "https://www.geogebra.org/apps/5.0.636.0/web3d"
                        );
                        //this.ggApplet.setPreviewImage("", loadingProgress);
                        //ggApplet.inject();
                        ggApplet.inject(idParam);
                    });
            });
        }

        // window.onload = function () {
        //     var applet = new window.GGBApplet('5.0', parameters);
        //     //  when used with Math Apps Bundle, uncomment this:
        //     //applet.setHTML5Codebase('GeoGebra/HTML5/5.0/web/');
        //     console.log('applet ready', id)
        //     console.log(id);

        //     applet.inject(id);
        // }
    }, [ggbState])

    return (
        <div id={idParam}>
        </div>
    );
}

export default Applet;
