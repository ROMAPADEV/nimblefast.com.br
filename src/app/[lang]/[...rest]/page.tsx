'use client'

import { redirect } from 'src/navigation'

// CATCH ALL UNKNOWN ROUTES AND REDIRECT USER TO THE AUTH PAGE
export default function CatchAllPage() {
  redirect('/')
}
