const axios = require('axios');

async function checkMEXCSymbols() {
  try {
    const response = await axios.get('https://contract.mexc.com/api/v1/contract/detail');
    const symbols = response.data?.data || [];
    
    const blacklistedPlates = [
      'tradfi', 'Commodities', 'Stock', 'koreanstocks', 'semiconductors', 
      'TechGiants', 'OIL', 'stockindex', 'aerospace', 'finance', 
      'Forex', 'healthcare', 'metals', 'chips', 'computing', 'cpo'
    ].map(s => s.toLowerCase());

    const isNonCrypto = (item) => {
      if (!item.conceptPlate) return false;
      return item.conceptPlate.some(plate => {
        const p = plate.toLowerCase();
        return blacklistedPlates.some(b => p.includes(b));
      });
    };

    const cryptoSymbols = symbols.filter(s => s.quoteCoin === 'USDT' && s.state === 0 && !isNonCrypto(s));
    const nonCrypto = symbols.filter(s => s.quoteCoin === 'USDT' && s.state === 0 && isNonCrypto(s));
    
    console.log(`Filtered crypto symbols: ${cryptoSymbols.length}`);
    console.log(`Filtered non-crypto symbols: ${nonCrypto.length}`);
    console.log(`Some filtered non-crypto: ${nonCrypto.slice(0, 10).map(s => s.symbol).join(', ')}`);
    console.log(`Some kept crypto: ${cryptoSymbols.slice(0, 10).map(s => s.symbol).join(', ')}`);
  } catch (err) {
    console.error(err);
  }
}

checkMEXCSymbols();
