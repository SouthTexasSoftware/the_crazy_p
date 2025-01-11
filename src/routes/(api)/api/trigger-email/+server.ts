import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sgMail from '@sendgrid/mail';
import { dev } from '$app/environment';
import { SENDGRID_ENV } from '../../../../config';

export const POST = (async ({ request }) => {
	const requestData = await request.json();

	let response = {
		error: false,
		code: 'Email Triggered'
	};
	try {
		await EmailHandler(requestData.type, requestData.payload);
	} catch (error: any) {
		response.error = true;
		if (error) {
			response.code = error.code;
		}
	}

	return json({ response: response });
}) satisfies RequestHandler;

//
//
//
// *** emailing functions ***

const contactFormTemplateId = 'd-b1553af4379141c28b7a6543bc8d195a';
const customOrderTemplateId = 'd-33e2cfac6b57463fa03e81b9e87b165f';
const errorTemplateId = 'd-41c60c4f4df14b0cae277be75e45cf27';

// the 'to' is currently hard-coded, no customer emails will be sent for now.
let msg: MessageObject = {
	from: { name: 'South Texas Software', email: 'notifications@southtexas.software' },
	to: ['notifications@southtexas.software', 'k.thecrazyp@gmail.com']
	// 'k.thecrazyp@gmail.com',
};

async function EmailHandler(type: string, payload: { [key: string]: string }) {
	//build 'msg' object based on the type and payload details
	switch (type) {
		case 'contact':
			msg.templateId = contactFormTemplateId;
			msg.dynamicTemplateData = {
				name: payload.name,
				phone: payload.phone,
				email: payload.email,
				details: payload.details
			};
			break;

		case 'customOrder':
			msg.templateId = customOrderTemplateId;
			msg.dynamicTemplateData = {
				name: payload.name,
				phone: payload.phone,
				email: payload.email
			};
			break;
		case 'email-list-addition':
			msg.templateId = customOrderTemplateId;
			msg.dynamicTemplateData = {
				name: '**Email List Sign Up**',
				phone: 'N/A',
				email: payload.email
			};
			break;
		case 'error':
			msg.templateId = errorTemplateId;
			msg.dynamicTemplateData = {
				details: payload.details,
				code: payload.code,
				message: payload.message,
				pathname: payload.pathname
			};
			break;
	}

	// d: change to dev if testing other features
	if (dev) {
		console.log('****************** SIMULATING EMAIL PAYLOAD *********************');
		console.error(msg);
	} else {
		sgMail.setApiKey(SENDGRID_ENV.apiKey);
		try {
			//@ts-ignore
			let sgResponse = await sgMail.send(msg);
			console.log(sgResponse);
		} catch (e) {
			console.error(e);
		}
	}
}

interface MessageObject {
	from: { name: string; email: string };
	to: string | string[];
	templateId?: string;
	dynamicTemplateData?: { [key: string]: any };
}

interface ContactFormPayload {
	type?: string;
	name: string;
	phone: string;
	email: string;
	details: string;
}
