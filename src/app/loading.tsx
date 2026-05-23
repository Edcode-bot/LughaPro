import Image from 'next/image'

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-off-white">
      <div className="flex flex-col items-center gap-4">
        <Image src="/logo.png" alt="LughaPro" width={140} height={42} className="h-12 w-auto" priority />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    </main>
  )
}
