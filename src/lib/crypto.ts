import cryptoNative from 'crypto';
import { ApiKeyType } from '../types';

interface Props {
  apiKeyType: ApiKeyType;
  payload: string;
  secret: string;
}

const signBase64 = (payload: string, sercret: string) => {
  const crypto = cryptoNative.createSign('RSA-SHA256').update(payload).end();
  return crypto.sign(sercret, 'base64');
};

const signHex = (payload: string, sercret: string) => {
  const sign = cryptoNative.createHmac('sha256', sercret).update(payload);

  return sign.digest('hex');
};

export const getSignature = ({ apiKeyType, payload, secret }: Props) =>
  apiKeyType === 'selfGenerated'
    ? signBase64(payload, secret)
    : signHex(payload, secret);
