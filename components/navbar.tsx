import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#EEF6F6]/95 backdrop-blur-md border-b border-[#19322F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#19322F] flex items-center justify-center">
              <span className="material-icons text-white text-lg leading-none">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#19322F]">
              LuxeEstate
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#"
              className="text-[#006655] font-medium text-sm border-b-2 border-[#006655] px-1 py-1"
            >
              Buy
            </Link>
            <Link
              href="#"
              className="text-[#19322F]/70 hover:text-[#19322F] font-medium text-sm hover:border-b-2 hover:border-[#19322F]/20 px-1 py-1 transition-all"
            >
              Rent
            </Link>
            <Link
              href="#"
              className="text-[#19322F]/70 hover:text-[#19322F] font-medium text-sm hover:border-b-2 hover:border-[#19322F]/20 px-1 py-1 transition-all"
            >
              Sell
            </Link>
            <Link
              href="#"
              className="text-[#19322F]/70 hover:text-[#19322F] font-medium text-sm hover:border-b-2 hover:border-[#19322F]/20 px-1 py-1 transition-all"
            >
              Saved Homes
            </Link>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-6">
            <button
              type="button"
              aria-label="Search"
              className="text-[#19322F] hover:text-[#006655] transition-colors"
            >
              <span className="material-icons leading-none">search</span>
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="text-[#19322F] hover:text-[#006655] transition-colors relative"
            >
              <span className="material-icons leading-none">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#EEF6F6]"></span>
            </button>
            <button
              type="button"
              aria-label="Profile"
              className="flex items-center gap-2 pl-2 border-l border-[#19322F]/10 ml-2"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-[#006655] transition-all relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"
                  alt="User profile portrait smiling"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className="md:hidden border-t border-[#19322F]/5 bg-[#EEF6F6] overflow-hidden h-0 transition-all duration-300">
        <div className="px-4 py-2 space-y-1">
          <Link
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#006655] bg-[#006655]/10"
          >
            Buy
          </Link>
          <Link
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#19322F] hover:bg-black/5"
          >
            Rent
          </Link>
          <Link
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#19322F] hover:bg-black/5"
          >
            Sell
          </Link>
          <Link
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#19322F] hover:bg-black/5"
          >
            Saved Homes
          </Link>
        </div>
      </div>
    </nav>
  );
}

