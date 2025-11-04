import { Outlet } from "react-router-dom";
import { LandingHeader } from "./LandingHeader";

export function LandingLayout() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <Outlet />
    </div>
  );
}
