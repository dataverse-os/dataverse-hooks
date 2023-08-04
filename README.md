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
