<br/>
<p align="center">
<a href=" " target="_blank">
<img src="./logo.svg" width="180" alt="Dataverse logo">
</a >
</p >
<br/>

# Dataverse Hooks

## Overview

This repository contains `React` hooks for dataverse primitives, making it
easier to create your dApp logic and components.

```typescript
  // Connect user's wallet
  const { connectWallet } = useWallet();

  // Event streams
  const {
    pkh,
    createCapability,
    loadStreams,
    createPublicStream,
    createEncryptedStream,
    createPayableStream,
    monetizeStream,
    unlockStream,
    updateStream,
  } = useStream();
```

## Install

```
pnpm install @dataverse/hooks
```

You can find usage in
[dapp-examples](https://github.com/dataverse-os/dapp-examples).
