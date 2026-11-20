import { getCurrentUser } from "@/lib/auth";
import NavbarUserMenu from "./navbar-user-menu";

/** Reads the session at request time; render it inside <Suspense>. */
export default async function NavbarAuth() {
  const user = await getCurrentUser();
  return <NavbarUserMenu user={user} />;
}
