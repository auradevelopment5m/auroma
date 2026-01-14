import { SupportInbox } from "@/components/admin/support-inbox"

export const metadata = {
  title: "Support Chat | Auroma Admin",
}

export default function AdminSupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <SupportInbox />
    </div>
  )
}
