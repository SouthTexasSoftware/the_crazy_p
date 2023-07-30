import type { PageLoad } from './$types';
import { selectedProductStore, inventoryStore } from '../../../../customStores';
import { get } from 'svelte/store';
import type { CrazyProduct } from '../../../../customTypes';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
	const layoutData = await parent();

	let loadedProduct: CrazyProduct | null = null;

	if (get(selectedProductStore)) {
		loadedProduct = get(selectedProductStore);
	}

	return loadedProduct;
}) as PageLoad;
