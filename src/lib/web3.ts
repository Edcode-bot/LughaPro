import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo, celoAlfajores } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "LughaPro",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
  chains: [celo, celoAlfajores],
  ssr: true,
});
