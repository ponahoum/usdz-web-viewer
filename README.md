# Three.js + USDZ Loader

This is a demo project showing how to load a **USDZ file** with **Three.JS** (Pixar Universal Scene Description) in a 100% frontend based application.
For more information about the USDZ loader please take a look at the original **loader package** [three-usdz-loader](https://www.npmjs.com/package/three-usdz-loader).

## Features
- 100% frontend (no backend or GLTF converter of some sort)
- Uses ThreeJS + Vue + Vuetify + Typescript
- Passing USDZ file as URL (https://url.endpoint/?url=<someUrlEncodedUrl>)

## Demo
The original repository build is published to [usdz-viewer.net](https://www.usdz-viewer.net)

## How to use
Clone the repository
```
git clone [https://github.com/ponahoum/usdz-web-viewer.git](https://github.com/anomaloushuman/USDZ-xPlat-Viewer)
cd .\USDZ-xPlat-Viewer\
```

Install Vue Cli and the dependencies
```
npm install -g @vue/cli
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
