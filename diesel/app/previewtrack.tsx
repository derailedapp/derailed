"use client";

import Image from "next/image";
import DefaultAvatar from "./u/[username]/DEFAULT_AVATAR.jpg";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function PreviewTrack(props: {
  author: {
    id: number;
    username: string;
    display_name: string | null;
    avatar: string | null;
    banner: string | null;
    bio: string | null;
  };
  track: {
    id: number;
    author_id: string;
    content: string;
    referenced_track_id: string | null;
    retrack: boolean;
  };
  trackRef:
    | {
        id: number;
        author_id: string;
        content: string;
        referenced_track_id: string | null;
        retrack: boolean;
      }
    | undefined;
}) {
  const { author, track, trackRef } = props;

  var avatarUrl;

  if (author.avatar) {
    avatarUrl = `${process.env.NEXT_PUBLIC_CDN_URL}/${author.avatar}`;
  } else {
    avatarUrl = DefaultAvatar;
  }

  if (track.content.length >= 100) {
    track.content = track.content.slice(0, 99).trimEnd() + "...";
  }

  const router = useRouter();

  return (
    <article className="flex flex-row gap-2 p-3 hover:bg-nightly-black bg-not-as-black rounded-md cursor-pointer">
      <Image
        src={avatarUrl}
        width={64}
        height={64}
        alt="Avatar"
        className="h-[64px] w-[64px] rounded-3xl"
      />
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-2">
          <a
            href={`/@${author.username}`}
            className="text-white font-semibold text-xl hover:underline"
          >
            {author.display_name || author.username}
          </a>
          <span className="text-white/60 font-extralight text-lg">
            · @{author.username}
          </span>
          <h3 className="text-white/60 font-extralight text-lg">
            · {moment((track.id >> 22) + 1704067200000).fromNow()}
          </h3>
        </div>
        <p
          className="font-light text-xl max-w-xl"
          onClick={() => router.push(`/tracks/${track.id}`)}
        >
          {track.content}
        </p>
      </div>
    </article>
  );
}
