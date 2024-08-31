"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ChevronLeft, ExternalLink, Reply, Send, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { v4 } from "uuid";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";
import { cn } from "@kabsu.me/ui";
import { Button } from "@kabsu.me/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kabsu.me/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@kabsu.me/ui/form";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Separator } from "@kabsu.me/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kabsu.me/ui/tooltip";

import type { Database } from "../../../../supabase/types";
import { Icons } from "~/components/icons";
import { api } from "~/lib/trpc/client";
import { createClient } from "~/supabase/client";

export default function RoomPageClient(
  props: (
    | {
        type: Database["public"]["Enums"]["global_chat_type"];
      }
    | {
        type: "room";
      }
  ) & {
    current_user: RouterOutputs["auth"]["getCurrentUser"];
    getRoomChats: NonNullable<RouterOutputs["chats"]["getRoomChats"]>;
  },
) {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const utils = api.useUtils();

  // const getRoomChatsQuery = api.chats.getRoomChats.useQuery(
  //   {
  //     ...(props.type === "room"
  //       ? { type: props.type, room_id: props.getRoomChats.room.id }
  //       : { type: props.type }),
  //   },
  //   { initialData: props.getRoomChats },
  // );
  const sendMessageMutation = api.chats.sendMessage.useMutation({
    onSuccess: async () => await utils.chats.getAllRooms.invalidate(),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const [chats, setChats] = useState(
    // getRoomChatsQuery.data?.room.chats ?? []
    props.getRoomChats.room.chats.map((chat) => ({
      ...chat,
      status: "success",
    })),
  );

  const [hasMore, setHasMore] = useState(true);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMore) {
        loadMoreMessagesMutation.mutate({
          len: chats.length,
          ...(props.type === "room"
            ? { type: props.type, room_id: props.getRoomChats.room.id }
            : { type: props.type }),
        });
      }
    },
  });
  const loadMoreMessagesMutation = api.chats.loadMoreMessages.useMutation({
    onSuccess: (data) => {
      const new_data = data?.room.chats ?? [];
      setHasMore(new_data.length !== 0);
      if (new_data.length > 0) scrollRef.current?.scrollIntoView();

      setChats((prev) => [
        ...new_data.map((chat) => ({
          ...chat,
          status: "success",
        })),
        ...prev,
      ]);
    },
  });
  const getMyUniversityStatusQuery = api.auth.getMyUniversityStatus.useQuery();

  const form = useForm<{
    message: string;
    reply?: { id: string; content: string; username: string };
  }>({
    resolver: zodResolver(
      z.object({
        message: z.string().max(512, {
          message: "Message cannot be longer than 512 characters.",
        }),
        reply: z
          .object({
            id: z.string(),
            content: z.string(),
            username: z.string(),
          })
          .optional(),
      }),
    ),
    defaultValues: {
      message: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(false);

    const channel = supabase.channel(
      `chat_${props.type}_${props.type === "room" ? props.getRoomChats.room.id : props.type === "all" ? "all" : props.type === "campus" ? getMyUniversityStatusQuery.data?.programs?.colleges?.campuses?.id : props.type === "college" ? getMyUniversityStatusQuery.data?.programs?.colleges?.id : getMyUniversityStatusQuery.data?.programs?.id}`,
    );

    channel
      .on(
        "broadcast",
        { event: "new" },
        ({ payload }: { payload: (typeof chats)[number] }) => {
          if (props.current_user.id === payload.user_id) return;
          setChats((prev) => [...prev, { ...payload, status: "success" }]);
          messagesEndRef.current?.scrollIntoView(false);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
      void channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isScrollToBottom) {
      messagesEndRef.current?.scrollIntoView(false);
      setIsScrollToBottom(false);
    }
  }, [isScrollToBottom]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between p-4">
        <div className="flex items-center gap-2">
          <Button
            className="size-8 rounded-full"
            size="icon"
            variant="ghost"
            asChild
          >
            <Link href="/chat">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          {props.type === "room" ? (
            <>
              <Link href={`/${props.getRoomChats.room.to?.username}`}>
                <Image
                  src={
                    props.getRoomChats.room.to?.image_name
                      ? props.getRoomChats.room.to.image_url
                      : "/default-avatar.jpg"
                  }
                  width={44}
                  height={44}
                  alt="Profile picture"
                  className="rounded-full"
                />
              </Link>
              <div>
                <Link
                  href={`/${props.getRoomChats.room.to?.username}`}
                  className="group flex items-center text-sm"
                >
                  <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">
                      {props.getRoomChats.room.to?.name}
                    </h1>
                    <h1>@{props.getRoomChats.room.to?.username}</h1>
                  </div>

                  {/* <ExternalLink className="ml-2 size-4 -translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" /> */}
                </Link>
                {/* <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-500 text-lg" />
                  <p className="text-xs text-muted-foreground">Online</p>
                </div> */}
              </div>
            </>
          ) : (
            <p className="text-lg">
              {props.type === "all"
                ? "All campuses"
                : props.type.charAt(0).toUpperCase() +
                  props.type.slice(1) +
                  `${
                    getMyUniversityStatusQuery.data
                      ? ` (${
                          props.type === "campus"
                            ? getMyUniversityStatusQuery.data.programs?.colleges?.campuses?.slug.toUpperCase()
                            : props.type === "college"
                              ? getMyUniversityStatusQuery.data.programs?.colleges?.slug.toUpperCase()
                              : getMyUniversityStatusQuery.data.programs?.slug.toUpperCase()
                        })`
                      : ""
                  }`}
            </p>
          )}
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <EllipsisVertical size="1rem" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Test</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      <Separator />

      <div className="flex h-0 flex-grow">
        {chats.length === 0 ? (
          <div className="grid flex-1 place-items-center">
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 py-4">
              <div ref={ref}>
                <div className="text-center text-sm text-muted-foreground">
                  {loadMoreMessagesMutation.isPending && hasMore ? (
                    "Loading more messages..."
                  ) : (
                    <div className="flex w-full flex-col items-center justify-center gap-y-2">
                      <div className="flex w-full flex-col">
                        <Image
                          src={
                            props.getRoomChats.room.to?.image_name
                              ? props.getRoomChats.room.to.image_url
                              : "/default-avatar.jpg"
                          }
                          width={96}
                          height={96}
                          alt="Profile picture"
                          className="mx-auto rounded-full"
                        />
                        <h1 className="text-xl font-semibold text-foreground">
                          {props.getRoomChats.room.to?.name}
                        </h1>
                        <h1>@{props.getRoomChats.room.to?.username}</h1>

                        <h1>
                          CvSU
                          <span className="capitalize">
                            {" "}
                            {props.getRoomChats.room.to?.type}
                          </span>
                        </h1>
                        <h1>
                          {props.getRoomChats.room.to?.followers_length}{" "}
                          followers •{" "}
                          {props.getRoomChats.room.to?.followees_length}{" "}
                          followees
                        </h1>
                      </div>
                      <Link href={`/${props.getRoomChats.room.to?.username}`}>
                        <Button>View Profile</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div ref={scrollRef} />
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-end gap-2",
                    chat.user_id === props.current_user.id &&
                      "flex-row-reverse",
                  )}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Image
                        src={
                          props.current_user.id === chat.user_id
                            ? props.current_user.image_name
                              ? props.current_user.image_url
                              : "/default-avatar.jpg"
                            : chat.user.image_name
                              ? chat.user.image_url
                              : "/default-avatar.jpg"
                        }
                        width={32}
                        height={32}
                        alt="Profile picture"
                        className="rounded-full"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href={`/${chat.user.username}`}>
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div
                    className={cn(
                      "group flex flex-1 flex-col gap-y-1",
                      chat.user_id === props.current_user.id
                        ? "items-end"
                        : "items-start",
                    )}
                  >
                    <Link
                      href={`/${chat.user.username}`}
                      className="max-w-52 truncate text-xs text-muted-foreground opacity-0 group-hover:opacity-100 xs:max-w-60"
                    >
                      {chat.user.name} — {chat.user.username}
                    </Link>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex flex-col",
                            chat.user_id === props.current_user.id
                              ? "items-end"
                              : "items-start",
                          )}
                        >
                          {chat.reply && (
                            <Link
                              href={{
                                query: { chat_id: chat.reply.id },
                              }}
                              className="max-w-40 rounded-md bg-muted/50 p-2 text-start"
                            >
                              <p className="text-xs text-muted-foreground">
                                Reply to:
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {chat.reply.content}
                              </p>
                            </Link>
                          )}
                          <div
                            className={cn(
                              "flex items-center gap-2",
                              chat.user_id === props.current_user.id
                                ? "flex-row-reverse"
                                : "flex-row",
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-60 rounded-lg border bg-muted px-3 py-2 xs:max-w-72 sm:max-w-96",
                                searchParams.get("chat_id") === chat.id &&
                                  "border-primary",
                                chat.user_id === props.current_user.id
                                  ? "rounded-l-2xl rounded-br-none bg-primary text-white"
                                  : "rounded-r-2xl rounded-bl-none",
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words">
                                {chat.content}
                              </p>
                            </div>
                            {chat.status === "success" ? (
                              <div className="opacity-0 group-hover:opacity-100">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-8 rounded-full"
                                  onClick={() =>
                                    form.setValue("reply", {
                                      id: chat.id,
                                      content: chat.content,
                                      username: chat.user.username,
                                    })
                                  }
                                >
                                  <Reply className="size-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="rounded-full bg-muted p-2">
                                {sendMessageMutation.isError ? (
                                  <p className="px-1 text-[10px] font-medium text-red-500 dark:text-red-300">
                                    Sending failed
                                  </p>
                                ) : (
                                  <Icons.spinner className="size-4 animate-spin" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{format(chat.created_at, "Pp")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        )}
      </div>
      <div className="p-4">
        {form.watch("reply") && (
          <div className="flex items-center gap-2 rounded-t-md bg-muted px-4 py-2">
            <div className="flex-1">
              <p className="line-clamp-1 text-xs text-muted-foreground">
                Replying to - @{form.watch("reply.username")}
              </p>
              <p className="line-clamp-2 break-all text-xs text-secondary-foreground">
                {form.watch("reply.content")}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full"
              onClick={() => form.setValue("reply", undefined)}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                const id = v4();
                setChats((prev) => [
                  ...prev,
                  {
                    id,
                    content: values.message,
                    created_at: new Date().toISOString(),
                    user_id: props.current_user.id,
                    user: props.current_user,
                    status: "pending",
                    reply: values.reply
                      ? {
                          id: values.reply.id,
                          content: values.reply.content,
                          user_id: props.current_user.id,
                          created_at: new Date().toISOString(),
                          users: {
                            name: values.reply.username,
                            username: values.reply.username,
                          },
                        }
                      : null,
                  },
                ]);
                setIsScrollToBottom(true);
                form.reset();

                try {
                  const { id: new_chat_id } =
                    await sendMessageMutation.mutateAsync(
                      props.type === "room"
                        ? {
                            id,
                            type: props.type,
                            room_id: props.getRoomChats.room.id,
                            content: values.message,
                            reply_id: values.reply?.id,
                          }
                        : {
                            id,
                            type: props.type,
                            content: values.message,
                            reply_id: values.reply?.id,
                          },
                    );

                  setChats((prev) =>
                    prev.map((chat) =>
                      chat.id === new_chat_id
                        ? {
                            ...chat,
                            status: "success",
                          }
                        : chat,
                    ),
                  );
                } catch (error) {
                  return error;
                }
              })}
              className="w-full gap-x-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormMessage />
                    <div className="flex flex-1 items-center gap-2 space-y-0">
                      <FormControl>
                        <TextareaAutosize
                          {...field}
                          placeholder="Write a message..."
                          disabled={form.formState.isSubmitting}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              e.preventDefault();
                            }
                          }}
                          rows={1}
                          maxRows={3}
                          className="flex w-full flex-1 resize-none rounded-md border-input bg-background px-3 py-1.5 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <Button
                        type="submit"
                        size="icon"
                        variant="outline"
                        className="self-end"
                        disabled={
                          form.formState.isSubmitting ||
                          !form.formState.isValid ||
                          form.watch("message").trim().length === 0
                        }
                      >
                        {form.formState.isSubmitting ? (
                          <Icons.spinner className="size-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
