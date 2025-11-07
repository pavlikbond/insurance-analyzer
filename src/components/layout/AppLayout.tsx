import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";

export function AppLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <div className={`${isAuthPage ? "h-screen overflow-hidden" : "min-h-screen"} bg-background flex flex-col`}>
      <Header />
      {/* Home page handles its own full-width layout, other pages use container */}
      <main className={isHomePage ? "" : "container mx-auto px-4 py-8"}>
        <Outlet />
      </main>
    </div>
  );
}
