import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

import { type Profile } from "./types";

export const getProfile = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("account"), args.userId))
			.first()) as Profile | null;

		if (!user) {
			throw new Error("User does not exist");
		}
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
	},
});

export const getCurrentProfile = query({
	args: {},
	handler: async (ctx, _) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}

		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("account"), identity))
			.first()!) as Profile;

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
	},
});

export const getEmail = query({
	args: {},
	handler: async (ctx, _) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}
		const user = await ctx.db
			.get(identity);

		return user!.email;
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
			.first()) as Profile | null;

		if (!user) {
			throw new Error("User does not exist");
		}

		if (user?.account == identity) {
			throw new Error("Can't follow yourself");
		}

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
			const chats = await ctx.db
				.query("channelMembers")
				.filter((q) =>
					q.or(
						q.eq(q.field("userId"), identity),
						q.eq(q.field("userId"), user.account),
					),
				)
				.collect();
			const channel = await ctx.db
				.query("channels")
				.filter((q) =>
					q.and(
						q.eq(q.field("type"), "DM"),
						q.or(...chats.map((v) => q.eq(q.field("_id"), v.channelId))),
					),
				)
				.first();
			if (!channel) {
				const channel = await ctx.db.insert("channels", {
					type: "DM",
					lastMessageId: ""
				});
				await ctx.db.insert("channelMembers", {
					userId: identity,
					channelId: channel,
				});
				await ctx.db.insert("channelMembers", {
					userId: user.account,
					channelId: channel,
				});
			}
		} else if (relation?.type == "blocked" || relation?.type == "blockedBy") {
			throw new Error("User has blocked is blocked by you");
		} else if (relation?.type == "following" || relation?.type == "friends") {
			throw new Error("You already follow or are friends with this user");
		} else {
			await ctx.db.insert("relationships", {
				type: "following",
				userId: identity,
				referencedUserId: user.account,
			});
			await ctx.db.insert("relationships", {
				type: "followedBy",
				userId: user.account,
				referencedUserId: identity,
			});
		}

		return user;
	},
});

export const modifyProfile = mutation({
	args: { 
		displayName: v.optional(v.string()), 
		username: v.optional(v.string()),
		status: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}
		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("account"), identity))
			.first()!) as Profile;

		await ctx.db.patch(user._id, {
			displayName: args.displayName
		});

		// TODO: current password check
		if (args.username) {
			await ctx.db.patch(user._id, {
				username: args.username
			});
		}
	}
})

export const modifyStatus = mutation({
	args: { status: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}
		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("account"), identity))
			.first()!) as Profile;

		if (args.status && args.status.length > 100) {
			throw new Error("Status is too long, max 100 characters.");
		}

		await ctx.db.patch(user._id, {
			status: args.status
		});
	}
})

export const getUploadURL = mutation({
	handler: async (ctx, _) => {
		return ctx.storage.generateUploadUrl();
	}
})

export const setAvatarID = mutation({
	args: { id: v.string() },
	handler: async (ctx, args) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}

		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("account"), identity))
			.first()!) as Profile;
		
		if (user.avatarId) {
			await ctx.storage.delete(user.avatarId)
		}
		
		await ctx.db.patch(user._id, {
			avatarId: args.id
		})
	}
})

export const setBannerID = mutation({
	args: { id: v.string() },
	handler: async (ctx, args) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}

		let user = (await ctx.db
			.query("profiles")
			.filter((q) => q.eq(q.field("account"), identity))
			.first()!) as Profile;

		if (user.bannerId) {
			await ctx.storage.delete(user.bannerId)
		}

		await ctx.db.patch(user._id, {
			bannerId: args.id
		})
	}
});


export const getFriends = query({
	args: {},
	handler: async (ctx, args) => {
		const identity = await getAuthUserId(ctx);
		if (!identity) {
			throw new Error("Route requires authentication");
		}

		let relationships = (await ctx.db
			.query("relationships")
			.filter((q) => q.and(q.eq(q.field("userId"), identity), q.eq(q.field("type"), "friends")))
			.collect()
		)

		const users = relationships.map(async (u) => {
			let user = (await ctx.db
				.query("profiles")
				.filter((q) => q.eq(q.field("account"), u.referencedUserId))
				.first()!) as Profile;

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
		});
		return await Promise.all(users);
	}
})
