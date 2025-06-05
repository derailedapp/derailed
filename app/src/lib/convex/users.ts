import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProfile = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("account"), args.userId))
			.first()) as {
			_id: Id<"profiles">;
			_creationTime: number;
			displayName?: string | undefined;
			avatarId?: string | undefined;
			bannerId?: string | undefined;
			account: Id<"users">;
			username: string;
			flags: bigint;
			avatarUrl: string | undefined;
			bannerUrl: string | undefined;
		} | null;
		if (!user) {
			throw new Error("User does not exist");
		}
		if (user.avatarId) {
			user.avatarUrl = (await ctx.storage.getUrl(
				user.avatarId as Id<"_storage">,
			)) as string | undefined;
		}
		if (user.bannerId) {
			user.bannerUrl = (await ctx.storage.getUrl(
				user.bannerId as Id<"_storage">,
			)) as string | undefined;
		}

		return user;
	},
});

export const getCurrentProfile = query({
	args: {},
	handler: async (ctx, _) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}
		console.log(identity);
		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("account"), identity))
			.first()!) as {
			_id: Id<"profiles">;
			_creationTime: number;
			displayName?: string | undefined;
			avatarId?: string | undefined;
			bannerId?: string | undefined;
			account: Id<"users">;
			username: string;
			flags: bigint;
			avatarUrl: string | undefined;
			bannerUrl: string | undefined;
		};
		if (user.avatarId) {
			user.avatarUrl = (await ctx.storage.getUrl(
				user.avatarId as Id<"_storage">,
			)) as string | undefined;
		}
		if (user.bannerId) {
			user.bannerUrl = (await ctx.storage.getUrl(
				user.bannerId as Id<"_storage">,
			)) as string | undefined;
		}
		return user;
	},
});

export const getEmail = query({
	args: {},
	handler: async (ctx, _) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Route requires authentication");
		}
		return identity.email!;
	},
});

export const follow = mutation({
	args: { username: v.string() },
	handler: async (ctx, args) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}
		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("username"), args.username))
			.first()) as {
			_id: Id<"profiles">;
			_creationTime: number;
			displayName?: string | undefined;
			avatarId?: string | undefined;
			bannerId?: string | undefined;
			account: Id<"users">;
			username: string;
			flags: bigint;
			avatarUrl: string | undefined;
			bannerUrl: string | undefined;
		} | null;

		if (!user) {
			throw new Error("User does not exist");
		}

		if (user?.account == identity) {
			throw new Error("Can't follow yourself");
		}

		if (user.avatarId) {
			user.avatarUrl = (await ctx.storage.getUrl(
				user.avatarId as Id<"_storage">,
			)) as string | undefined;
		}
		if (user.bannerId) {
			user.bannerUrl = (await ctx.storage.getUrl(
				user.bannerId as Id<"_storage">,
			)) as string | undefined;
		}
		const relation = await ctx.db
			.query("relationships")
			.filter((q) =>
				q.and(
					q.eq(q.field("userId"), identity),
					q.eq(q.field("referencedUserId"), user.account),
				),
			)
			.first();

		if (relation?.type == "followedBy") {
			await ctx.db.patch(relation._id, { type: "friends" });
		} else if (relation?.type == "blocked" || relation?.type == "blockedBy") {
			throw new Error("User has blocked is blocked by you");
		} else {
			throw new Error("You already follow or are friends with this user");
		}

		return user;
	},
});
