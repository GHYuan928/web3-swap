const ZAN_API_KEY = '1a6fc36d59c7460cb0c88076be3e5fee';
const ZAN_API_URL_SEPOLIA = 'https://api.zan.top/node/v1/eth/sepolia/1a6fc36d59c7460cb0c88076be3e5fee';
const FEE_PERCENT_VALUE: Record<string, number> = {
    '0.01': 100,    // 0.01%
    '0.05': 500,    // 0.05%
    '0.3': 3000,    // 0.3%
    '1': 10000      // 1%
  };
const FEE_VALUE_PERCENT: Record<number, string> = {
    100: '0.01',    // 0.01%
    500: '0.05',    // 0.05%
    3000: '0.3',    // 0.3%
    10000: '1'     // 1%
  };
const MNTokenA = "0x4798388e3adE569570Df626040F07DF71135C48E"
const MNTokenB = "0x5A4eA3a013D42Cfd1B1609d19f6eA998EeE06D30"
const MNTokenC = "0x86B5df6FF459854ca91318274E47F4eEE245CF28"
const MNTokenD = "0x7af86B1034AC4C925Ef5C3F637D1092310d83F03"

export {
  ZAN_API_KEY,
  ZAN_API_URL_SEPOLIA,
  FEE_PERCENT_VALUE,
  FEE_VALUE_PERCENT,
  MNTokenA,
  MNTokenB,
  MNTokenC,
  MNTokenD
}