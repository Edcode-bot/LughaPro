import { createPublicClient, formatEther, http, type Address, type EIP1193Provider } from "viem";
import { celo, celoAlfajores } from "viem/chains";
import { CUSD_ALFAJORES_ADDRESS, ERC20_ABI } from "@/lib/contracts";

type MiniPayEthereumProvider = EIP1193Provider & {
  isMiniPay?: boolean;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const CELO_MAINNET_CHAIN_ID = 42220;
export const CELO_ALFAJORES_CHAIN_ID = 44787;

const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http("https://alfajores-forno.celo-testnet.org"),
});

export function isMiniPay(): boolean {
  return typeof window !== "undefined" && window.ethereum?.isMiniPay === true;
}

export function getMiniPayProvider() {
  return isMiniPay() ? window.ethereum : undefined;
}

export async function getMiniPayAddress(): Promise<string> {
  const provider = getMiniPayProvider();
  if (!provider) throw new Error("MiniPay provider is not available");
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string") throw new Error("No MiniPay account connected");
  return accounts[0];
}

export async function switchToCeloNetwork(chainId: number = CELO_ALFAJORES_CHAIN_ID) {
  const provider = typeof window !== "undefined" ? window.ethereum : undefined;
  if (!provider) throw new Error("Wallet provider is not available");
  const target = chainId === CELO_MAINNET_CHAIN_ID ? celo : celoAlfajores;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: `0x${target.id.toString(16)}` }] });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? Number(error.code) : undefined;
    if (code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${target.id.toString(16)}`,
          chainName: target.name,
          nativeCurrency: target.nativeCurrency,
          rpcUrls: target.id === CELO_MAINNET_CHAIN_ID ? ["https://forno.celo.org"] : ["https://alfajores-forno.celo-testnet.org"],
          blockExplorerUrls: target.id === CELO_MAINNET_CHAIN_ID ? ["https://celoscan.io"] : ["https://alfajores.celoscan.io"],
        }],
      });
      return;
    }
    throw error;
  }
}

export function formatCUSDAmount(wei: bigint): string {
  return `${Number(formatEther(wei)).toFixed(2)} cUSD`;
}

export function formatCELOAmount(wei: bigint): string {
  return `${Number(formatEther(wei)).toFixed(2)} CELO`;
}

export function shortenAddress(address: string): string {
  return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
}

export async function getCUSDBalance(address: string): Promise<bigint> {
  return publicClient.readContract({
    address: CUSD_ALFAJORES_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });
}

export async function getCELOBalance(address: string): Promise<bigint> {
  return publicClient.getBalance({ address: address as Address });
}
