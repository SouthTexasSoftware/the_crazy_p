<script lang="ts">
	import { firebaseStore, alertStore } from '../../customStores';
	import { collection, addDoc, Timestamp } from 'firebase/firestore';

	let emailInput: HTMLInputElement;
	let addingEmail = false;

	async function addToEmailList() {
		if (addingEmail) return;
		addingEmail = true;

		let value = emailInput.value;
		if (value) {
			let newDocObject = {
				email: value,
				type: 'custom-order',
				added: Timestamp.now()
			};

			try {
				let newDoc = await addDoc(collection($firebaseStore.db, 'email-list'), newDocObject);

				// SEND OWNER NOTIFICATION EMAIL
				let serverRequest = await fetch('/api/trigger-email', {
					method: 'POST',
					body: JSON.stringify({
						payload: newDocObject,
						type: 'email-list-addition'
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				let response = await serverRequest.json();

				if (response.error) {
					throw new Error(response.error);
				}

				alertStore.set({
					show: true,
					type: 'success',
					message: 'Email added!'
				});

				emailInput.value = '';

				addingEmail = false;
			} catch (e) {
				alertStore.set({
					show: true,
					type: 'error',
					message: 'Error: Something went wrong'
				});
				console.log(e);

				emailInput.value = '';
				addingEmail = false;
			}
		} else {
			return;
		}
	}
</script>

<p class="message">
	Custom orders are currently on HOLD until after the holidays! If you'd like to be notified when
	they reopen, please leave your email below. Thanks!
</p>

<form class="input-container" on:submit|preventDefault={addToEmailList}>
	<input type="email" autocomplete="email" placeholder="Email" bind:this={emailInput} required />
	<button type="submit"
		>{#if addingEmail}
			<div class="button-spinner" />
		{:else}
			ADD
		{/if}</button
	>
</form>

<div class="space" />

<style>
	.message {
		font-family: lato-regular;
		text-align: center;
		font-size: 18px;
		max-width: 900px;
		margin: 0 auto 25px;
	}
	.input-container {
		display: flex;
		width: 100%;
		border: 1px solid hsl(var(--n));
		border-radius: 2px;
		max-width: 400px;
		margin: 0 auto;
	}
	input {
		background-color: hsl(var(--bg));
		font-size: 18px;
		flex-grow: 2;
		height: 45px;
		padding-left: 10px;
		outline: none;
	}
	button {
		font-family: lato-regular;
		width: 70px;
		background-color: hsl(var(--n));
		border-radius: 8px;
		margin: 4px;
		font-size: 14px;
		flex-grow: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.space {
		height: 100px;
	}
	.button-spinner {
		content: '';
		border-radius: 50%;
		border-top: 2px solid hsl(var(--a));
		border-right: 2px solid transparent;
		width: 15px;
		height: 15px;
		animation-name: spinning;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		opacity: 1;
		transition: all 0.2s;
		margin-left: 0px;
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
