import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Firestore, Timestamp } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

export interface CustomFirebaseStore {
	app: FirebaseApp;
	auth: Auth;
	db: Firestore;
	storage: FirebaseStorage;
}

export interface CrazyProduct {
	id: string;
	name: string;
	price: string;
	created: Timestamp;
	updated: Timestamp;
	description: string;
	photos: { filename: string; index: string; primary: boolean }[];
	status: boolean; // true = available, false = not ie sold, pending, not ready, etc?
	sold: { reference: string; price: string; to: string; timestamp?: Timestamp };
}

export interface CrazyCarousel {
	photos: Array<CrazyCarouselItem>;
}

export interface CrazyCarouselItem {
	filename: string;
	index: number;
	inventoryName?: string;
	generatedUrl?: string;
}

export interface CrazyCustomOrderTemplate {
	fields: Array<CustomOrderField>;
	available: boolean;
	leadTime: string;
}

export interface CrazyCustomOrderForm {
	id?: string;
	fulfilled: boolean;
	name: string | undefined;
	phone: string | undefined;
	email: string | undefined;
	address: string | undefined;
	created?: Timestamp;
	sold?: Timestamp;
	fields: Array<CustomOrderField>;
}

export interface CustomOrderField {
	name: string;
	options: Array<CustomOrderOption>;
	details?: string;
	hasDetails?: boolean;
	index: number;
}

export interface CustomOrderOption {
	name: string;
	selected: boolean;
}

export interface CrazyAlert {
	show: boolean;
	type: 'error' | 'success' | 'warning' | 'info';
	message: string;
}

export interface CrazyOwner {
	loggedIn: boolean;
}

export interface CrazyInventorySize {
	smallPhotos: boolean;
}
