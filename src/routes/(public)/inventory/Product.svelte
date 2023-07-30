<script lang="ts">
	import type { CrazyProduct } from '../../customTypes';
	import { fade } from 'svelte/transition';
	import { firebaseStore, selectedProductStore } from '../../customStores';
	import { getDownloadURL, ref } from 'firebase/storage';
	import { goto } from '$app/navigation';

	export let productObject: CrazyProduct;
	export let viewSold: boolean;

	let imageUrl: string = '';
	let primaryImageLoaded: boolean = false;
	let primaryPhotoFilename: string = '';

	productObject.photos.forEach((photo) => {
		if (photo.primary) {
			primaryPhotoFilename = photo.filename;
		}
	});

	let soldOrAvailable = productObject.status ? 'available' : 'sold';

	const imageStorageReference = ref(
		$firebaseStore.storage,
		'inventory/' + productObject.id + '/' + primaryPhotoFilename
	);

	async function setImageUrl() {
		imageUrl = await getDownloadURL(imageStorageReference);
		primaryImageLoaded = true;
	}

	setImageUrl();

	async function goToProductPage(product: CrazyProduct) {
		selectedProductStore.set(product);

		await goto('/inventory/' + soldOrAvailable + '/' + product.name);
	}
</script>

<button
	on:click={() => {
		goToProductPage(productObject);
	}}
	class="container"
	class:show={productObject.status != viewSold}
>
	{#if primaryImageLoaded}
		<img src={imageUrl} alt={productObject.name} in:fade={{ duration: 500 }} />
	{/if}

	<div class="image-placeholder active" />

	<p class="name">{productObject.name}</p>
	{#if productObject.status}
		<p class="price">${productObject.price}.00</p>
	{/if}
</button>

<style>
	.container {
		position: relative;
		display: none;
		transition: all 0.5s;
	}
	.container.show {
		display: block;
	}
	img {
		position: absolute;
		width: 100%;
	}
	.image-placeholder {
		width: 100%;
	}
	.name {
		text-align: center;
		font-family: lato-regular;
		font-size: 14px;
	}
	.price {
		text-align: center;
		font-family: lato-lightitalic;
		font-size: 10px;
	}
	.image-placeholder.active {
		animation-duration: 4.2s;
		animation-fill-mode: forwards;
		animation-iteration-count: infinite;
		animation-name: shimmer;
		animation-timing-function: linear;
		background: hsl(var(--b3));
		background: linear-gradient(to right, #eaeaea 8%, #f6f6f6 18%, #eaeaea 33%) fixed;
		background-size: 1200px 100%;
		width: 100%;
		padding-bottom: 100%;
		border-radius: 2px;
		/* position: absolute; */
		display: block;
	}
	@-webkit-keyframes shimmer {
		0% {
			background-position: -100% 0;
		}
		100% {
			background-position: 100% 0;
		}
	}
	@keyframes shimmer {
		0% {
			background-position: -1200px 0;
		}
		100% {
			background-position: 1200px 0;
		}
	}
</style>
