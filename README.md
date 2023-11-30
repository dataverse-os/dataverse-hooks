<br/>
<p align="center">
<a href=" " target="_blank">
<img src="https://bafybeifozdhcbbfydy2rs6vbkbbtj3wc4vjlz5zg2cnqhb2g4rm2o5ldna.ipfs.w3s.link/dataverse.svg" width="180" alt="Dataverse logo">
</a >
</p >
<br/>

# Dataverse Hooks

[![npm version](https://img.shields.io/npm/v/@dataverse/hooks.svg)](https://www.npmjs.com/package/@dataverse/hooks)
![npm](https://img.shields.io/npm/dw/@dataverse/hooks)
[![License](https://img.shields.io/npm/l/@dataverse/hooks.svg)](https://github.com/dataverse-os/hooks/blob/main/LICENSE.md)


## Overview

This repository contains `React` hooks for dataverse primitives, making it
easier to create your dApp logic and components.

## Install

```
pnpm install @dataverse/hooks
```

## Example
### import provider
```typescript
import { DataverseContextProvider } from "@dataverse/hooks";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <DataverseContextProvider>
    <App />
  </DataverseContextProvider>
);
```

### use store
```typescript
import { useStore } from "@dataverse/hooks";

const { state } = useStore();
```

### use hooks
```typescript
const { connectApp } = useApp({
  onSuccess: (result) => {
    console.log("connect app success, result:", result);
  },
});

const { createdStream: publicPost, createStream: createPublicStream } = useCreateStream({
  streamType: StreamType.Public,
  onSuccess: (result: any) => {
    console.log("create public stream success:", result);
  },
});
```

You can find more dataverse-hooks usage in
[dapp-examples](https://github.com/dataverse-os/dapp-examples).

## Documentation

View [hooks API Doc](https://dataverse-os.github.io/dataverse-hooks/index.html).