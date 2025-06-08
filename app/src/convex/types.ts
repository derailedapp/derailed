import type { Id } from "./_generated/dataModel";

export interface Profile {
    _id: Id<"profiles">;
    _creationTime: number;
    displayName?: string | undefined;
    avatarId?: Id<"_storage"> | undefined;
    bannerId?: Id<"_storage"> | undefined;
    status: string | undefined;
    account: Id<"users">;
    username: string;
    flags: bigint;
    avatarUrl: string;
    bannerUrl: string | undefined;
}