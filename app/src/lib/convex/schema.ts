import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,
	profiles: defineTable({
		account: v.id("users"),
		username: v.string(),
		displayName: v.optional(v.string()),
		avatarId: v.optional(v.string()),
		bannerId: v.optional(v.string()),
		flags: v.int64(),
	})
		.searchIndex("usernames", { searchField: "username" })
		.searchIndex("displayNames", { searchField: "displayName" }),
	relationships: defineTable({
		userId: v.id("users"),
		referencedUserId: v.id("users"),
		type: v.union(
			v.literal("following"),
			v.literal("followedBy"),
			v.literal("friends"),
			v.literal("blocked"),
			v.literal("blockedBy"),
		),
	}),
	channels: defineTable({
		type: v.union(v.literal("DM")),
		name: v.optional(v.string()),
		ownerId: v.optional(v.id("users")),
	}).searchIndex("channelName", {
		searchField: "name",
		filterFields: ["type", "ownerId"],
	}),
	channelMembers: defineTable({
		userId: v.id("users"),
		channelId: v.id("channels"),
	})
		.index("memberId", ["userId", "channelId"])
		.index("channelMembers", ["channelId"]),
	messages: defineTable({
		channelId: v.id("channels"),
		authorId: v.id("users"),
		content: v.optional(v.string()),
		lastModified: v.number(),
	}).index("messagesAndChannels", ["channelId"]),
	readStates: defineTable({
		channelId: v.id("channels"),
		lastMessageId: v.id("messages"),
		mentions: v.number(),
		userId: v.id("users"),
	}).index("userAndChannels", ["userId", "channelId"]),
	guilds: defineTable({
		ownerId: v.id("users"),
		name: v.string(),
		avatarId: v.optional(v.string()),
	}).searchIndex("guildName", {
		searchField: "name",
		filterFields: ["ownerId"],
	}),
	guildChannels: defineTable({
		channelId: v.id("channels"),
		guildId: v.id("guilds"),
		position: v.number(),
	})
		.index("channelPosition", ["guildId", "position"])
		.index("channelsInGuild", ["guildId"]),
});
