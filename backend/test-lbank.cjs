const axios = require('axios');

axios.get('https://lbkperp.lbank.com/cfd/openApi/v1/pub/instrument?productGroup=SwapU')
  .then(response => {
    console.log(JSON.stringify(response.data).substring(0, 500));
  })
  .catch(error => {
    console.error("Error:", error.message);
  });
