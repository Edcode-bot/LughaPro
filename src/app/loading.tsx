import Image from 'next/image'

export default function Loading() {
  return <main className="grid min-h-screen place-items-center bg-off-white"><Image src="/logo.png" alt="LughaPro" width={140} height={42} className="h-12 w-auto animate-pulse" priority /></main>
}
