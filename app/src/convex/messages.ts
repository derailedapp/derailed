import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createInPrivateChannel = mutation({
	args: { channelId: v.id("channels"), content: v.string() },
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

		const message = await ctx.db.insert("messages", {
			content: args.content,
			channelId: args.channelId,
			authorId: identity,
			lastModified: Date.now(),
		});
		const readState = await ctx.db
			.query("readStates")
			.filter((q) =>
				q.and(
					q.eq(q.field("channelId"), args.channelId),
					q.eq(q.field("userId"), identity),
				),
			)
			.first();
		if (!readState) {
			await ctx.db.insert("readStates", {
				userId: identity,
				channelId: args.channelId,
				lastMessageId: message,
				mentions: 0,
			});
		} else {
			await ctx.db.patch(readState._id, {
				lastMessageId: message,
				mentions: 0,
			});
		}

		return await ctx.db.get(message);
	},
});

export const updateInPrivateChannel = mutation({
	args: {
		channelId: v.id("channels"),
		id: v.id("messages"),
		content: v.optional(v.string()),
	},
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

		const message = await ctx.db.get(args.id);
		if (!message) {
			throw new Error("Message does not exist");
		}
		if (message.authorId != identity) {
			throw new Error("Message is not authored by user");
		}

		if (message.content) {
			await ctx.db.patch(args.id, {
				content: message.content,
				lastModified: Date.now(),
			});
		}

		return message;
	},
});

export const deleteFromPrivateChannel = mutation({
	args: { channelId: v.id("channels"), id: v.id("messages") },
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

		const message = await ctx.db.get(args.id);
		if (!message) {
			throw new Error("Message does not exist");
		}
		if (message.authorId != identity) {
			throw new Error("Message is not authored by user");
		}
		await ctx.db.delete(args.id);
	},
});

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
