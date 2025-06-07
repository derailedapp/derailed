import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server";

export const getReadState = query({
    args: { id: v.string() },
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

        return await ctx.db
            .query("readStates")
            .filter((q) => q.and(q.eq(q.field("channelId"), args.id), q.eq(q.field("userId"), identity)))
            .first();
    }
});

export const read = mutation({
    args: { channelId: v.id("channels"), messageId: v.id("messages") },
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

        const readState = await ctx.db
            .query("readStates")
            .filter((q) => q.and(q.eq(q.field("channelId"), args.channelId), q.eq(q.field("userId"), identity)))
            .first();

        if (!readState) {
            await ctx.db.insert("readStates", {
                userId: identity,
                channelId: args.channelId,
                lastMessageId: args.messageId,
                mentions: 0
            })
        } else {
            await ctx.db.patch(readState._id, { lastMessageId: args.messageId })
        }
    }
})
