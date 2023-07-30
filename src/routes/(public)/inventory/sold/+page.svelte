<script lang="ts">
	import { inventorySizeStore, inventoryStore } from '../../../customStores';
	import type { CrazyProduct } from '../../../customTypes';
	import { onMount } from 'svelte';

	import Product from '../Product.svelte';

	let productList: CrazyProduct[] = [];

	let viewSold = true;

	onMount(setProductList);

	function setProductList() {
		if (!$inventoryStore) {
			setTimeout(setProductList, 500);
			return;
		}
		productList = $inventoryStore;
	}

	inventoryStore.subscribe(setProductList);
</script>

<div class="products" class:single-col={!$inventorySizeStore.smallPhotos}>
	{#each productList as product}
		<Product productObject={product} {viewSold} />
	{/each}
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

	@media screen and (max-width: 800px) {
		.products {
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;
		}
		.products.single-col {
			grid-template-columns: 100%;
			gap: 30px;
		}
	}
</style>
