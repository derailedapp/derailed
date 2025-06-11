<script lang="ts">
import { Tabs, Checkbox } from "bits-ui";
import Icon from "@iconify/svelte";
import { fly } from "svelte/transition";
import { goto } from "$app/navigation";
import { onMount } from "svelte";

let username: string | undefined = $state();
let email: string | undefined = $state();
let password: string | undefined = $state();
let checked = $state(false);



async function onRegister(e: SubmitEvent) {
	e.preventDefault();

	if (!checked) {
		alert("You must agree to Derailed's Terms of Service and Privacy Policy.");
		return;
	}

	//await signIn("password", {
	//	email: email,
	//	password: password,
	//	flow: "signUp",
	//});

	goto("/app");
}

async function onLogin(e: SubmitEvent) {
	e.preventDefault();

	//await signIn("password", {
	//	email: email,
	//	password: password,
	//	flow: "signIn",
	//});

	goto("/app");
}

onMount(() => {
	if (localStorage.getItem("token")) {
		goto("/app");
	}
});
</script>

<div class="bg-[url('/login-bg.jpg')] w-full h-screen bg-center bg-cover">
    <div class="flex justify-center items-center h-full">
        <Tabs.Root value="login">
            <div class="flex justify-center items-center flex-col w-[450px] gap-1">
                <Tabs.List class="rounded-xl flex w-full justify-evenly items-center bg-sexy-red-black/80 backdrop-blur-3xl p-1">
                    <Tabs.Trigger value="login" class="text-white w-full rounded-lg p-2 data-[state=active]:bg-white/5 data-[state=active]:backdrop-blur-3xl">
                        Login
                    </Tabs.Trigger>
                    <Tabs.Trigger value="register" class="text-white w-full rounded-lg p-2 data-[state=active]:bg-white/5 data-[state=active]:backdrop-blur-3xl" >
                        Register
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="register" class="w-full h-full">
                    <form onsubmit={onRegister} class="w-full h-full flex flex-col items-center justify-center gap-6 bg-sexy-red-black/80 backdrop-blur-3xl p-6 rounded-2xl">
                        <div class="flex items-center gap-2">
                            <img src="/twemoji/1f44b.svg" width="24" height="24" alt="wave" />
                            <div class="font-bold text-2xl">
                                Welcome To Derailed!
                            </div>
                        </div>
                        <div class="flex flex-row justify-center items-center w-full">
                            <div class="flex items-center w-full" transition:fly={{ x: -500, duration: 50 }}>
                                <section class="space-y-2 w-full">
                                    <div class="font-bold text-sm text-weep-gray tracking-tight">
                                        EMAIL
                                    </div>
                                    <input required style="box-shadow: none;" bind:value={email} type="email" class="bg-transparent appearance-none w-full border-t-0 border-l-0 border-r-0 border-b border-b-sexy-red-gray" />
                                </section>
                            </div>
                        </div>
                        <div class="flex items-center w-full">
                            <section class="space-y-2 w-full">
                                <div class="font-bold text-sm text-weep-gray tracking-tight">
                                    PASSWORD
                                </div>
                                <input required style="box-shadow: none;" bind:value={password} type="password" class="bg-transparent appearance-none w-full border-t-0 border-l-0 border-r-0 border-b border-b-sexy-red-gray" />
                            </section>
                        </div>
                        <section class="flex flex-row items-center justify-center gap-2">
                            <Checkbox.Root bind:checked={checked} required indeterminate class="bg-black/50 outline-sexy-gray/20 outline-1 flex items-center p-1 rounded-md">
                                {#snippet children({ checked })}
                                    <div class="text-background inline-flex items-center justify-center">
                                        {#if checked}
                                            <Icon icon="material-symbols:check" width="15" height="15" />
                                        {:else}
                                            <Icon icon="ic:baseline-minus" width="15" height="15" />
                                        {/if}
                                    </div>
                                {/snippet}
                            </Checkbox.Root>
                            <div class="text-xs">
                                I agree to Derailed's <a href="/terms" class="inline text-blurple font-semibold">Terms of Service</a> and <a href="/privacy" class="inline font-semibold text-blurple">Privacy Policy</a>.
                            </div>
                        </section>
                        <button type="submit" class="w-full bg-blurple p-3 rounded-lg font-semibold">
                            Create an account
                        </button>
                    </form>
                </Tabs.Content>
                <Tabs.Content value="login" class="w-full h-full">
                    <form onsubmit={onLogin} class="w-full h-full flex flex-col items-center justify-center gap-6 bg-sexy-red-black/80 backdrop-blur-3xl p-6 rounded-2xl">
                        <div class="flex items-center gap-2">
                            <img src="/twemoji/1f44b.svg" width="24" height="24" alt="Wave" />
                            <div class="font-bold text-2xl">
                                Welcome Back!
                            </div>
                        </div>
                        <div class="flex items-center w-full">
                            <section class="space-y-2 w-full">
                                <div class="font-bold text-sm text-weep-gray tracking-tight">
                                    EMAIL
                                </div>
                                <input required style="box-shadow: none;" bind:value={email} type="email" class="bg-transparent appearance-none w-full border-t-0 border-l-0 border-r-0 border-b border-b-sexy-red-gray" />
                            </section>
                        </div>
                        <div class="flex items-center w-full">
                            <section class="space-y-2 w-full">
                                <div class="font-bold text-sm text-weep-gray tracking-tight">
                                    PASSWORD
                                </div>
                                <input required style="box-shadow: none;" bind:value={password} type="password" class="bg-transparent appearance-none w-full border-t-0 border-l-0 border-r-0 border-b border-b-sexy-red-gray" />
                            </section>
                        </div>
                        <button type="submit" class="w-full bg-blurple p-3 rounded-lg font-semibold">
                            Login
                        </button>
                    </form>
                </Tabs.Content>
            </div>
        </Tabs.Root>
    </div>
</div>
