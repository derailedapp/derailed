import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getJoined = query({
	args: {},
	handler: async (ctx, _) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}

		const memberships = await ctx.db
			.query("channelMembers")
			.filter((q) => q.eq(q.field("userId"), identity))
			.collect();
		const channels = await (Promise.all(
			memberships.map((mem) => ctx.db.get(mem.channelId)),
		) as Promise<
			{
				_id: Id<"channels">;
				_creationTime: number;
				name?: string | undefined;
				ownerId?: Id<"users"> | undefined;
				type: "DM";
			}[]
		>);

		return channels;
	},
});

export const get = query({
	args: { id: v.id("channels") },
	handler: async (ctx, args) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}
		const membership = await ctx.db
			.query("channelMembers")
			.filter((q) =>
				q.and(
					q.eq(q.field("userId"), identity),
					q.eq(q.field("channelId"), args.id),
				),
			)
			.first();

		if (!membership) {
			throw new Error("Channel does not exist or you are not a member");
		}

		return await ctx.db.get(args.id)!;
	},
});

export const getMembers = query({
	args: { id: v.id("channels") },
	handler: async (ctx, args) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}

		const membership = await ctx.db
			.query("channelMembers")
			.filter((q) =>
				q.and(
					q.eq(q.field("userId"), identity),
					q.eq(q.field("channelId"), args.id),
				),
			)
			.first();

		if (!membership) {
			throw new Error("Channel does not exist or you are not a member");
		}

		const memberships = await ctx.db
			.query("channelMembers")
			.filter((q) => q.eq(q.field("channelId"), args.id))
			.collect();
		const profiles = await (Promise.all(
			memberships.map((u) =>
				ctx.db
					.query("profiles")
					.filter((q) => q.eq(q.field("account"), u.userId))
					.first(),
			),
		) as Promise<
			{
				_id: Id<"profiles">;
				_creationTime: number;
				displayName?: string | undefined;
				avatarId?: string | undefined;
				bannerId?: string | undefined;
				avatarUrl: string;
				bannerUrl?: string | undefined;
				account: Id<"users">;
				username: string;
				flags: bigint;
			}[]
		>);

		return Promise.all(
			profiles.map(async (user) => {
				if (user.avatarId) {
					user.avatarUrl = (await ctx.storage.getUrl(
						user.avatarId as Id<"_storage">,
					)) as string;
				} else {
					user.avatarUrl = "/default_pfp.webp";
				}
				if (user.bannerId) {
					user.bannerUrl = (await ctx.storage.getUrl(
						user.bannerId as Id<"_storage">,
					)) as string | undefined;
				}
				return user;
			}),
		);
	},
});
