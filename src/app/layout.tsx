import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LayoutDashboard, Upload, List, Send, Settings, History } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-gray-50 min-h-screen flex")}>
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
          <div className="p-6 border-b border-gray-200">
            <span className="text-xl font-bold text-blue-600">TOB Auto</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem href="/upload" icon={<Upload size={20} />} label="Upload" />
            <NavItem href="/transactions" icon={<List size={20} />} label="Transactions" />
            <NavItem href="/declare" icon={<Send size={20} />} label="Declare" />
            <NavItem href="/history" icon={<History size={20} />} label="History" />
            <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" />
          </nav>
          <div className="p-4 border-t border-gray-200">
             <div className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">JD</div>
                <div className="text-sm">
                  <p className="font-medium">John Doe</p>
                  <button className="text-gray-500 hover:text-gray-700">Logout</button>
                </div>
             </div>
          </div>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
