import logo from './logo.svg';
import './App.css';
import Applet from './Applet'
import { useState, useEffect } from 'react';
import fileCache from "./cache";

function App() {

  const [ggbCacheManager, setGgbCacheManager] = useState(null);

  useEffect(() => {
    fileCache().then(res => setGgbCacheManager(res));
  }, []);

  return (
    <div className="App">
      { ggbCacheManager && <Applet id="ggb1" cacheManager={ggbCacheManager}></Applet>}
    </div>
  );
}

export default App;
