import SideBar from "@/components/ui/Sidebar";
import Image from "next/image"; 
import MobileNavbar from "@/components/ui/MobileNav";
import { getLoggedInUser } from "@/lib/actions/user.actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = await getLoggedInUser();
  return (
    <main className="flex h-screen w-full font-inter"> 
        <SideBar 
          user={loggedIn}
        /> 
        <div className="flex size-full flex-col">
          <div className="root-layout">
            <Image 
              src="/icons/logo.svg"
              alt="Logo"
              width={30}
              height={30}
            />
            <div>
              <MobileNavbar 
                user={loggedIn} 
              /> 
            </div>
          </div>
          {children} 
        </div>
    </main> 
  );
}
