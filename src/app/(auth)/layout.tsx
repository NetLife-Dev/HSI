import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-white">
      {/* Left side: Cinematic Background using Native CSS */}
      <div className="relative hidden lg:block overflow-hidden bg-[#0A0D14]">
        <div className="absolute inset-0 z-0 animate-cinematic-zoom">
           <Image
              src="/images/mock/exterior.png"
              alt="Luxury Host Experience"
              fill
              className="object-cover brightness-75 contrast-125"
              priority
           />
           <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0D14]/80 via-transparent to-transparent" />
        </div>

        {/* Branding overlay with Native CSS Stagger */}
        <div className="absolute bottom-12 left-12 z-10 space-y-4 max-w-sm">
           <div className="w-12 h-1 bg-primary rounded-full animate-entrance-stagger" style={{ animationDelay: '0.5s' }} />
           <h2 className="text-4xl font-bold text-white tracking-tighter leading-[0.9] animate-entrance-stagger" style={{ animationDelay: '0.7s' }}>
              Mantenha o controle da sua rentabilidade.
           </h2>
           <p className="text-slate-400 text-sm font-medium leading-relaxed animate-entrance-stagger" style={{ animationDelay: '0.9s' }}>
              A plataforma definitiva para anfitriões profissionais que buscam escala sem burocracia.
           </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex items-center justify-center p-8 bg-[var(--color-surface)]">
        <div className="w-full max-w-[400px] space-y-2 animate-slide-up">
          {children}
        </div>
      </div>
    </div>
  )
}
