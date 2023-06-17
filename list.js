const Web3 = require("web3");
const axios = require("axios");
var fs = require("fs");
require("dotenv").config();
const paperHandsStakingJsonInterface = require("./PaperHandsStaking.json");
const contractAddress = "0x71525DcEe89660e936695AA6307287806864E878";
const apiKey = process.env.ETHERSCAN_API_KEY;
const stakers = [];
const network = process.env.ETHEREUM_NETWORK;
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`
  )
);

async function listContractTransactions(contractAddress, apiKey) {
  try {
    const apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

    const response = await axios.get(apiUrl);

    const transactions = response.data.result.filter(
      (tx) => tx.to.toLowerCase() === contractAddress.toLowerCase()
    );

    return transactions;
  } catch (error) {
    console.error("Error retrieving contract transactions:", error);
    throw error;
  }
}

async function getAddressBalance(web3, address) {
  const paperHandsStaking = new web3.eth.Contract(
    paperHandsStakingJsonInterface.abi,
    "0x71525DcEe89660e936695AA6307287806864E878"
  );

  const balance = await paperHandsStaking.methods
    .viewAllRewards(address)
    .call();
  return balance;
}

async function main() {
  const transactions = await listContractTransactions(contractAddress, apiKey);
  for (transaction in transactions) {
    if (transactions[transaction].functionName.slice(0, 5) === "stake") {
      let balance = await getAddressBalance(
        web3,
        transactions[transaction].from
      );
      let stakerData = {};
      stakerData[transactions[transaction].from] = balance;
      stakers.push(stakerData);
    }
  }
  fs.writeFile(
    "balancePerAddress.json",
    JSON.stringify(stakers),
    function (err) {
      if (err) throw err;
      console.log("complete");
    }
  );
}

main();
