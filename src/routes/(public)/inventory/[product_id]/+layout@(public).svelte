<script lang="ts">
	import type { CrazyProduct } from '../../../customTypes';
	import { firebaseStore, inventoryStore, alertStore } from '../../../customStores';
	import type { PageData } from './$types';
	import { getDownloadURL, ref } from 'firebase/storage';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	let data: CrazyProduct;
	let dataLoaded = false;
	let photoSrcListPopulated = false;
	let photoRetrieveStarted = false;
	let photoSrcList: string[] = [];
	let focusedPhotoSrc: string = '';

	let generatingLink = false;

	onMount(awaitInventoryStoreUpdate);

	inventoryStore.subscribe((storeData) => {
		awaitInventoryStoreUpdate();
	});

	function awaitInventoryStoreUpdate() {
		// inventoryStore takes time to load data from firestore
		if ($inventoryStore == undefined) {
			setTimeout(awaitInventoryStoreUpdate, 500);
			return;
		}
		let productName = $page.params.product_id;
		for (let product of $inventoryStore) {
			if (product.name == productName) {
				data = product;
				dataLoaded = true;
				if (!photoRetrieveStarted) {
					photoRetrieveStarted = true;
					getPhotoUrls(product);
				}
			}
		}
	}

	async function getPhotoUrls(loadedProduct: CrazyProduct) {
		//console.log('running get photo urls');
		photoSrcList = [];
		photoSrcListPopulated = false;
		for (let photoObject of loadedProduct.photos) {
			//console.log(loadedProduct.photos);
			const imageStorageReference = ref(
				$firebaseStore.storage,
				'inventory/' + loadedProduct.id + '/' + photoObject.filename
			);

			let srcUrl = await getDownloadURL(imageStorageReference);

			if (photoObject.primary) {
				focusedPhotoSrc = srcUrl;
			}

			photoSrcList = [...photoSrcList, srcUrl];
		}
		//console.log(photoSrcList);
		photoSrcListPopulated = true;
	}

	async function goToPayment() {
		if (generatingLink) return;
		generatingLink = true;

		try {
			// send the product name, price for now
			let serverRequest = await fetch('/api/payment-page', {
				method: 'POST',
				body: JSON.stringify({
					payload: {
						name: data.name,
						price: data.price
					}
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let response = await serverRequest.json();
			console.log(response);

			if (response.error) {
				console.log(response);
				// handle error
				alertStore.set({
					show: true,
					type: 'error',
					message: 'Error! Something went wrong'
				});
				generatingLink = false;
			}

			await goto(response.paymentLink.url);
			generatingLink = false;
		} catch (err) {
			console.log(err);
			// handle error
			alertStore.set({
				show: true,
				type: 'error',
				message: 'Error! Something went wrong'
			});
			generatingLink = false;
		}
		generatingLink = false;
	}

	function formatDescriptionBullets(text: string) {
		let wholeLineMatcher = /(?:[-]\s.+$)/gmu;
		let dashMatcher = /(?:[-]\s)/gmu;

		// pull out all regex groups
		let matches = text.match(wholeLineMatcher);
		text = text.replace(wholeLineMatcher, '');
		console.log(matches);
		// wrap each in a li tag
		let bulletPoints = matches?.map((point) => {
			// remove point from original text
			point = point.replace(dashMatcher, '');
			point = '<li class="bullet-point">' + point + '</li>';
			return point;
		});
		if (bulletPoints) {
			text = text.concat(...bulletPoints);
		}
		return text;
	}
</script>

<slot />
<div class="product-content-container">
	<div class="desktop-photos-col">
		{#if photoSrcListPopulated}
			<img
				class="focused-photo"
				src={focusedPhotoSrc}
				alt="Primary View"
				in:fade={{ duration: 500 }}
			/>
		{/if}

		<div class="focused-photo-loader shimmering" />

		<div class="photos-container">
			{#if photoSrcListPopulated}
				{#each photoSrcList as photoSrc, index (index)}
					<button
						class="set-focused-photo"
						on:click={() => {
							focusedPhotoSrc = photoSrc;
						}}
					>
						<img src={photoSrc} alt="Alternative View" in:fade={{ duration: 500 }} />
					</button>
				{/each}
			{/if}

			<div class="photos-container-loader ">
				{#each photoSrcList as photoSrc}
					<div class="shimmering" />
				{/each}
			</div>
		</div>
	</div>

	<div class="breaker-bar"><div /></div>

	<div class="desktop-data-col">
		{#if dataLoaded}
			<h2 class="product-name">{data.name}</h2>
			{#if data.status}
				<p class="product-price">${data.price}.00</p>
			{/if}
			<div class="breaker-bar desktop"><div /></div>
			<div class="description-container">
				<h4 class="description-title">DESCRIPTION</h4>

				<p class="description-content">{@html formatDescriptionBullets(data.description)}</p>
			</div>
			{#if data.status}
				<button class="buy-now" on:click={goToPayment}>
					{#if generatingLink}
						<p>LOADING... &nbsp;&nbsp;</p>
						<div class="button-spinner" />
					{:else}
						<p>BUY NOW &nbsp;&#183;&nbsp;</p>
						<p>${data.price}.00</p>
					{/if}
				</button>
				<div class="secure-message">
					<p class="secure-payment">SECURE CHECKOUT POWERED BY</p>
					<svg
						role="presentation"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 120 20"
						fill="none"
						aria-label="Square Checkout"
						class="square-svg"
						><path
							d="M16.658 0H3.342A3.342 3.342 0 0 0 0 3.342v13.316A3.342 3.342 0 0 0 3.342 20h13.316A3.342 3.342 0 0 0 20 16.658V3.342A3.342 3.342 0 0 0 16.658 0Zm-.294 15.309c0 .583-.472 1.055-1.055 1.055H4.69a1.056 1.056 0 0 1-1.055-1.055V4.69c0-.583.472-1.055 1.055-1.055H15.31c.583 0 1.055.472 1.055 1.055V15.31ZM7.88 12.715a.605.605 0 0 1-.606-.608V7.868c0-.335.27-.609.606-.609h4.245c.333 0 .605.272.605.61v4.236a.606.606 0 0 1-.605.608H7.878v.002Zm17.424-.29h2.183c.109 1.237.947 2.202 2.639 2.202 1.51 0 2.439-.746 2.439-1.874 0-1.056-.728-1.528-2.04-1.838l-1.692-.364c-1.838-.4-3.222-1.583-3.222-3.513 0-2.13 1.893-3.585 4.35-3.585 2.602 0 4.277 1.365 4.422 3.384H32.27c-.251-.945-1.035-1.508-2.308-1.508-1.348 0-2.274.728-2.274 1.657s.8 1.492 2.183 1.801l1.675.364c1.838.4 3.093 1.51 3.093 3.457 0 2.476-1.856 3.95-4.512 3.95-2.986-.003-4.641-1.621-4.824-4.133ZM42.45 20v-3.622l.143-1.588h-.143c-.5 1.142-1.552 1.767-2.98 1.767-2.302 0-4.015-1.874-4.015-4.747 0-2.874 1.713-4.748 4.015-4.748 1.41 0 2.41.66 2.98 1.695h.143V7.24h1.892V20h-2.035Zm.07-8.192c0-1.838-1.123-2.91-2.499-2.91-1.375 0-2.5 1.072-2.5 2.91s1.125 2.91 2.5 2.91c1.376 0 2.5-1.07 2.5-2.91Zm3.475.947V7.239h2.035v5.337c0 1.446.696 2.141 1.856 2.141 1.428 0 2.357-1.017 2.357-2.606V7.24h2.035v9.137h-1.892v-1.892h-.143c-.446 1.215-1.428 2.071-2.944 2.071-2.18 0-3.304-1.391-3.304-3.8Zm9.522 1.07c0-1.714 1.196-2.713 3.32-2.838l2.515-.16v-.714c0-.857-.625-1.374-1.731-1.374-1.017 0-1.625.517-1.786 1.249h-2.035c.215-1.856 1.75-2.928 3.819-2.928 2.339 0 3.766 1 3.766 2.928v6.388h-1.892v-1.695h-.143c-.428 1.124-1.32 1.874-3.034 1.874-1.639 0-2.8-1.106-2.8-2.73Zm5.837-1.124v-.483l-2.053.143c-1.106.07-1.606.482-1.606 1.303 0 .696.57 1.196 1.373 1.196 1.448 0 2.286-.927 2.286-2.16Zm3.55 3.677V7.24h1.892v1.75h.142c.268-1.197 1.179-1.75 2.534-1.75h.93v1.838h-1.161c-1.321 0-2.303.857-2.303 2.481v4.818h-2.034v.002Zm14.808-4.194h-6.944c.106 1.677 1.285 2.624 2.588 2.624 1.106 0 1.802-.446 2.196-1.197h2.017c-.553 1.856-2.178 2.944-4.231 2.944-2.695 0-4.587-2.016-4.587-4.747s1.945-4.748 4.605-4.748c2.676 0 4.426 1.838 4.426 4.122.002.449-.034.68-.07 1.002Zm-1.945-1.41c-.07-1.267-1.124-2.123-2.41-2.123-1.214 0-2.23.768-2.48 2.123h4.89Z"
							fill="black"
						/></svg
					>
				</div>
				<a href="/contact-us/{data.name}" class="custom-touch">Customize this hat</a>
			{:else}
				<button class="buy-now sold">
					<p>SOLD</p>
				</button>
			{/if}
		{/if}
	</div>
</div>

<style>
	.product-content-container {
		position: relative;
		max-width: 1100px;
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		margin: 15px auto;
	}
	.desktop-photos-col {
		display: flex;
		flex-direction: column;
		position: relative;
	}
	.focused-photo-loader {
		width: 100%;
		padding-bottom: 100%;
	}
	.focused-photo {
		position: absolute;
		width: 100%;
		left: 0;
		top: 0;
	}
	.photos-container,
	.photos-container-loader {
		width: 100%;
		height: 75px;
		display: flex;
		justify-content: center;
		margin-top: 5px;
		margin-bottom: 15px;
	}
	.photos-container button {
		width: 75px;
		margin: 0 5px;
	}
	.photos-container-loader {
		position: absolute;
		z-index: -1;
	}
	.photos-container-loader div {
		width: 75px;
	}
	.breaker-bar {
		display: none;
		justify-content: center;
	}
	.breaker-bar.desktop {
		display: flex;
		margin-bottom: 15px;
	}
	.breaker-bar div {
		width: 100%;
		height: 2px;
		border-radius: 5px;
		background-color: #ededed;
		margin: 5px 0;
	}
	.desktop-data-col {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 50px;
		position: relative;
	}
	.product-name {
		font-family: lato-regular;
		font-size: 24px;
	}
	.product-price {
		font-family: lato-light;
		font-size: 14px;
		margin-bottom: 10px;
	}

	.description-title {
		font-family: lato-light;
		font-size: 12px;
		margin-top: 10px;
	}
	.description-content {
		font-family: lato-light;
		font-size: 16px;
		margin: 15px 0;
		/* white-space: pre-wrap; */
	}
	:global(.bullet-point) {
		font-family: lato-light;
		text-indent: -16px;
		padding-left: 16px;
		margin-left: 16px;
	}
	button.buy-now {
		display: flex;
		width: 100%;
		border: 1px solid rgb(125, 124, 124);
		justify-content: center;
		align-items: center;
		height: 55px;
		font-size: 14px;
		font-family: lato-regular;
		margin-top: 30px;
	}
	button.buy-now.sold {
		filter: opacity(0.4);
		margin-bottom: 50px;
	}
	.secure-message {
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
		margin-bottom: 30px;
		margin-top: 3px;
	}
	.secure-payment {
		text-align: center;
		font-size: 10px;
		font-family: lato-light;
		margin-right: 5px;
		margin-top: 3px;
		margin-left: 25px;
	}
	.square-svg {
		height: 14px;
	}
	.custom-touch {
		font-family: lato-italic;
		text-decoration: underline;
		display: block;
		margin-bottom: 35px;
		width: 100%;
		text-align: center;
	}
	.button-spinner {
		content: '';
		border-radius: 50%;
		border-top: 2px solid hsl(var(--ac));
		border-right: 2px solid transparent;
		width: 20px;
		height: 20px;
		animation-name: spinning;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		opacity: 1;
		transition: all 0.2s;
		margin-left: 0px;
	}

	.shimmering {
		animation-duration: 4.2s;
		animation-fill-mode: forwards;
		animation-iteration-count: infinite;
		animation-name: shimmer;
		animation-timing-function: linear;
		background: hsl(var(--b3));
		background: linear-gradient(to right, #f6f6f6 8%, #f0f0f0 18%, #f6f6f6 33%) fixed;
		background-size: 1200px 100%;
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
	@keyframes spinning {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media screen and (max-width: 800px) {
		.product-content-container {
			display: flex;
			flex-direction: column;
			margin-top: 10px;
		}
		.focused-photo-loader {
			width: 100%;
			padding-bottom: 100%;
		}
		.focused-photo {
			position: absolute;
			width: 100%;
			left: 0;
			top: 0;
		}
		.photos-container,
		.photos-container-loader {
			width: 100%;
			height: 75px;
			display: flex;
			justify-content: space-between;
			margin-top: 5px;
			margin-bottom: 15px;
		}
		.photos-container button {
			width: 75px;
			margin: 0;
		}
		.breaker-bar {
			display: flex;
		}
		.breaker-bar.desktop {
			display: none;
		}
		.desktop-data-col {
			padding: 0;
		}
		:global(.bullet-point) {
			margin-left: 0px;
		}
	}
</style>
