import { users, tracks, follows } from "~/schema";
import { db, getUser } from "~/database";
import { and, eq, sql } from "drizzle-orm";
import { Metadata } from "next";
import DefaultBanner from "./DEFAULT_BANNER.jpg";
import DefaultAvatar from "./DEFAULT_AVATAR.jpg";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Profile from "./profile";
import TracksList from "./trackslist";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const { username } = params;

  const usrs = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (usrs.length !== 1) {
    return {
      title: "Derailed - Talk Anyway, Anywhere, with Anyone",
      description: "Couldn&apos;t find this user on Derailed.",
    };
  }

  const user = usrs[0];

  return {
    title: `${user.username} - Derailed`,
    description: `${user.display_name || user.username} on Derailed: ${user.bio || "is using Derailed to communicate to anyone, anywhere, anyway they like."}`,
  };
}

export default async function User({
  params,
}: {
  params: { username: string };
}) {
  var currentUser: {
    id: number;
    username: string;
    display_name: string | null;
    avatar: string | null;
    banner: string | null;
    bio: string | null;
  };

  if (cookies().get("USER_TOKEN")) {
    const u = await getUser(cookies().get("USER_TOKEN")!.value);

    if (u === false || u === true) {
      cookies().delete("USER_TOKEN");
      redirect("/login");
    }
    // @ts-ignore
    u.password = undefined;
    currentUser = u;
  } else {
    redirect("/register");
  }

  const { username } = params;

  const usrs = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (usrs.length !== 1) {
    // TODO: 404 page
    return <main>Couldn&apos;t find that user, sorry.</main>;
  }

  const user = usrs[0];

  // @ts-ignore
  user.password = undefined;

  var avatarUrl;

  if (user.avatar) {
    avatarUrl = `${process.env.NEXT_PUBLIC_CDN_URL}/${user.avatar}`;
  } else {
    avatarUrl = DefaultAvatar;
  }

  var bannerUrl;

  if (user.banner) {
    bannerUrl = `${process.env.NEXT_PUBLIC_CDN_URL}/${user.banner}`;
  } else {
    bannerUrl = DefaultBanner;
  }

  const following = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(follows)
    .where(eq(follows.origin_user_id, user.id));

  const followers = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(follows)
    .where(eq(follows.target_user_id, user.id));

  const tracksNum = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(tracks)
    .where(eq(tracks.author_id, user.id));

  const isFollowing = await (async (currentUser: any) => {
    const a = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.origin_user_id, currentUser.id),
          eq(follows.target_user_id, user.id),
        ),
      );
    return a.length === 1;
  })(currentUser);

  const tracksDig = [
    {
      id: "01HND86PCJ0ADFGSRAG1J698HH",
      author_id: "01HND86PCJ0ADFGSRAG1J698HH",
      content: "Welcome Derailed.",
      referenced_track_id: null,
      retrack: false,
    },
    {
      id: "01HND86PCJ0ADFGSRAG1J698HH",
      author_id: "01HND86PCJ0ADFGSRAG1J698HH",
      content: "Welcome Derailed.",
      referenced_track_id: null,
      retrack: false,
    },
    {
      id: "01HND86PCJ0ADFGSRAG1J698HH",
      author_id: "01HND86PCJ0ADFGSRAG1J698HH",
      content: "Welcome Derailed.",
      referenced_track_id: null,
      retrack: false,
    },
    {
      id: "01HNPVYAHVBZGVHHK47BX4H9W7",
      author_id: "01HND86PCJ0ADFGSRAG1J698HH",
      content:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa..",
      referenced_track_id: null,
      retrack: false,
    },
    {
      id: "01HNPW4Y82JRA484S38JQCWYTK",
      author_id: "01HND86PCJ0ADFGSRAG1J698HH",
      content: "Yeah, welcome I guess.",
      referenced_track_id: "01HNPVYAHVBZGVHHK47BX4H9W7",
      retrack: true,
    },
  ].sort((a, b) => {
    if (a.id > b.id) {
      return -1;
    } else {
      return 1;
    }
  });

  const referencedTracks = new Map();
  referencedTracks.set("01HNPVYAHVBZGVHHK47BX4H9W7", {
    id: "01HNPVYAHVBZGVHHK47BX4H9W7",
    author_id: "01HND86PCJ0ADFGSRAG1J698HH",
    content: "Welcome Derailed.",
    referenced_track_id: null,
    retrack: false,
  });

  return (
    <main className="flex justify-center bg-not-quite-black text-white">
      <div className="flex flex-col justify-center pt-10 gap-10">
        <Profile
          bannerUrl={bannerUrl}
          avatarUrl={avatarUrl}
          user={user}
          isCurrentUser={currentUser.id === user.id}
          isFollowing={isFollowing}
          followingCount={following[0].count}
          followerCount={followers[0].count}
          tracksCount={tracksNum[0].count}
        />
        <TracksList
          tracksPosted={tracksDig}
          trackRefs={referencedTracks}
          authors={new Map().set(user.id, user)}
        />
      </div>
    </main>
  );
}
