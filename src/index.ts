import Axios, { AxiosError, AxiosInstance } from 'axios';
import qs from 'qs';
import WebSocket from 'ws';
import {
  APIOptions,
  BotOptionalParams,
  BotsParams,
  BotsStatsParams,
  Channel,
  CurrencyParams,
  DealsParams,
  FundParams,
  MarketCurrencyParams,
  SmartTradeHistoryParams,
  SmartTradeParams,
  ThreeCommasError,
  TransferHistoryParams,
  TransferParams,
  WebsocketCallback,
  Convert,
  Order,
  ApiKeyType,
} from './types';
import { getSignature } from './lib/crypto';

const ENDPOINT = 'https://api.3commas.io';
const V1 = '/public/api/ver1';
const V2 = '/public/api/v2';
const WS = 'wss://ws.3commas.io/websocket';

export class API {
  private readonly KEY_TYPE: ApiKeyType;
  private readonly KEY: string;
  private readonly SECRETS: string;
  private readonly errorHandler?: (
    response: ThreeCommasError,
    reject: (reason?: any) => void,
  ) => void | Promise<any>;
  private axios: AxiosInstance;
  private ws?: WebSocket;

  constructor(options?: APIOptions) {
    this.KEY = options?.key ?? '';
    this.KEY_TYPE = options?.apiKeyType ?? 'systemGenerated';
    this.SECRETS = options?.secrets ?? '';
    this.errorHandler = options?.errorHandler;
    this.axios = Axios.create({
      baseURL: ENDPOINT,
      timeout: options?.timeout ?? 30000,
      headers: {
        APIKEY: this.KEY,
        ...(options?.forcedMode && { 'Forced-Mode': options?.forcedMode }),
      },
    });
    this.axios.interceptors.request.use(
      (config) => {
        let payload = JSON.stringify(config.data) ?? '';

        if (config.method === 'get') {
          payload = qs.stringify(config.params);
          config.data = null;
        }

        const relativeUrl = config.url!.replace(config.baseURL!, '');
        const signature = this.SECRETS
          ? getSignature({
              apiKeyType: this.KEY_TYPE,
              payload: `${relativeUrl}?${payload}`,
              secret: this.SECRETS,
            })
          : '';

        const headers: any = {
          ...config.headers,
          signature,
        };
        const newConfig = {
          ...config,
          headers,
        };

        return newConfig;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  private request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    version: 1 | 2,
    path: string,
    payload?: any,
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.axios({
          method,
          url: `${ENDPOINT}${version === 1 ? V1 : V2}${path}`,
          params: method === 'GET' ? payload : undefined,
          data: method !== 'GET' ? payload : undefined,
        });
        resolve(data);
      } catch (e) {
        const error = e as AxiosError<ThreeCommasError>;
        if (error.response?.data && this.errorHandler) {
          await this.errorHandler(error.response.data, reject);
        }
        reject(error.response?.data ?? error);
      }
    });
  }

  async ping() {
    return await this.request('GET', 1, '/ping');
  }

  async time() {
    return await this.request('GET', 1, '/time');
  }

  async transfer(params: TransferParams) {
    return await this.request('POST', 1, '/accounts/transfer', params);
  }

  async getTransferHistory<T>(params: TransferHistoryParams) {
    return await this.request<T>('GET', 1, '/accounts/transfer_history', params);
  }

  async getTransferData<T>() {
    return await this.request<T>('GET', 1, '/accounts/transfer_data');
  }

  async addExchangeAccount<T>(params: any) {
    return await this.request<T>('POST', 1, '/accounts/new', params);
  }

  async editExchangeAccount<T>(params: any) {
    return await this.request<T>('POST', 1, '/accounts/update', params);
  }

  async getExchange<T>() {
    return await this.request<T>('GET', 1, '/accounts');
  }

  async getMarketList<T>() {
    return await this.request<T>('GET', 1, '/accounts/market_list');
  }

  async getMarketPairs<T>(params?: any) {
    return await this.request<T>('GET', 1, '/accounts/market_pairs', params);
  }

  async getCurrencyRate<T>(params: CurrencyParams) {
    return await this.request<T>('GET', 1, '/accounts/currency_rates', params);
  }

  async getCurrencyRateWithLeverageData<T>(params: MarketCurrencyParams) {
    return await this.request<T>(
      'GET',
      1,
      '/accounts/currency_rates_with_leverage_data',
      params,
    );
  }

  async getActiveTradeEntities<T>(account_id: number | string) {
    return await this.request<T>(
      'GET',
      1,
      `/accounts/${account_id}/active_trading_entities`,
    );
  }

  async sellAllToUSD<T>(account_id: number | string) {
    return await this.request<T>(
      'POST',
      1,
      `/accounts/${account_id}/sell_all_to_usd`,
    );
  }

  async sellAllToBTC<T>(account_id: number | string) {
    return await this.request<T>(
      'POST',
      1,
      `/accounts/${account_id}/sell_all_to_btc`,
    );
  }

  async getBalanceChartData<T>(account_id: number | string, params: any) {
    return await this.request<T>(
      'GET',
      1,
      `/accounts/${account_id}/balance_chart_data`,
      params,
    );
  }

  async loadBalances<T>(account_id: number | string) {
    return await this.request<T>(
      'POST',
      1,
      `/accounts/${account_id}/load_balances`,
    );
  }

  async renameExchangeAccount<T>(account_id: number | string, name: string) {
    return await this.request<T>('POST', 1, `/accounts/${account_id}/rename`, {
      name,
    });
  }

  async removeExchangeAccount<T>(account_id: number | string) {
    return await this.request<T>('POST', 1, `/accounts/${account_id}/remove`);
  }

  async getPieChartData<T>(account_id: number | string) {
    return await this.request<T>(
      'POST',
      1,
      `/accounts/${account_id}/pie_chart_data`,
    );
  }

  async getAccountTableData<T>(account_id: number | string) {
    return await this.request<T>(
      'POST',
      1,
      `/accounts/${account_id}/account_table_data`,
    );
  }

  async getAccountInfo<T>(account_id?: number) {
    return await this.request<T>('GET', 1, `/accounts/${account_id ?? 'summary'}`);
  }

  async getLeverageData<T>(account_id: number | string, pair: string) {
    return await this.request<T>(
      'GET',
      1,
      `/accounts/${account_id}/leverage_data`,
      { pair },
    );
  }

  async changeUserMode<T>(mode: 'paper' | 'real') {
    return await this.request<T>('POST', 1, '/users/change_mode', { mode });
  }

  async getSmartTradeHistory<T = Order[]>(
    params?: SmartTradeHistoryParams,
  ){
    return await this.request<T>('GET', 2, '/smart_trades', params);
  }

  async smartTrade<T = Order>(params: SmartTradeParams) {
    return await this.request<T>('POST', 2, '/smart_trades', params);
  }

  async getSmartTrade<T = Order>(id: number) {
    return await this.request<T>('GET', 2, `/smart_trades/${id}`);
  }

  async cancelSmartTrade<T = Order>(id: number) {
    return await this.request<T>('DELETE', 2, `/smart_trades/${id}`);
  }

  async updateSmartTrade<T = Order>(id: number, params: any) {
    return await this.request<T>('PATCH', 2, `/smart_trades/${id}`, params);
  }

  async averageSmartTrade<T = Order>(id: number, params: FundParams) {
    return await this.request(
      'POST',
      2,
      `/smart_trades/${id}/add_funds`,
      params,
    );
  }

  async reduceFund<T = Order>(id: number, params: FundParams) {
    return await this.request<T>(
      'POST',
      2,
      `/smart_trades/${id}/reduce_funds`,
      params,
    );
  }

  async closeSmartTrade<T = Order>(id: number) {
    return await this.request<T>('POST', 2, `/smart_trades/${id}/close_by_market`);
  }

  async forceStartSmartTrade<T = Order>(id: number) {
    return await this.request<T>('POST', 2, `/smart_trades/${id}/force_start`);
  }

  async forceProcessSmartTrade<T = Order>(id: number) {
    return await this.request<T>('POST', 2, `/smart_trades/${id}/force_process`);
  }

  async setNoteSmartTrade<T = Order>(id: number, note: string) {
    return await this.request<T>('POST', 2, `/smart_trades/${id}/set_note`, {
      note,
    });
  }

  /**
   * Get the sub trades of a smart trade, including entry and take profit orders.
   *
   * @param id smart trade id
   * @returns SmartTrade Order
   */
  async getSubTrade<T>(id: number) {
    return await this.request<T>('GET', 2, `/smart_trades/${id}/trades`);
  }

  async closeSubTrade<T>(smartTradeId: number, subTradeId: number) {
    return await this.request<T>(
      'POST',
      2,
      `/smart_trades/${smartTradeId}/trades/${subTradeId}/close_by_market`,
    );
  }

  async cancelSubTrade<T>(smartTradeId: number, subTradeId: number) {
    return await this.request<T>(
      'DELETE',
      2,
      `/smart_trades/${smartTradeId}/trades/${subTradeId}`,
    );
  }

  async getBots<T>(
    params: BotsParams = {
      limit: 50,
      sort_by: 'created_at',
      sort_direction: 'desc',
    },
  ) {
    return await this.request<T>('GET', 1, '/bots', params);
  }

  async getBotsStats<T>(params?: BotsStatsParams) {
    return await this.request<T>('GET', 1, '/bots/stats', params);
  }

  async getBot<T>(id: number, options?: BotOptionalParams) {
    return await this.request<T>('GET', 1, `/bots/${id}/show`, options);
  }

  async getDeals<T>(
    params: DealsParams = {
      limit: 50,
      order: 'created_at',
      order_direction: 'desc',
    },
  ) {
    return await this.request<T>('GET', 1, '/deals', params);
  }

  async getDeal<T>(id: number) {
    return await this.request<T>('GET', 1, `/deals/${id}/show`);
  }

  async getDealSafetyOrders<T>(id: number) {
    return await this.request<T>('GET', 1, `/deals/${id}/market_orders`);
  }

  async customRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    version: 1 | 2,
    path: string,
    payload?: any,
  ) {
    return await this.request<T>(method, version, path, payload);
  }

  // Websocket

  private buildIdentifier(channel: Channel, url: string): string {
    const idetifier = {
      channel,
      users: [
        {
          api_key: this.KEY,
          signature: getSignature({
            apiKeyType: this.KEY_TYPE,
            payload: url,
            secret: this.SECRETS,
          }),
        },
      ],
    };

    return JSON.stringify(idetifier);
  }

  private subscribe(
    channel: Channel,
    url: string,
    callback?: WebsocketCallback,
  ) {
    const payload = JSON.stringify({
      identifier: this.buildIdentifier(channel, url),
      command: 'subscribe',
    });
    const setUpWebsocketListener = (callback?: WebsocketCallback) => {
      if (callback) {
        this.ws?.on('message', (data: Buffer, isBinary: boolean) => {
          const message = isBinary ? data : data.toString();
          callback(message);
        });
      }
      this.ws?.on('close', (code) => {
        if (code === 1006) {
          setUpWebsocket(payload);
        }
      });
    };
    const setUpWebsocket = (payload: string) => {
      this.ws = new WebSocket(WS);
      this.ws.onopen = () => this.ws?.send(payload);
      setUpWebsocketListener(callback);
    };

    if (!this.ws) {
      setUpWebsocket(payload);
    } else {
      this.ws.send(payload);
    }
  }

  subscribeSmartTrade(callback?: (data: WebSocket.Data) => void) {
    this.subscribe('SmartTradesChannel', '/smart_trades', callback);
  }

  subscribeDeal(callback?: (data: WebSocket.Data) => void) {
    this.subscribe('DealsChannel', '/deals', callback);
  }

  // 3Commas does not support unsubscribe a channel
  unsubscribe() {
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Validate the response order is consistent with the generated type
   * Or, an error is thrown
   *
   * @param order order
   */
  validateOrderType(order: Order) {
    return Convert.toOrder(JSON.stringify(order));
  }
}
