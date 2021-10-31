import { boundMethod } from 'autobind-decorator'
import * as React from 'react'
import Cookies from 'universal-cookie'
import './styles.css'
import { onlyUnique } from './util'
export enum CookieType {
  ESSENTIAL = 'ESSENTIAL',
  FUNCTIONAL = 'FUNCTIONAL',
  STATISTICS = 'STATISTICS',
  MARKETING = 'MARKETING'
}

export enum I18nKeys {
  SETTINGS = 'SETTINGS'
}

export type CookieInfo = {
  id: string
  name: string
  type: CookieType
}

export type ConsentManagerOptions = {
  cookies: CookieInfo[]
  privacyPolicyLink: string
  i18n: {
    title: string
    text: string
    cookieTypes: { [TKey in CookieType]: string }
    other: { [TKey in I18nKeys]: string }
    buttons: {
      acceptAll: string
      declineAll: string
      options: string
    }
  }
}

export enum View {
  MAIN = 'MAIN',
  SETTINGS = 'SETTINGS',
  HIDDEN = 'HIDDEN'
}

export type ConsentManagerProps = {
  options: ConsentManagerOptions
}

type ConsentManagerState = {
  selectedCookieTypes: string[]
  view: View
}

// needs to be a class component so nextjs always renders it client-side
export class ConsentManager extends React.Component<
  ConsentManagerProps,
  ConsentManagerState
> {
  private cookies = new Cookies()

  constructor(props: ConsentManagerProps) {
    super(props)
    this.state = {
      selectedCookieTypes: Object.keys(CookieType),
      view: View.MAIN
    }
  }

  renderButton(text: string, onClick: () => unknown) {
    return (
      <button className='rncm__button' onClick={onClick}>
        {text}
      </button>
    )
  }

  handleSelectedCookieTypeChange(type: CookieType) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked
      console.log('change!', type, checked)
      if (checked) {
        this.setState({
          selectedCookieTypes: [...this.state.selectedCookieTypes, type].filter(
            onlyUnique
          )
        })
      } else {
        this.setState({
          selectedCookieTypes: this.state.selectedCookieTypes.filter(
            (t) => t !== type
          )
        })
      }
    }
  }

  getListedCookieTypes() {
    const providedTypes = this.props.options.cookies.map((c) => c.type)

    return [CookieType.ESSENTIAL, ...providedTypes].filter(onlyUnique)
  }

  renderToggles() {
    const listedTypes = this.getListedCookieTypes()

    return (
      <div className='rncm__toggles'>
        {listedTypes.map((t) => {
          const id = `rncm_${t}`
          return (
            <div key={id} className='rncm__toggle'>
              <input
                type='checkbox'
                id={id}
                disabled={t === CookieType.ESSENTIAL}
                onChange={this.handleSelectedCookieTypeChange(t)}
                checked={this.state.selectedCookieTypes.includes(t)}
              />
              <label htmlFor={id}>
                {this.props.options.i18n.cookieTypes[t]}
              </label>
            </div>
          )
        })}
      </div>
    )
  }

  @boundMethod
  writeCookie() {
    this.cookies.set(
      'rncm_selected-types',
      JSON.stringify(this.state.selectedCookieTypes),
      {
        path: '/',
        expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365)
      }
    )
  }

  @boundMethod
  handleAcceptAll() {
    console.log('accept all')
    this.setState(
      {
        selectedCookieTypes: Object.keys(CookieType)
      },
      this.writeCookie
    )
  }

  @boundMethod
  handleDeclineAll() {
    console.log('decline all')
    this.setState(
      {
        selectedCookieTypes: [CookieType.ESSENTIAL]
      },
      this.writeCookie
    )
  }

  @boundMethod
  handleShowSettings() {
    this.setState({
      view: View.SETTINGS
    })
  }

  renderMainView() {
    const {
      i18n: {
        text,
        title,
        buttons: { declineAll, acceptAll, options }
      }
    } = this.props.options
    return (
      <div className='rncm__root'>
        <div className='rncm__title'>{title}</div>
        <div className='rncm__text'>{text}</div>
        {this.renderToggles()}
        <div className='rncm__buttons'>
          {this.renderButton(options, this.handleShowSettings)}
          {this.renderButton(declineAll, this.handleDeclineAll)}
          {this.renderButton(acceptAll, this.handleAcceptAll)}
        </div>
      </div>
    )
  }

  renderSettingsView() {
    const {
      cookies,
      i18n: { other }
    } = this.props.options
    const listedTypes = this.getListedCookieTypes()

    return (
      <div className='rncm__root'>
        <div className='rncm__title'>{other[I18nKeys.SETTINGS]}</div>
        <div className='rncm__settings-wrapper'>
          <div>
            {listedTypes.map((t) => (
              <button key={t}>{t}</button>
            ))}
          </div>
        </div>
        <ul>
          {cookies.map((c) => (
            <div key={c.id}>{c.name}</div>
          ))}
        </ul>
      </div>
    )
  }

  render() {
    const { view } = this.state

    switch (view) {
      case View.MAIN:
        return this.renderMainView()
      case View.SETTINGS:
        return this.renderSettingsView()
      default:
        return null
    }
  }
}
