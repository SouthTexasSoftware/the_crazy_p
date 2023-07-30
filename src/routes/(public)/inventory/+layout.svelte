<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { inventorySizeStore } from '../../customStores';
	import { afterNavigate, goto } from '$app/navigation';

	afterNavigate(() => {
		if ($page.url.pathname == '/inventory') {
			goto('/inventory/available');
		}
	});
</script>

<div class="inventory-container">
	<div class="sort-bar">
		<div class="button-container">
			<a
				href="/inventory/available"
				class="text"
				class:selected={$page.url.pathname.includes('available')}>Available</a
			>
			<a
				href="/inventory/sold"
				class="text"
				id="sold"
				class:selected={$page.url.pathname.includes('sold')}>Sold</a
			>
		</div>

		<div class="button-container">
			<button
				id="single-col"
				on:click={() => {
					$inventorySizeStore.smallPhotos = false;
				}}
			/>
			<button
				id="double-col"
				on:click={() => {
					$inventorySizeStore.smallPhotos = true;
				}}
				><div />
				<div />
				<div />
				<div /></button
			>
		</div>
	</div>

	<slot />
</div>

<style>
	.inventory-container {
		max-width: 900px;
		margin: 0 auto;
	}
	.sort-bar {
		display: flex;
		justify-content: space-between;
		margin-top: 5px;
		margin-bottom: 15px;
		border-bottom: 1px solid hsl(var(--ac));
		font-family: lato-regular;
		font-size: 18px;
	}
	.button-container {
		display: flex;
		width: 44px;
		justify-content: space-between;
	}
	a {
		padding: 0 5px;
		margin: 0 5px -1px 0px;
		margin-bottom: -1px;
		/* transition: all 0.2s linear; */
		-webkit-tap-highlight-color: rgba(245, 245, 245, 0.265);
	}
	a.text.selected {
		color: hsl(var(--a));
		border-bottom: 1px solid hsl(var(--a));
	}
	#single-col {
		width: 19px;
		height: 19px;
		background-color: hsl(var(--ac));
	}
	#double-col {
		display: inline-grid;
		grid-template: repeat(2, 9px) / repeat(2, 9px);
		gap: 1px;
		place-items: center;
	}
	#double-col div {
		width: 100%;
		height: 100%;
		background-color: hsl(var(--ac));
	}
</style>
