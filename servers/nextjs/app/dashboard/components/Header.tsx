"use client";

import Wrapper from "@/components/Wrapper";
import React from "react";
import Link from "next/link";
import UserAccount from "@/app/(presentation-generator)/components/UserAccount";
import BackBtn from "@/components/BackBtn";
import { usePathname } from "next/navigation";
const Header = () => {
  const pathname = usePathname();
  return (
    <div className="bg-[#5146E5] w-full shadow-lg sticky top-0 z-50">
      <Wrapper>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            {pathname !== '/upload' && <BackBtn />}
            <Link href="/dashboard">
              <img
                src="/logo-white.png"
                alt="Presentation logo"
                className="h-16"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 md:gap-10">
            <UserAccount />
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;
