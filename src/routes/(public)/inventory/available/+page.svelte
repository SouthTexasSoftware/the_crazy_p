<script lang="ts">
	import { inventorySizeStore, inventoryStore } from '../../../customStores';
	import type { CrazyProduct } from '../../../customTypes';
	import { onMount } from 'svelte';

	import Product from '../Product.svelte';

	let productList: CrazyProduct[] = [];

	let viewSold = false;

	onMount(setProductList);

	function setProductList() {
		if (!$inventoryStore) {
			setTimeout(setProductList, 500);
			return;
		}
		productList = $inventoryStore;
	}

	function anyAvailable() {
		let returnBool = false;

		productList.forEach((product) => {
			if (product.status) {
				returnBool = true;
			}
		});
		return returnBool;
	}

	inventoryStore.subscribe(setProductList);
</script>

<div class="products" class:single-col={!$inventorySizeStore.smallPhotos}>
	{#each productList as product}
		<Product productObject={product} {viewSold} />
	{/each}
	{#if anyAvailable() == false}
		<div class="product-coming-soon">
			<p>Coming Soon!</p>
		</div>
	{/if}
</div>

<style>
	/* default to the two wide display */
	.products {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}
	.products.single-col {
		grid-template-columns: repeat(2, 1fr);
		gap: 30px;
	}
	.product-coming-soon {
		position: relative;
		width: 218px;
		height: 218px;
		background-color: hsl(var(--b1));
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid hsl(var(--b2));
	}
	p {
		font-size: 18px;
		font-family: lato-bold;
		color: hsl(var(--a));
	}

	@media screen and (max-width: 800px) {
		.products {
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;
		}
		.products.single-col {
			grid-template-columns: 100%;
			gap: 30px;
		}
		.product-coming-soon {
			width: 187px;
			height: 187px;
		}
	}
</style>
