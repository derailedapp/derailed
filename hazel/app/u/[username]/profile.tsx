"use client";

import { useState } from "react";
import { followAction, unfollowAction } from "~/actions/following";
import Image from "next/image";
import moment from "moment";

export default function Profile(props: {
  bannerUrl: any;
  avatarUrl: any;
  user: {
    id: number;
    username: string;
    display_name: string | null;
    avatar: string | null;
    banner: string | null;
    bio: string | null;
  };
  isCurrentUser: boolean;
  isFollowing: boolean;
  followingCount: number;
  followerCount: number;
  tracksCount: number;
}) {
  const {
    bannerUrl,
    avatarUrl,
    user,
    isCurrentUser,
    isFollowing,
    followerCount,
    followingCount,
    tracksCount,
  } = props;

  const [following, setFollowing] = useState(isFollowing);

  return (
    <div className="flex flex-col justify-center">
      <Image
        src={bannerUrl}
        alt="Banner"
        className="rounded-lg w-full h-[224px]"
      />
      <div className="flex flex-row pt-5 pb-5 justify-between px-5">
        <div className="flex gap-4">
          <Image
            src={avatarUrl}
            width={128}
            height={128}
            alt="Avatar"
            className="rounded-3xl border-white/50 h-[128px]"
          />
          <div className="flex flex-col justify-center gap-3">
            <div className="flex flex-col">
              <h1 className="font-bold text-2xl">
                {user.display_name || user.username}
              </h1>
              <h3 className="text-lg font-extralight text-white/55">
                @{user.username}
              </h3>
            </div>
            <h2 className="max-w-md text-balance w-[28rem]">
              {user.bio || "This user has no bio."}
            </h2>
          </div>
        </div>
        {!isCurrentUser &&
          (following ? (
            <button
              className="rounded-lg bg-white/60 m-auto py-2 px-4 font-semibold"
              onClick={async () => {
                await unfollowAction(user);
                setFollowing(false);
              }}
            >
              Unfollow
            </button>
          ) : (
            <button
              className="rounded-lg bg-blurple m-auto py-2 px-4 font-semibold"
              onClick={async () => {
                await followAction(user);
                setFollowing(true);
              }}
            >
              Follow
            </button>
          ))}
      </div>
      <div className="flex text-white font-light justify-between mx-5">
        <span>
          {followingCount} <span className="text-white/60">Following</span>
        </span>
        <span>
          {followerCount} <span className="text-white/60">Followers</span>
        </span>
        <span>
          {tracksCount} <span className="text-white/60">Tracks</span>
        </span>
        <span>
          Joined on{" "}
          <span className="text-white/60">
            {moment((user.id >> 22) + 1704067200000).format("MMMM D, YYYY")}
          </span>
        </span>
      </div>
    </div>
  );
}
