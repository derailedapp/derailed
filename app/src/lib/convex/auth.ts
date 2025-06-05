import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
// import Passkey from "@auth/core/providers/passkey";
import randomName from "@scaleway/random-name";

export const { auth, signOut, signIn, store, isAuthenticated } = convexAuth({
	providers: [Password /*Passkey */],
	callbacks: {
		async afterUserCreatedOrUpdated(ctx, args) {
			if (!args.existingUserId) {
				await ctx.db.insert("profiles", {
					account: args.userId,
					username: randomName("", "_"),
					displayName: undefined,
					avatarId: undefined,
					bannerId: undefined,
					flags: BigInt(0),
				});
			}
		},
	},
});
