import { getSignature } from './crypto';
import { readFileSync } from 'node:fs';

describe('crypto', () => {
  it('check self generated api', () => {
    /**
     * Test data from https://github.com/3commas-io/3commas-official-api-docs/blob/master/signed_endpoints_rsa.md
     */
    const url = '/public/api/ver1/users/change_mode?mode=paper';
    const privateKey = readFileSync(
      process.cwd() + '\\src\\lib\\privateKey.test.pem',
      'utf8',
    );
    const expectedSignature =
      'W+a26NiV6KkWP5zWoaDU9nSHmfObAtbbaq+xPIKwiKIz81Mlgrek/Z51qsAWNXEMCpIGW40IYDo7BTq4FSvOVSxdfrFK3lRqBveoXW+/50QOd3p+fDe5Ku7Z0U6MvXSUeFOguMBxP7er1SLGOb5RLYI/2GPMI5txLAoSsTLjGkWOc7S3ZhUpxEfxSCp8wCFp6E99biIX2MhIT1/AAl290ID76Wr1dj9Y3QxIl6KtQlbpEqhvWBaadYaYyZR5YjHAn5NWAE2cvxLkH+SQE1khzAdB6T9ZJ9sgMtY1bOzTTV/Cj9W0SABCYr4In12+uFY0lB+ANvgi8hLr2NCl775Wdw==';

    const result = getSignature({
      apiKeyType: 'selfGenerated',
      payload: url,
      secret: privateKey,
    });

    expect(result).toBe(expectedSignature);
  });
  it('check system generated api', () => {
    const url = '/public/api/ver1/accounts/30973258';
    const secret =
      '1c95cd7d4aebe36f28d53610e106e80b85acbb0210f5810832d35e9feae56a8812eafe8271ac314e839c29cd2fd03df9385f8c39ffa4f5f645df3d371c46153b7f7b5011a2c350471b63f8dac1c103cb2dee712837fba942bfe03b49405344216a07f8f3';
    const expectedSignature =
      '4185577ea69d31a366a55faae0fe2e0dcf0becb7921af8174eae7c49db20a27e';

    const result = getSignature({
      apiKeyType: 'systemGenerated',
      payload: url,
      secret,
    });
    expect(result).toBe(expectedSignature);
  });
});
