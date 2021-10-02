import {
  ConsentCookieInfo,
  ConsentManager
} from '@codedrift/react-nextjs-consentmanager'
import '@codedrift/react-nextjs-consentmanager/dist/index.css'
import React from 'react'

const App = () => {
  const id = process.env.REACT_APP_CMP_ID || "your id here"
  return (
    <div>
      <ConsentCookieInfo options={{ id }} />
      <ConsentManager
        options={{
          id
        }}
      />
    </div>
  )
}

export default App
