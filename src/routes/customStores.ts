import { writable } from 'svelte/store';
import { firebaseClientConfig } from '../config';
import type {
	CustomFirebaseStore,
	CrazyProduct,
	CrazyCarousel,
	CrazyCustomOrderTemplate,
	CrazyCustomOrderForm,
	CrazyAlert,
	CrazyOwner,
	CrazyInventorySize
} from './customTypes';

export const firebaseStore = writable<CustomFirebaseStore>(undefined);

export const inventoryStore = writable<CrazyProduct[]>(undefined);

export const selectedProductStore = writable<CrazyProduct>(undefined);

export const customOrderTemplateStore = writable<CrazyCustomOrderTemplate>(undefined);

export const customOrdersStore = writable<CrazyCustomOrderForm[]>(undefined);

export const customOrderForm = writable<CrazyCustomOrderForm>(undefined);

export const carouselStore = writable<CrazyCarousel>(undefined);

export const alertStore = writable<CrazyAlert>(undefined);

export const ownerStore = writable<CrazyOwner>(undefined);

export const inventorySizeStore = writable<CrazyInventorySize>({
	smallPhotos: true
});

export async function connectToFirebase() {
	const appModule = await import('firebase/app');
	const firestoreModule = await import('firebase/firestore');
	const storageModule = await import('firebase/storage');
	const authModule = await import('firebase/auth');
	const analyticsModule = await import('firebase/analytics');

	// ** PUBLIC VARIABLES **

	// Initialize Firebase
	const app = appModule.initializeApp(firebaseClientConfig, 'TheCrazyP');
	const auth = authModule.getAuth(app);
	const db = firestoreModule.getFirestore(app);
	const storage = storageModule.getStorage(app);
	//const analytics = getAnalytics(app);});

	auth.onAuthStateChanged((user) => {
		if (user == null) {
			ownerStore.set({ loggedIn: false });
		} else {
			ownerStore.set({ loggedIn: true });
		}
	});

	firebaseStore.set({
		app: app,
		auth: auth,
		db: db,
		storage: storage
	});
}
