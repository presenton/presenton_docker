"use client";
import { LayoutDashboard, Settings } from "lucide-react";
import React from "react";
import Link from "next/link";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const UserAccount = () => {

  const canChangeKeys = useSelector((state: RootState) => state.userConfig.can_change_keys);

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        prefetch={false}
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
        role="menuitem"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-sm font-medium font-inter">
          Dashboard
        </span>
      </Link>
      {canChangeKeys && (
        <Link
          href="/settings"
          prefetch={false}
          className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
          role="menuitem"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium font-inter">
            Settings
          </span>
        </Link>
      )}
    </div>
  );
};

export default UserAccount;
