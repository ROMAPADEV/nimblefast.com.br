/* eslint-disable no-use-before-define */
// global.d.ts ou no topo do arquivo `ManualAddressModal.tsx`

interface SpeechRecognitionConstructor {
  // eslint-disable-next-line no-use-before-define
  new (): SpeechRecognition
}

interface SpeechRecognition {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  // eslint-disable-next-line no-use-before-define
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  // eslint-disable-next-line no-use-before-define
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onstart: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionEvent {
  // eslint-disable-next-line no-use-before-define
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  // eslint-disable-next-line no-use-before-define
  item(index: number): SpeechRecognitionResult
  // eslint-disable-next-line no-use-before-define
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

declare global {
  interface Window {
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}
