import { boundMethod } from 'autobind-decorator'
import clsx from 'clsx'
import * as React from 'react'
import { IoFingerPrintOutline } from 'react-icons/io5'
import Toggle from 'react-toggle'
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
  SETTINGS = 'SETTINGS',
  BACK = 'BACK',
  ON = 'ON',
  OFF = 'OFF',
  ESSENTIAL = 'ESSENTIAL',
  FUNCTIONAL = 'FUNCTIONAL',
  STATISTICS = 'STATISTICS',
  MARKETING = 'MARKETING',
  ACCEPT_ALL = 'ACCEPT_ALL',
  SAVE = 'SAVE',
  MAIN_TITLE = 'MAIN_TITLE',
  MAIN_TEXT = 'MAIN_TEXT',
  SETTINGS_TEXT = 'SETTINGS_TEXT'
}

export type CookieInfo = {
  id: string
  name: string
  type: CookieType
  reason: string
  provider: string
  privacyPolicyLink: string
}

export type I18NTranslations = { [TKey in I18nKeys]: string }

export type ConsentManagerOptions = {
  cookies: CookieInfo[]
  privacyPolicyLink: string
  impressLink: string
  i18n: I18NTranslations
}

export enum View {
  MAIN = 'MAIN',
  SETTINGS = 'SETTINGS',
  HIDDEN = 'HIDDEN'
}

export type ConsentManagerProps = {
  options: ConsentManagerOptions
  onChange: (enabledCookies: string[]) => unknown
}

type ConsentManagerState = {
  enabledCookieTypes: string[]
  view: View
  enabledCookies: string[]
}

const COOKIE_NAME = 'rncm_consent'

type ConsentData = {
  enabledCookies: string[]
  enabledCookieTypes: string[]
  availableCookies: string[]
}

const SettingRow: React.FC<{
  cookie: CookieInfo
  enabled: boolean
  i18n: I18NTranslations
  onToggle: (e: React.ChangeEvent<HTMLInputElement>) => unknown
}> = ({
  cookie: { name, privacyPolicyLink, reason, type, provider },
  onToggle,
  i18n,
  enabled
}) => {
  return (
    <div className='rncm__setting-row'>
      <div className='rncm__setting-row-header'>
        <div className='rncm__setting-row-title'>
          <h4>{name}</h4>
          <h5>{provider}</h5>
        </div>
        <div className='rncm__setting-row-state'>
          {enabled ? i18n[I18nKeys.ON] : i18n[I18nKeys.OFF]}
        </div>
        <div className='rncm__setting-row-toggle'>
          <Toggle
            disabled={type === CookieType.ESSENTIAL}
            checked={enabled}
            onChange={onToggle}
          />
        </div>
      </div>
      <p>{reason}</p>
      <a href={privacyPolicyLink} target='_blank' rel='noreferrer noopener'>
        Datenschutzerklärung
      </a>
    </div>
  )
}

type ButtonProps = {
  onClick: () => unknown
  link?: boolean
  cta?: boolean
  outline?: boolean
  children: React.ReactNode
}

