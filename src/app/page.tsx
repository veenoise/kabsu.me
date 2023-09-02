import { UserButton, auth } from "@clerk/nextjs";
import Auth from "@/components/auth";
import { ToggleTheme } from "@/components/toggle-theme";

export default function Home() {
  const { userId } = auth();

  return (
    <div className="container">
      <ToggleTheme />
      {userId ? (
        <div>
          <h1>Welcome to CvSU.me</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      ) : (
        <div>
          <Auth />
        </div>
      )}
    </div>
  );
}
