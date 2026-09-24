import { useState } from "react";
import { Menu } from "lucide-react";
import UserMenu from "./UserMenu";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="h-14 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
      {/* Desktop layout */}
      <div className="hidden md:flex h-full items-center justify-between px-6 gap-4">
        <SearchBar />
        <div className="flex items-center gap-3 shrink-0">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden h-full flex items-center justify-between px-3 gap-2">
        {!mobileSearchOpen ? (
          <>
            <button
              onClick={onMenuClick}
              className="icon-btn shrink-0"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="icon-btn"
              aria-label="Search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <NotificationBell />
            <UserMenu />
          </>
        ) : (
          <>
            <SearchBar onNavigate={() => setMobileSearchOpen(false)} />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="text-muted hover:text-text text-sm px-2 shrink-0"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </header>
  );
}