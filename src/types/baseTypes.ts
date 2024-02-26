import WebSocket from 'ws';

export type ApiKeyType = 'systemGenerated' | 'selfGenerated';

export interface APIOptions {
  key?: string;
  secrets?: string;
  timeout?: number;
  forcedMode?: 'real' | 'paper';
  errorHandler?: (
    response: ThreeCommasError,
    reject: (reason?: any) => void,
  ) => void | Promise<any>;
  apiKeyType: ApiKeyType;
}

export interface ThreeCommasError {
  error: string;
  error_description?: string;
  error_attributes?: {
    [key: string]: string;
  };
}

export interface BotsParams {
  limit?: number; // Max 100
  offset?: number;
  account_id?: number;
  scope?: 'enabled' | 'disabled';
  strategy?: 'long' | 'short';
  sort_by?: 'profit' | 'created_at' | 'updated_at';
  sort_direction?: 'asc' | 'desc';
  quote?: string;
}

export interface BotsStatsParams {
  account_id?: number;
  bot_id?: number;
}

export interface BotOptionalParams {
  /**
   * Include bot events on the bot object, defaults `false`.
   */
  include_events: boolean;
}

export interface CurrencyParams {
  market_code?: string;
  pair: string;
}

export interface DealsParams {
  limit?: number; // Max 1000
  offset?: number;
  account_id?: number;
  bot_id?: number;
  scope?: 'active' | 'finished' | 'completed' | 'cancelled' | 'failed';
  order?:
    | 'created_at'
    | 'updated_at'
    | 'closed_at'
    | 'profit'
    | 'profit_percentage';
  order_direction?: 'asc' | 'desc';
  base?: string;
  quote?: string;
}

export interface FundParams {
  order_type: 'market' | 'limit';
  units: {
    value: number | string;
  };
  price?: {
    value: number | string;
  };
}

export interface MarketCurrencyParams {
  market_code: string;
  pair: string;
}

export interface TransferParams {
  currency: string;
  amount: number | string;
  from_account_id: number | string;
  to_account_id: number | string;
}

export interface TransferHistoryParams {
  account_id: number | string;
  currency: string;
  page?: number | string;
  per_page?: number | string;
}

export interface SmartTradeHistoryParams {
  account_id?: number | string;
  pair?: string;
  type?:
    | 'simple_buy'
    | 'simple_sell'
    | 'smart_sell'
    | 'smart_trade'
    | 'smart_cover';
  page?: number | string;
  per_page?: number | string;
  status?: 'all' | 'active' | 'finished' | 'cancelled' | 'failed';
  order_by?: 'created_at' | 'updated_at' | 'closed_at' | 'status';
  order_direction?: 'asc' | 'desc';
}

export interface SmartTradeParams {
  account_id: number;
  pair: string;
  note?: string;
  instant?: boolean;
  skip_enter_step?: boolean;
  leverage?: Leverage;
  position: Position;
  take_profit?: TakeProfit;
  stop_loss?: StopLoss;
}

interface Leverage {
  enabled: boolean;
  type?: 'custom' | 'cross';
  value?: number;
}

interface Position {
  type: 'buy' | 'sell';
  units: UnitsClass;
  price?: UnitsClass;
  order_type: 'market' | 'limit' | 'conditional';
  conditional?: PositionConditional;
}

interface PositionConditional {
  price: PositionConditionalPrice;
  order_type: 'market' | 'limit';
  trailing?: Trailing;
}

interface PositionConditionalPrice {
  value: number;
  type: 'bid' | 'ask' | 'last';
}

interface Trailing {
  enabled: boolean;
  percent?: number;
}

export interface UnitsClass {
  value: number;
}

interface StopLoss {
  enabled: boolean;
  breakeven?: boolean;
  order_type?: 'market' | 'limit';
  price?: UnitsClass;
  conditional?: StopLossConditional;
  timeout?: Timeout;
}

interface StopLossConditional {
  price: StepPrice;
  trailing?: Trailing;
}

interface StepPrice {
  value?: number;
  type: 'bid' | 'ask' | 'last';
  percent?: number;
}

interface Timeout {
  enabled: boolean;
  value: number;
}

interface TakeProfit {
  enabled: boolean;
  steps?: Step[];
}

interface Step {
  order_type: 'market' | 'limit';
  price: StepPrice;
  volume: number;
  trailing?: Trailing;
}

// Websocket
export type Channel = 'SmartTradesChannel' | 'DealsChannel';
export type WebsocketCallback = (data: WebSocket.Data) => void;