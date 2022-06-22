# Three USDZ Loader

This is a demo project showing how to load a USDZ file with ThreeJS (Pixar Universal Scene Description) in a Vue/Vuetify/Typescript application. For more information about which kind of USDZ you may load please take a look at the **loader package** [three-usdz-loader]**(https://www.npmjs.com/package/three-usdz-loader) which is used in this demo project

## Demo
This repository build is published to [usdz-viewer.net](https://www.usdz-viewer.net)

## How to use
Install the dependencies
```
npm install
```

Copy the WebAssembly dependencies to your public folder
```
npm run copydeps
```

Run the development server
```
npm run serve
```

## How to publish
Build the app
```
npm run build
```
Make sure you enabled the headers required to use SharedArrayBuffer
```
headers: {
"Cross-Origin-Embedder-Policy": "require-corp",
"Cross-Origin-Opener-Policy": "same-origin",
},
```