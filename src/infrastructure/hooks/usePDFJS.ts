/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as PDFJS from 'pdfjs-dist/types/src/pdf'
import { useEffect, useState } from 'react'

export const usePDFJS = (
  onLoad: (pdfjs: typeof PDFJS) => Promise<void>,
  deps: any[] = [],
) => {
  const [pdfjs, setPDFJS] = useState<typeof PDFJS | null>(null)

  useEffect(() => {
    import('pdfjs-dist/webpack.mjs').then((module) => setPDFJS(module))
  }, [])

  useEffect(() => {
    if (!pdfjs) return
    ;(async () => await onLoad(pdfjs))()
  }, [pdfjs, ...deps])
}
