import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (() => {
	throw redirect(301, 'custom-order');
}) satisfies LayoutServerLoad;
