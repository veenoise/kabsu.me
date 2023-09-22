"use client";

import { Button } from "@/components/ui/button";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./ui/menubar";
import { useTheme } from "next-themes";
import { Check, LogOut, Menu, Moon, Sun } from "lucide-react";
import { Icons } from "./icons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { usePathname, useRouter } from "next/navigation";
import { NAVBAR_LINKS } from "@cvsu.me/constants";
import Notifications from "./notifications";
import { api } from "@/lib/trpc/client";
import { Separator } from "./ui/separator";

export default function Header() {
  // { userId }: { userId: string | null }
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { signOut } = useClerk();
  const [loadingSignout, setLoadingSignout] = useState(false);
  const [open, setOpen] = useState("");
  const { user } = useUser();
  const userQuery = api.auth.getCurrentUser.useQuery();

  return (
    <header className="flex items-center justify-between gap-x-2 py-4">
      <div className="flex items-center gap-x-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size="1rem" className="" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="mb-4">
              <SheetTitle>CvSU.me</SheetTitle>
              <SheetDescription>Navigate to different pages</SheetDescription>
            </SheetHeader>

            {NAVBAR_LINKS.map((link) => (
              <Fragment key={link.url}>
                <Button
                  asChild
                  className="w-full justify-start"
                  variant={pathname === link.url ? "secondary" : "ghost"}
                  // size="sm"
                >
                  <SheetClose asChild>
                    <Link
                      href={link.url}
                      target={
                        link.url.startsWith("http") ? "_blank" : undefined
                      }
                    >
                      {link.name}
                    </Link>
                  </SheetClose>
                </Button>
                {link.hasSeparator && <Separator className="my-2" />}
              </Fragment>
            ))}
          </SheetContent>
        </Sheet>
        <div className="h-9 w-9" />
      </div>
      <Button variant="link" size="icon" asChild className="px-0">
        <Link href="/">
          <div className="w-max">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              priority
              className="object-contain"
            />
          </div>
        </Link>
      </Button>

      <div className="flex items-center gap-x-2">
        <Notifications />

        {userQuery.isLoading ? (
          <Skeleton className="m-1 h-8 w-8 rounded-full" />
        ) : (
          userQuery.data && (
            <Menubar asChild value={open}>
              <MenubarMenu value="open">
                <MenubarTrigger
                  className="cursor-pointer rounded-full p-1"
                  onClick={() => setOpen("open")}
                >
                  <div className="relative h-8 w-8">
                    <Image
                      src={userQuery.data.imageUrl}
                      alt="Image"
                      fill
                      sizes="100%"
                      className="rounded-full"
                    />
                  </div>
                </MenubarTrigger>
                <MenubarContent
                  align="end"
                  onInteractOutside={() => setOpen("")}
                  className="max-w-[2rem]"
                >
                  <MenubarItem
                    asChild
                    className="line-clamp-1 w-full cursor-pointer truncate"
                    onClick={() => setOpen("")}
                  >
                    <Link
                      href={`/${user?.username ?? userQuery.data.username}`}
                      className="w-full"
                    >
                      {user?.username
                        ? `@${user.username}`
                        : userQuery.data.username
                        ? `@${userQuery.data.username}`
                        : "My Profile"}
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild onClick={() => setOpen("")}>
                    <Link href="/account">Account Settings</Link>
                  </MenubarItem>

                  <MenubarSeparator />

                  <MenubarSub>
                    <MenubarSubTrigger>
                      <div className="flex flex-1 items-center justify-between">
                        <Sun className="mr-2 block dark:hidden" size="1rem" />
                        <Moon className="mr-2 hidden dark:block" size="1rem" />
                        Theme <MenubarShortcut>⌘ T</MenubarShortcut>
                      </div>
                    </MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem onClick={() => setTheme("light")}>
                        <Check size="1rem" className="mr-2 dark:opacity-0" />
                        Light Mode
                      </MenubarItem>
                      <MenubarItem onClick={() => setTheme("dark")}>
                        <Check
                          size="1rem"
                          className="mr-2 opacity-0 dark:opacity-100"
                        />
                        Dark Mode
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  <MenubarSeparator />

                  <MenubarItem
                    onClick={async () => {
                      setLoadingSignout(true);
                      await signOut();
                      router.push("/");
                      setLoadingSignout(false);
                      setOpen("");
                    }}
                    disabled={loadingSignout}
                  >
                    <div className="mr-2">
                      {loadingSignout ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut size="1rem" />
                      )}
                    </div>
                    Sign out
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )
        )}
      </div>
    </header>
  );
}