<script lang="ts">
	import { page } from '$app/stores';
	import { alertStore, firebaseStore, inventoryStore } from '../../../../../customStores';
	import type { CrazyProduct } from '../../../../../customTypes';
	import { onMount } from 'svelte';
	import { doc, updateDoc, Timestamp } from 'firebase/firestore';
	import Product from '../../../Product.svelte';

	let loading = true;
	let confirmed = false;
	let messageToDisplay = '';
	let orderData = {
		id: '',
		email: '',
		amountDue: ''
	};

	onMount(confirmOrder);

	// take in order_id from page params and send to api endpoint for details
	async function confirmOrder() {
		if (!$inventoryStore) {
			setTimeout(confirmOrder, 250);
			return;
		}
		if ($page.params.order_id) {
			let serverRequest = await fetch('/api/confirm-order', {
				method: 'POST',
				body: JSON.stringify({
					orderId: $page.params.order_id
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let response = await serverRequest.json();

			if (response.error) {
				console.log(response.order.errors[0].code);
				if (response.order.errors[0].code == 'NOT_FOUND') {
					alertStore.set({
						show: true,
						type: 'error',
						message: 'Order ID Not Found'
					});
				}
				orderData.id = response.order.errors[0].detail;
				loading = false;
				return;
			}

			let orderObject = response.order.result.order;

			orderData.amountDue = orderObject.netAmountDueMoney.amount;
			orderData.id = orderObject.id;
			orderData.email = orderObject.fulfillments[0].shipmentDetails.recipient.emailAddress;

			let productName = orderObject.lineItems[0].name;

			for (let item of $inventoryStore) {
				if (item.name == productName) {
					let docRef = doc($firebaseStore.db, 'inventory', item.id);

					let updatedDoc = await updateDoc(docRef, {
						status: false,
						'sold.price': item.price,
						'sold.to': orderData.email,
						'sold.reference': orderData.id,
						'sold.timestamp': Timestamp.now(),
						updated: Timestamp.now()
					});
				}
			}

			confirmed = true;
			loading = false;
		}
	}
</script>

<div class="bar" />
<div class="container">
	<h3>ORDER CONFIRMATION</h3>
	{messageToDisplay}
	<p class="order-id">
		ID:
		{#if loading}
			<div class="button-spinner" />
		{:else}
			{orderData.id}
		{/if}
	</p>
	<div class="order-info">
		{#if !loading && confirmed}
			<p class="thanks">Thanks {orderData.email}!</p>
			<p>Your receipt from Square is on the way.</p>
			<p>Amount Remaining: {orderData.amountDue} USD</p>
			<p>A tracking number for shipping will be emailed shortly. We appreciate your business!</p>
		{/if}
		{#if !loading && !confirmed}
			<p>
				Your order was not found. We apologize for the inconvenience. Please confirm your Order ID
				in your receipt email matches above and <a href="/contact-us">contact us</a> for help.
			</p>
		{/if}
	</div>
</div>
<div class="bar" />

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 15px auto;
		max-width: 700px;
	}
	h3 {
		font-size: 30px;
	}
	.order-id {
		display: flex;
		align-items: center;
		font-size: 14px;
		font-family: lato-light;
		margin: 0;
	}
	.order-info {
		height: 200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 50px;
	}
	p.thanks {
		font-family: lato-bold;
		font-size: 20px;
	}
	p {
		margin: 15px 0;
		text-align: center;
	}
	.bar {
		width: 900px;
		margin: 25px auto;
		height: 2px;
		background-color: rgb(197, 197, 197);
		border-radius: 2px;
	}
	a {
		color: hsl(var(--a));
	}
	.button-spinner {
		content: '';
		border-radius: 50%;
		border-top: 2px solid hsl(var(--ac));
		border-right: 2px solid transparent;
		width: 15px;
		height: 15px;
		animation-name: spinning;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		opacity: 1;
		transition: all 0.2s;
		margin: 0 25px;
	}
	@media screen and (max-width: 800px) {
		.bar {
			width: 90vw;
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
</style>
