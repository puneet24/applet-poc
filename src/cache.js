// //all functions return a promise
// const fileCache = () => {
//   //basic passthrough object
//   //File caching for GGB Files
//   const cacheName = "whjrMathGGBCache";
//   let setAllCache = true;

//   //a simple promise wrapper that resolves to the passed value;
//   const urlPromise = url => new Promise((resolve, reject) => resolve(url));
//   const emptyPromise = () => new Promise((resolve, reject) => resolve());
//   let that = {};
//   that.isCacheSupported = "caches" in window;
//   that.get = url => urlPromise(url);
//   that.clear = () => emptyPromise();
//   that.contains = url => new Promise((resolve, reject) => resolve(false));
//   that.set = url => emptyPromise();
//   that.delete = url => emptyPromise();
//   that.setAll = urls => emptyPromise();
//   that.setUrlWithData = (url, response) => urlPromise(url);

//   return new Promise((resolve, reject) => {
//     if ("caches" in window) {
//       // The Cache API is supported
//       caches.delete(cacheName).then(() => {
//         caches.open(cacheName).then(cache => {
//           that.get = url => {
//             return new Promise((resolve, reject) => {
//               console.log("sel all cache is", setAllCache);
//               if (!setAllCache) resolve(url);
//               cache
//                 .match(url, { ignoreSearch: true })
//                 .then(response => {
//                   console.log(response);
//                   if (!response) return null;
//                   return response.blob();
//                 })
//                 .then(res => {
//                   console.log("res all cache is", res);
//                   if (res) {
//                     resolve(URL.createObjectURL(res));
//                   } else {
//                     resolve(url);
//                   }
//                   // if (response) resolve(URL.createObjectURL());
//                 })
//                 .catch(err => console.log(err));
//             });
//           };
//           that.setUrlWithData = (url, response) => cache.put(url, response);
//           that.set = url => cache.add(url);
//           that.delete = url => cache.delete(url);
//           that.setAll = urls =>
//             Promise.all(
//               urls.map(url => {
//                 // return cache.add(url).catch(err => {
//                 //   console.log(err);
//                 // });
//                 return fetch(url)
//                   .then(function(response) {
//                     if (!response.ok) {
//                       throw new TypeError("bad response status");
//                     }
//                     console.log("response is ", response);
//                     return cache.put(url, response);
//                   })
//                   .catch(err => console.log(err));
//               })
//             )
//               .then(values => {
//                 setAllCache = true;
//                 console.log("values is", values);
//               })
//               .catch(err => console.log(err));
//           that.clear = () => caches.delete(cacheName);
//           resolve(that);
//         });
//       });
//     } else {
//       resolve(that); //return the default object
//     }
//   });
// };

// export default fileCache;

//all functions return a promise
const fileCache = () => {
    console.log(`cache very start`);
    //basic passthrough object
    //File caching for GGB Files
    const cacheName = "whjrMathGGBCache";
    let setAllCache = true;
  
    //a simple promise wrapper that resolves to the passed value;
    const urlPromise = url => new Promise((resolve, reject) => resolve(url));
    const emptyPromise = () => new Promise((resolve, reject) => resolve());
    let that = {};
    that.isCacheSupported = "caches" in window;
    that.get = url => urlPromise(url);
    that.clear = () => emptyPromise();
    that.contains = url => new Promise((resolve, reject) => resolve(false));
    that.set = url => emptyPromise();
    that.delete = url => emptyPromise();
    that.setAll = urls => emptyPromise();
    console.log(`check in cache file staart`);
    return new Promise((resolve, reject) => {
        console.log(`checkin cache file`, window.caches);
      if (false) {
        // The Cache API is supported
        window.caches.delete(cacheName).then(() => {
            window.caches.open(cacheName).then(cache => {
            that.get = url => {
              return new Promise((resolve, reject) => {
                if (!setAllCache) resolve(url);
                cache
                  .match(url, { ignoreSearch: true })
                  .then(response => {
                    if (!response) return null;
                    return response.blob();
                  })
                  .then(res => {
                    if (res) {
                      resolve(URL.createObjectURL(res));
                    } else {
                      resolve(url);
                    }
                    // if (response) resolve(URL.createObjectURL());
                  })
                  .catch(err => console.log(err));
              });
            };
            that.setUrlWithData = (url, response) => cache.put(url, response);
            that.set = url => cache.add(url);
            that.delete = url => cache.delete(url);
            that.setAll = urls =>
              cache
                .addAll(urls)
                .then(res => {})
                .catch(err => console.log(err));
            that.clear = () => window.delete(cacheName);
            resolve(that);
          });
        })
        .catch(err => {
            console.error(`catched cache delete`, err);
        })
      } else {
        resolve(that); //return the default object
      }
    });
  };
  
  export default fileCache;
  