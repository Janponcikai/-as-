export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary rounded" />
            <span className="font-bold text-xl text-primary tracking-tight">
              RASI Process Manager
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
