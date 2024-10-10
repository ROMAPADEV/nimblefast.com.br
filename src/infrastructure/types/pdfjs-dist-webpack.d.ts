/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const workerSrc: any
  export default workerSrc
}

declare module 'pdfjs-dist/webpack.mjs' {
  export = pdfjs
}
