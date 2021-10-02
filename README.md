# react-nextjs-consentmanager

> Library to load www.consentmanager.de in nextjs

[![NPM](https://img.shields.io/npm/v/react-nextjs-consentmanager.svg)](https://www.npmjs.com/package/react-nextjs-consentmanager) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @codedrift/react-nextjs-consentmanager
```

## Usage

```tsx
import React, { Component } from 'react'
import {
  ConsentManager,
  ConsentManagerDeOptions
} from '@codedrift/react-nextjs-consentmanager'
import '@codedrift/react-nextjs-consentmanager/dist/index.css'
import React from 'react'

class Example extends Component {
  render() {
  const options: ConsentManagerDeOptions = {
    id: '<your-cmp-id>'
  }
  return <ConsentManager options={options} />
  }
}
```

## License

MIT © [codedrift](https://github.com/codedrift)
