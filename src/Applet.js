// import logo from './logo.svg';
// import './App.css';

import { useEffect, useState } from 'react';
import { appendScript } from './script';
import { AppletbatchProcessor } from './batchProcessor/index';
import { socketManager } from './socket/socket-manager';

const ggParams = {
    appName: "classic",
    id: "applet",
    borderColor: "#cccccc",
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
        if (xml)
            globalApi.evalXML(xml);
        if (updateConstruction)
            globalApi.evalCommand("UpdateConstruction()");
    }
};

function Applet({ id, cacheManager }) {
    const [socketInstance, setSocketInstance] = useState(null);
    const [appletInitData, setAppletInitData] = useState({});
    const [ggbState, setGgbState] = useState(false);
    const idParam = window.location.search.replace('?', '').split('&').filter(_ => _.indexOf('id=') != -1)[0].split('id=')[1];
    const filename = window.location.search.replace('?', '').split('&').filter(_ => _.indexOf('url=') != -1)[0].split('url=')[1];

    const initSocketService = ({ roomId, studentId, teacherId, socketToken, mode }) => {

        const uid = mode === 'teacher' ? teacherId : studentId;
        let socketInstance = socketManager({ uid, roomId, socketToken });
        AppletbatchProcessor.init({ socketInstance: socketInstance });
        setSocketInstance(socketInstance);

        const unsubscribeSocketMessage = socketInstance.onMessage(data => {
            console.log(data);
            if (data && data.type) {
                switch (data.type) {
                    case "GET_LATEST_XML":
                        this.state.socketInstance.send({
                            type: "LATEST_XML",
                            state: { latestXml: this.getBase64Applet() }
                        });
                        break;
                    case "LATEST_XML":
                        this.setBase64Applet(data.state.latestXml);
                        break;
                    case "COMMAND":
                        window.collab = false;
                        const batchEvents = data.state;
                        for (let i = 0; i < batchEvents.length; i++) {
                            window.evalXML(batchEvents[i].xml)
                        }
                        window.collab = true;
                }
            }
        });

    };

    useEffect(() => {
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
            //window.collab = false;
            if (eventJsonData.msg && eventJsonData.msg.type === 'init') {
                initSocketService({ ...eventJsonData.msg });
            }
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
                        AppletbatchProcessor.processMessage({
                            msg: {
                                state: {
                                    listener: 'UPDATE_LISTENER',
                                    xml: api.getXML(label),
                                    mode: appletInitData.mode
                                }
                            }
                        });
                    }

                    function removeListener(objName) {
                    }

                    function renameListener(oldObjName, newObjName) {
                    }

                    function updateListener(objName) {
                        if (!window.collab) return;
                        let strVal = api.getValueString(objName);
                        AppletbatchProcessor.processMessage({
                            msg: {
                                state: {
                                    listener: 'UPDATE_LISTENER',
                                    xml: api.getXML(objName),
                                    mode: appletInitData.mode
                                }
                            }
                        });

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
            window.parent.postMessage(
                JSON.stringify({
                    id: "ggb1",
                    msg: {
                        type: 'iframe-loaded'
                    }
                }),
                "*"
            );
        }

    }, [ggbState])

    return (
        <div id={idParam}>
        </div>
    );
}

export default Applet;
