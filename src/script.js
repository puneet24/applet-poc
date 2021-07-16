import { useEffect } from "react";

const useScript = url => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = url;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [url]);
};

function WithScript({ url, children }) {
  let pos = useScript(url);
  return children(pos);
}

const appendScript = (scriptToAppend, scriptId, callback) => {
  const inClassLogger = null;
  inClassLogger &&
    inClassLogger.debug(`appendScript ${scriptToAppend} ${scriptId}`);
  let existingScript = document.getElementById(scriptId);

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = scriptToAppend; // URL for the third-party library being loaded.
    script.id = scriptId; // e.g., googleMaps or stripe
    script.async = true;
    script.onload = () => {
      inClassLogger &&
        inClassLogger.debug(
          `appendScript: Script Loaded ${scriptToAppend} ${scriptId}`
        );
      if (callback) {
        callback();
      }
    };
    script.onerror = err => {
      inClassLogger &&
        inClassLogger.error(
          `appendScript: Script Load error ${scriptToAppend} ${scriptId} - ${JSON.stringify(
            err
          )}`
        );
    };
    inClassLogger &&
      inClassLogger.debug(
        `appendScript: Load script ${scriptToAppend} ${scriptId}`
      );
    document.body.appendChild(script);
  }
  if (existingScript && callback) {
    inClassLogger &&
      inClassLogger.debug(
        `appendScript: Load existing script ${scriptToAppend} ${scriptId}`
      );
    callback();
  }
};

const appendScripts = (scriptsArray, callback) => {
  scriptsArray.forEach(script => {
    appendScript(script.url, script.id, callback);
  });
};

const removeScript = scriptId => {
  let existingScript = document.getElementById(scriptId);
  if (existingScript) {
    existingScript.parentNode.removeChild(existingScript);
  }
};

const removeScripts = scriptIdArray => {
  scriptIdArray.forEach(id => removeScript(id));
};

export {
  useScript,
  WithScript,
  appendScript,
  removeScript,
  appendScripts,
  removeScripts
};