const Button = ({ onClick, children, link, cta, outline }: ButtonProps) => {
  return (
    <button
      className={clsx('rncm__button', {
        'rncm__button-link': link,
        'rncm__button-outline': outline,
        'rncm__button-cta': cta
      })}
      onClick={onClick}
    >
      {children}
    </button>
  )
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
      enabledCookieTypes: Object.keys(CookieType),
      view: View.HIDDEN,
      enabledCookies: props.options.cookies.map((c) => c.id)
    }
  }

  componentDidMount() {
    const data = this.readCookie()
    if (!data) {
      this.setState({
        view: View.MAIN
      })
    } else {
      const currentAvailable = JSON.stringify(this.getAvailableCookies())
      const consentedAvailable = JSON.stringify(data.availableCookies)
      this.setState(
        {
          enabledCookies: data.enabledCookies || [],
          enabledCookieTypes: data.enabledCookieTypes || [CookieType.ESSENTIAL]
        },
        this.notifyConsentState
      )
      // cookie config changed. show main screen
      if (currentAvailable !== consentedAvailable) {
        this.setState({
          view: View.MAIN
        })
      }
    }
  }

  toggleCookieType(type: CookieType) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked
      if (checked) {
        this.setState(
          {
            enabledCookieTypes: [...this.state.enabledCookieTypes, type].filter(
              onlyUnique
            )
          },
          this.setEnabledCookiesByCookieTypes
        )
      } else {
        this.setState(
          {
            enabledCookieTypes: this.state.enabledCookieTypes.filter(
              (t) => t !== type
            )
          },
          this.setEnabledCookiesByCookieTypes
        )
      }
    }
  }

  notifyConsentState() {
    this.props.onChange(this.state.enabledCookies)
  }

  getAvailableCookies() {
    return this.props.options.cookies.map((c) => c.id)
  }

  getListedCookieTypes() {
    const providedTypes = this.props.options.cookies.map((c) => c.type)

    return [CookieType.ESSENTIAL, ...providedTypes].filter(onlyUnique)
  }

  readCookie(): ConsentData | null {
    const cookie = this.cookies.get(COOKIE_NAME)
    return cookie || null
  }

  @boundMethod
  persistState() {
    const data: ConsentData = {
      enabledCookies: this.state.enabledCookies,
      availableCookies: this.props.options.cookies.map((c) => c.id),
      enabledCookieTypes: this.state.enabledCookieTypes
    }
    this.cookies.set(COOKIE_NAME, JSON.stringify(data), {
      path: '/',
      expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365)
    })
    this.props.onChange(this.state.enabledCookies)
  }

  @boundMethod
  handleAcceptAll() {
    this.setState(
      {
        enabledCookieTypes: Object.keys(CookieType),
        enabledCookies: this.getAvailableCookies(),
        view: View.HIDDEN
      },
      this.persistState
    )
  }

  @boundMethod
  handleSave() {
    this.persistState()
    this.setState({
      view: View.HIDDEN
    })
  }

  @boundMethod
  handleShowSettings() {
    this.setState({
      view: View.SETTINGS
    })
  }

  @boundMethod
  handleShowMain() {
    this.setState({
      view: View.MAIN
    })
  }

  @boundMethod
  setCookieTypesByEnabledCookies() {
    this.setState({
      enabledCookieTypes: [
        CookieType.ESSENTIAL,
        ...this.props.options.cookies
          .filter((c) => this.state.enabledCookies.includes(c.id))
          .map((c) => c.type)
      ].filter(onlyUnique)
    })
  }

  @boundMethod
  setEnabledCookiesByCookieTypes() {
    this.setState({
      enabledCookies: [
        ...this.state.enabledCookies,
        ...this.props.options.cookies
          .filter((c) => this.state.enabledCookieTypes.includes(c.type))
          .map((c) => c.id)
      ].filter(onlyUnique)
    })
  }

  @boundMethod
  toggleCookie(cookie: CookieInfo) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked
      if (checked) {
        this.setState(
          {
            enabledCookies: [...this.state.enabledCookies, cookie.id]
          },
          this.setCookieTypesByEnabledCookies
        )
      } else {
        this.setState(
          {
            enabledCookies: this.state.enabledCookies.filter(
              (c) => c !== cookie.id
            )
          },
          this.setCookieTypesByEnabledCookies
        )
      }
    }
  }

  renderButton(text: string, onClick: () => unknown) {
    return (
      <button className='rncm__button' onClick={onClick}>
        {text}
      </button>
    )
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
                onChange={this.toggleCookieType(t)}
                checked={this.state.enabledCookieTypes.includes(t)}
              />
              <label htmlFor={id}>{this.props.options.i18n[t]}</label>
            </div>
          )
        })}
      </div>
    )
  }

  renderBottomLinks() {
    const { privacyPolicyLink, impressLink } = this.props.options
    return (
      <div className='rncm__bottom_links'>
        <a href={privacyPolicyLink} target='_blank' rel='noreferrer noopener'>
          Datenschutzerklärung
        </a>
        <span>|</span>
        <a href={impressLink} target='_blank' rel='noreferrer noopener'>
          Impressum
        </a>
      </div>
    )
  }

  renderButtons() {
    const { i18n } = this.props.options
    return (
      <div className='rncm__buttons'>
        <Button link onClick={this.handleShowSettings}>
          {i18n[I18nKeys.SETTINGS]}
        </Button>
        <Button outline onClick={this.handleSave}>
          {i18n[I18nKeys.SAVE]}
        </Button>
        <Button cta onClick={this.handleAcceptAll}>
          {i18n[I18nKeys.ACCEPT_ALL]}
        </Button>
      </div>
    )
  }

  renderMainView() {
    const { i18n } = this.props.options
    return (
      <div className='rncm__root rncm__root-card'>
        <div className='rncm__title'>
          <span className='rncm__cookie' role='img' aria-label='cookie'>
            &#127850;
          </span>
          {i18n[I18nKeys.MAIN_TITLE]}
        </div>
        <div className='rncm__text'>{i18n[I18nKeys.MAIN_TEXT]}</div>
        {this.renderToggles()}
        {this.renderButtons()}
        {this.renderBottomLinks()}
      </div>
    )
  }

  renderHiddenView() {
    return (
      <div
        className='rncm__root rncm__root-hidden'
        onClick={this.handleShowMain}
      >
        <IoFingerPrintOutline />
      </div>
    )
  }

  renderSettingsView() {
    const { cookies, i18n } = this.props.options
    const listedTypes = this.getListedCookieTypes()

    return (
      <div className='rncm__root rncm__root-card'>
        <div className='rncm__title'>
          <span className='rncm__cookie' role='img' aria-label='cookie'>
            &#127850;
          </span>
          {i18n[I18nKeys.SETTINGS]}
        </div>
        <div className='rncm__text'>{i18n[I18nKeys.SETTINGS_TEXT]}</div>
        <div className='rncm__settings-list'>
          {listedTypes.map((t) => (
            <div className='rncm__settings-section' key={t}>
              <h3>{this.props.options.i18n[t]}</h3>
              {cookies
                .filter((c) => c.type === t)
                .map((c) => (
                  <SettingRow
                    key={c.id}
                    cookie={c}
                    i18n={i18n}
                    onToggle={this.toggleCookie(c)}
                    enabled={this.state.enabledCookies.includes(c.id)}
                  />
                ))}
            </div>
          ))}
        </div>
        <div className='rncm__buttons'>
          <Button outline onClick={this.handleShowMain}>
            {i18n[I18nKeys.BACK]}
          </Button>
          <Button outline onClick={this.handleSave}>
            {i18n[I18nKeys.SAVE]}
          </Button>
          <Button cta onClick={this.handleAcceptAll}>
            {i18n[I18nKeys.ACCEPT_ALL]}
          </Button>
        </div>
        {this.renderBottomLinks()}
      </div>
    )
  }

  renderConsentManager() {
    const { view } = this.state
    // console.log(this.state)
    switch (view) {
      case View.MAIN:
        return this.renderMainView()
      case View.SETTINGS:
        return this.renderSettingsView()
      case View.HIDDEN:
      default:
        return this.renderHiddenView()
    }
  }

  render() {
    return <div className='rncm__wrapper'>{this.renderConsentManager()}</div>
  }
}
