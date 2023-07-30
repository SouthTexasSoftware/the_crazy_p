import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { Client, Environment } from 'square';
import type { PaymentLink, Money } from 'square';
import { SQUARE_ENV } from '../../../../config';

export const POST = (async ({ request }) => {
	const requestData = await request.json();

	let response: PaymentResponse = {
		error: false
	};

	response = await generatePaymentLink(requestData.payload.name, requestData.payload.price);

	return json(response);
}) satisfies RequestHandler;

async function generatePaymentLink(name: string, price: string): Promise<PaymentResponse> {
	const client = new Client({
		environment: Environment.Production,
		accessToken: SQUARE_ENV.productionToken
	});

	// add decimal places to price
	price = price + '00';

	try {
		const response = await client.checkoutApi.createPaymentLink({
			idempotencyKey: undefined,
			quickPay: {
				name: name,
				priceMoney: {
					amount: BigInt(price),
					currency: 'USD'
				},
				locationId: 'LA41WM34FVHE8'
			},
			checkoutOptions: {
				acceptedPaymentMethods: {
					applePay: true,
					googlePay: true
				},
				askForShippingAddress: true,
				//redirectUrl: 'http://192.168.1.25:5173/inventory/' + name + '/'
				redirectUrl: 'https://thecrazyp.com/inventory/available/' + name + '/'
			}
		});

		let linkObject = response.result.paymentLink;
		//@ts-ignore
		const updateRedirect = await client.checkoutApi.updatePaymentLink(linkObject.id, {
			paymentLink: {
				version: 1,
				checkoutOptions: {
					//@ts-ignore
					redirectUrl: linkObject.checkoutOptions.redirectUrl + linkObject.orderId
					// shippingFee: {
					// 	charge: {
					// 		amount: BigInt('1700'),
					// 		currency: 'USD'
					// 	},
					// 	name: 'Shipping & Handling'
					// }
				}
			}
		});

		if (linkObject) {
			if (linkObject.checkoutOptions?.shippingFee?.charge) {
				//@ts-ignore
				linkObject.checkoutOptions.shippingFee.charge = '1500';
			}

			return {
				error: false,
				paymentLink: linkObject
			};
		}
		return {
			error: true,
			code: 'linkObject was undefined'
		};
	} catch (error) {
		console.log(error);
		return {
			error: true,
			code: error as string
		};
	}
}

interface PaymentResponse {
	error: boolean;
	code?: string;
	paymentLink?: PaymentLink;
}
