import "@nomicfoundation/hardhat-toolbox"
import "@semaphore-protocol/hardhat"
require("@nomiclabs/hardhat-waffle");
import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import "./tasks/deploy"
require("hardhat-gas-reporter");

dotenvConfig()

function getNetworks(): NetworksUserConfig {
    if (process.env.ETHEREUM_URL && process.env.ETHEREUM_PRIVATE_KEY) {
        const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`]

        return {
            goerli: {
                url: process.env.ETHEREUM_URL,
                chainId: 5,
                accounts
            },
            sepolia: {
                url: process.env.SEPOLIA_ETHEREUM_URL,
                chainId: 11155111,
                accounts
            },
            arbitrum: {
                url: process.env.ETHEREUM_URL,
                chainId: 42161,
                accounts
            }
        }
    }

    return {}
}

const config: HardhatUserConfig = {
    solidity: {
        version:"0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
    },
    networks: {
        hardhat: {
            chainId: 1337
        },
        ...getNetworks()
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        gasPriceApi: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
        token: 'MATIC'
    }
}

export default config
