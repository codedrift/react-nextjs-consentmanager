import {
  ConsentManager, ConsentManagerOptions, CookieType, I18nKeys
} from '@codedrift/react-nextjs-consentmanager'
import '@codedrift/react-nextjs-consentmanager/dist/index.css'
import React from 'react'

const App = () => {
  const text = "Auf dieser Website nutzen wir Cookies und vergleichbare Funktionen um Ihnen die bestmögliche Browsing-Erfahrung zu bieten. Die Verarbeitung dient der Einbindung von Inhalten, externen Diensten und Elementen Dritter, der statistischen Analyse/Messung, personalisierten Werbung sowie der Einbindung sozialer Medien. Diese Einwilligung ist freiwillig, für die Nutzung unserer Website nicht erforderlich und kann jederzeit über das Icon rechts unten widerrufen werden."

  const title = "Einwilligung zu Cookies & Daten"

  const options: ConsentManagerOptions = {
    cookies: [{
      id: "ga",
      name: "Google Analytics",
      type: CookieType.STATISTICS
    }],
    privacyPolicyLink: "#privacy-policy",
    i18n: {
      other: {
        [I18nKeys.SETTINGS]: "Einstellungen"
      },
      buttons: {
        acceptAll: "Alle akzeptieren",
        declineAll: "Alle ablehnen",
        options: "Einstellungen"
      },
      title,
      text,
      cookieTypes: {
        [CookieType.STATISTICS]: "Statistik",
        [CookieType.ESSENTIAL]: "Essenziell",
        [CookieType.FUNCTIONAL]: "Funktional",
        [CookieType.MARKETING]: "Marketing"
      }
    }
  }
  return (
    <div>
      <ConsentManager
        options={options}
      />
    </div>
  )
}

export default App
