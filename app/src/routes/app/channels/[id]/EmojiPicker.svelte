<script lang="ts">
import { DropdownMenu } from "bits-ui";
import {
	Bicycle,
	BowlFood,
	FlagBannerFold,
	Heart,
	Joystick,
	LampPendant,
	Leaf,
	Smiley,
} from "phosphor-svelte";
import emojis from "./emojis-by-group.json";
import { $getSelection as getSelection } from "svelte-lexical";
import type { Composer } from "svelte-lexical";
import { $isRangeSelection as isRangeSelection } from "lexical";

const { composer }: { composer: Composer | undefined } = $props();

let hoveredEmoji: string | null = $state(null);

const scrollToGroup = (groupName: string) => {
	const element = document.getElementById(groupName);

	if (element) {
		element.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	}
};
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <Smiley weight="fill" class="h-5 w-5 text-weep-gray hover:text-weep-gray/85 hover:scale-110 transition duration-300 ease-in-out" />
    </DropdownMenu.Trigger>

    <DropdownMenu.Content side="left" class="w-[500px] border-tertiary-bg border mb-20 rounded-3xl bg-secondary-bg">
        <div class="flex flex-col w-full">
            <div class="font-semibold border-b pb-2 p-4 text-weep-gray border-tertiary-bg select-none">
                Emojis
            </div>
            <div class="flex items-center flex-row h-full max-h-[293px]">
                <div class="flex items-center h-full p-4 border-tertiary-bg flex-col gap-2.5 border-r select-none">
                    <button onclick={() => scrollToGroup("Smileys & Emotion")}>
                        <Smiley weight="fill" class="h-6 w-6 text-weep-gray hover:text-weep-gray/70 hover:shadow-3xl transition duration-300 ease-in-out" />
                    </button>
                    <button onclick={() => scrollToGroup("Animals & Nature")}>
                        <Leaf weight="fill" class="h-6 w-6 text-weep-gray hover:text-weep-gray/70 hover:shadow-3xl transition duration-300 ease-in-out" />
                    </button>
                    <button onclick={() => scrollToGroup("Food & Drink")}>
                        <BowlFood weight="fill" class="h-6 w-6 text-weep-gray hover:text-weep-gray/70 hover:shadow-3xl transition duration-300 ease-in-out" />
                    </button>
                    <button onclick={() => scrollToGroup("Travel & Places")}>
                        <Joystick weight="fill" class="h-6 w-6 text-weep-gray hover:text-weep-gray/70 hover:shadow-3xl transition duration-300 ease-in-out" />
                    </button>
                    <button onclick={() => scrollToGroup("Activities")}>
                        <Bicycle weight="fill" class="h-6 w-6 text-weep-gray hover:text-weep-gray/70 hover:shadow-3xl transition duration-300 ease-in-out" />
                    </button>
                    <button onclick={() => scrollToGroup("Objects")}>
                        <LampPendant weight="fill" class="h-6 w-6 text-weep-gray hover:text-weep-gray/70 hover:shadow-3xl transition duration-300 ease-in-out" />
                    </button>
                    <button onclick={() => scrollToGroup("Symbols")}>
                        <Heart weight="fill" class="h-6 w-6 text-weep-gray hover:text-weep-gray/70 hover:shadow-3xl transition duration-300 ease-in-out" />
                    </button>
                    <button onclick={() => scrollToGroup("Flags")}>
                        <FlagBannerFold weight="fill" class="h-6 w-6 text-weep-gray hover:text-weep-gray/70 hover:shadow-3xl transition duration-300 ease-in-out" />
                    </button>
                </div>
                <div class="flex flex-col gap-6 py-3.5 overflow-y-auto max-h-[293px] w-full">
                    {#each emojis as group}
                        <div class="space-y-3" id={group.name}>
                            <div class="tracking-tight ml-3 select-none text-weep-gray font-semibold">
                                {group.name}
                            </div>
                            <ul class="w-full grid grid-cols-8 px-1.5">
                                {#each group.emojis as emoji}
                                    <li id={emoji.emoji} onmouseover={(e) => {
                                        e.preventDefault();
                                        hoveredEmoji = emoji.emoji;
                                    }} onfocus={(e) => {
                                        e.preventDefault();
                                        hoveredEmoji = emoji.emoji;
                                    }} class='select-none'>
                                        <button  onclick={(e) => {
                                        e.preventDefault();
                                        const editor = composer?.getEditor();
                                        if (editor) {
                                            editor.update(() => {
                                                const selection = getSelection();
                                                if (isRangeSelection(selection)) {
                                                    selection.insertText(emoji.emoji)
                                                }
                                            });
                                        }
                                    }}>
                                            <img loading="lazy" alt={emoji.name} src={`/twemoji/${emoji.emoji.codePointAt(0)!.toString(16)}.svg`} class="h-13 text-xs w-auto hover:bg-inps px-1 py-1.5 transition rounded-md duration-300 ease-in-out" />
                                        </button>
                                    </li>
                                {/each}
                                </ul>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </DropdownMenu.Content>
</DropdownMenu.Root>