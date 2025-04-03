import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { Render } from './render'
import { Canvas } from './canvas'
// import Sine from './client/sine'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Render />
    {/* <Canvas/> */}
    {/* <Sine /> */}
  </StrictMode>,
)





