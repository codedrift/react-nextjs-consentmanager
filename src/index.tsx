import * as React from 'react'

export type ConsentManagerOptions = {
  id: string
  ab?: string
  host?: string
  cdn?: string
}

export type ConsentManagerProps = {
  options: ConsentManagerOptions
}

export class ConsentManager extends React.Component<ConsentManagerProps> {
  private scriptUrl =
    'https://cdn.consentmanager.net/delivery/js/automatic.min.js'
  componentDidMount() {
    const cmpId = this.props.options.id
    console.log('Loading consent manager', cmpId)
    const elementId = `cmp_script_${cmpId}`
    const existing = document.getElementById('elementId')
    if (!existing) {
      const script = document.createElement('script')
      script.src = this.scriptUrl
      script.async = true
      script.type = 'text/javascript'
      script.id = elementId
      script.setAttribute('data-cmp-ab', '1')
      script.setAttribute('data-cmp-id', cmpId)
      script.setAttribute('data-cmp-host', 'a.delivery.consentmanager.net')
      script.setAttribute('data-cmp-cdn', 'cdn.consentmanager.net')
      console.log('Appending consent manager to body', cmpId)
      document.body.appendChild(script)
    }
  }

  render() {
    return null
  }
}
{
  /* <div id="cmpcookieinfo"></div><script src="" type="text/javascript" async></script> */
}

export type ConsentCookieInfoOptions = {
  id: string
}

export type ConsentCookieInfoProps = {
  options: ConsentCookieInfoOptions
}

export class ConsentCookieInfo extends React.Component<ConsentCookieInfoProps> {
  private data: any | null = null

  private getScriptUrl(id: string) {
    return `https://delivery.consentmanager.net/delivery/cookieinfo.php?id=${id}&api=json`
  }

  private async fetchInfo() {
    try {
      const res = await fetch(this.getScriptUrl(this.props.options.id))
      const json = await res.json();
      console.log('cookie info res', json)
      this.data = json
    } catch (error) {
      console.error('Error loading cookie consent info', error)
      this.data = "Cookie consent information could not be loaded"
    }
  }

  componentDidMount() {
    this.fetchInfo()
  }

  render() {
    console.log('ConsentCookieInfo', this.data)
    return (
      <div>
        <pre>{JSON.stringify(this.data)}</pre>
      </div>
    )
  }
}
