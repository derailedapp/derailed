import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const newest = query({
	args: { channelId: v.id("channels") },
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
					q.eq(q.field("channelId"), args.channelId),
				),
			)
			.first();

		if (!membership) {
			throw new Error("Channel does not exist or you are not a member");
		}

		return (
			await ctx.db
				.query("messages")
				.filter((q) => q.eq(q.field("channelId"), args.channelId))
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const after = query({
	args: { channelId: v.id("channels"), after: v.id("messages") },
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
					q.eq(q.field("channelId"), args.channelId),
				),
			)
			.first();

		if (!membership) {
			throw new Error("Channel does not exist or you are not a member");
		}

		return (
			await ctx.db
				.query("messages")
				.filter((q) =>
					q.and(
						q.eq(q.field("channelId"), args.channelId),
						q.gt(q.field("_id"), args.after),
					),
				)
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const before = query({
	args: { channelId: v.id("channels"), before: v.id("messages") },
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
					q.eq(q.field("channelId"), args.channelId),
				),
			)
			.first();

		if (!membership) {
			throw new Error("Channel does not exist or you are not a member");
		}

		return (
			await ctx.db
				.query("messages")
				.filter((q) =>
					q.and(
						q.eq(q.field("channelId"), args.channelId),
						q.lt(q.field("_id"), args.before),
					),
				)
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const around = query({
	args: { channelId: v.id("channels"), around: v.id("messages") },
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
					q.eq(q.field("channelId"), args.channelId),
				),
			)
			.first();

		if (!membership) {
			throw new Error("Channel does not exist or you are not a member");
		}

		const segment1 = await ctx.db
			.query("messages")
			.filter((q) =>
				q.and(
					q.eq(q.field("channelId"), args.channelId),
					q.lt(q.field("_id"), args.around),
				),
			)
			.order("desc")
			.take(25);
		const segment2 = await ctx.db
			.query("messages")
			.filter((q) =>
				q.and(
					q.eq(q.field("channelId"), args.channelId),
					q.gt(q.field("_id"), args.around),
				),
			)
			.order("desc")
			.take(25);
		return segment1.concat(segment2);
	},
});
