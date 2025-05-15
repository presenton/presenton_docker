"use client";
import { ChevronDown, LayoutDashboard, Settings, User } from "lucide-react";
import { AvatarFallback } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import Link from "next/link";

const UserAccount = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 cursor-pointer focus:outline-none">
          <Avatar className="h-10 w-10">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div className="hidden  sm:flex items-center">
            <ChevronDown className="w-4 h-4 ml-1 text-white" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[250px] p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <nav className="flex flex-col" role="menu" tabIndex={-1}>
          <Link
            href="/dashboard"
            prefetch={false}
            className="flex items-center gap-2 px-4 py-4 hover:bg-gray-50 border-b border-gray-300 transition-colors outline-none focus:bg-gray-50"
            role="menuitem"
          >
            <LayoutDashboard className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 text-sm font-medium font-inter">
              Dashboard
            </span>
          </Link>
          <Link
            href="/setting"
            prefetch={false}
            className="flex items-center gap-2 px-4 py-4 hover:bg-gray-50 border-b border-gray-200 transition-colors outline-none focus:bg-gray-50"
            role="menuitem"
          >
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 text-sm font-medium font-inter">
              Settings
            </span>
          </Link>
        </nav>
      </PopoverContent>
    </Popover>
  );
};

export default UserAccount;
