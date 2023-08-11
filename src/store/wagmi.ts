import { DataverseWalletConnector } from "@dataverse/wallet-adapter";
import { configureChains } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const polygonMumbai = {
  id: 80001,
  name: "Polygon Mumbai",
  network: "maticmum",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://polygon-mumbai.blockpi.network/v1/rpc/public"],
    },
    public: {
      http: ["https://polygon-mumbai.blockpi.network/v1/rpc/public"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "PolygonScan",
      url: "https://mumbai.polygonscan.com",
    },
    default: {
      name: "PolygonScan",
      url: "https://mumbai.polygonscan.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 25770160,
    },
  },
  testnet: true,
} as const;

const { chains, publicClient } = configureChains(
  [mainnet, polygonMumbai],
  [publicProvider()],
);

const dataverseWalletConnector = new DataverseWalletConnector({ chains });

export { publicClient, dataverseWalletConnector };
