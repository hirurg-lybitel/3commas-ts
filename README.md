# 3Commas-ts

3Commas API provider with Typescript

Offical soucre documentation [here](https://github.com/3commas-io/3commas-official-api-docs#readme).

## Install
```bash
npm install 3commas-ts
```

```bash
yarn add 3commas-ts
```

```bash
pnpm add 3commas-ts
```

## Usage
```js
import { API } from '3commas-ts';

const GET = async () => {    
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;

  const api = new API({
    apiKeyType: 'selfGenerated',
    key: apiKey,
    secrets: apiSecret, 
    forcedMode: 'paper'
  });
    
  try {
    const response = await api.getSmartTradeHistory({ per_page: 10, status: 'active' });

    return Response.json(response);
  } catch (error: any) {
    console.error(error);
    return Response.json(error.message, { status: 500 });
  }
};
```
3Commas offers two different approaches to generation API keys:
- System-generated pair (api key + secret)
- Self-generated rsa pair (api-key + public key + private key)

The first one is created automatically.
For latter you need to use, for example, official [binance key generator](https://github.com/binance/asymmetric-key-generator/releases).
More information for this case [here](https://github.com/3commas-io/3commas-official-api-docs/blob/master/signed_endpoints_rsa.md).

Also you can get more understanding of these approaches using the [3commas signature calculator](https://3commas-io.github.io/public-api-signature-calculator-example/).

## Custom Request
```ts
customRequest(method: string, version: number, path: string, payload?: any)
```

## Websocket
```ts
subscribeSmartTrade(callback?: (data: WebSocket.Data) => void)

subscribeDeal(callback?: (data: WebSocket.Data) => void)

unsubscribe()
```
