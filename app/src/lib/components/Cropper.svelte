<script lang="ts">
import { CropType } from "$lib/state";
import { addToast } from "$lib/state";
import { Slider } from "bits-ui";
import { Spinner, X } from "phosphor-svelte";
import Cropper, {
	type CropArea,
	type OnCropCompleteEvent,
} from "svelte-easy-crop";

let crop = $state({ x: 0, y: 0 });
let zoom = $state(1);
let croppedPixels: CropArea = $state({
	x: 0,
	y: 0,
	width: 0,
	height: 0,
});

const handleCropComplete = (data: OnCropCompleteEvent) => {
	croppedPixels = data.pixels;
};

const getCroppedImage = (): Promise<File | null> => {
	return new Promise((resolve) => {
		const canvas = document.createElement("canvas");
		if (!canvas) {
			return resolve(null);
		}

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return resolve(null);
		}

		const img = new Image();
		img.crossOrigin = "anonymous";
		img.src = image;

		img.onload = () => {
			canvas.width = croppedPixels.width;
			canvas.height = croppedPixels.height;

			ctx.drawImage(
				img,
				croppedPixels.x,
				croppedPixels.y,
				croppedPixels.width,
				croppedPixels.height,
				0,
				0,
				croppedPixels.width,
				croppedPixels.height,
			);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						return resolve(null);
					}

					resolve(
						new File([blob], "cropped.jpeg", {
							type: "image/jpeg",
						}),
					);
				},
				"image/jpeg",
				0.9,
			);
		};
	});
};

const Crop = async () => {
	const croppedFile = await getCroppedImage();

	if (croppedFile) {
		cropped(croppedFile, type);
	} else {
		addToast("error", "Failed to crop image", 3500);
	}
};

let {
	image,
	type,
	cropped,
	exit,
}: {
	image: string;
	type: CropType;
	cropped: (newImage: File, type: CropType) => void;
	exit: () => void;
} = $props();
</script>

<div class="flex flex-col justify-center items-center gap-4">
    <button class="self-end" onclick={exit}>
        <X class="size-5" />
    </button>
    {#if type == CropType.Banner}
        <div class="relative h-[350px] w-[980px]">
            <Cropper
                {image}
                bind:crop
                bind:zoom
                aspect={980 / 350}
                maxZoom={5}
                oncropcomplete={handleCropComplete}
            />
        </div>
    {:else}
        <div class="relative h-[400px] w-[400px]">
            <Cropper
                {image}
                bind:crop
                bind:zoom
                aspect={1 / 1}
                maxZoom={5}
                oncropcomplete={handleCropComplete}
            />
        </div>
    {/if}

    <Slider.Root
        type="single"
        min={1} 
        max={5} 
        step={1}
        bind:value={zoom}
        class="relative flex w-[400px] bg-slate-900 items-center"
    >
        <span class="bg-gray-400 relative h-2 w-full rounded-full">
            <Slider.Range class="bg-white absolute h-full rounded-full" />
        </span>
        <Slider.Thumb index={0} class="bg-white size-[25px] rounded-full border-2 border-black" />
    </Slider.Root>

    <button onclick={Crop} class="bg-blurple hover:bg-blurple/65 text-white px-4 rounded-4xl 
    transition-all duration-150 items-center gap-2 py-1">
		Submit
	</button>
</div>
