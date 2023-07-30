// helps us render the layout title faster

import type { LayoutLoad } from './$types';

export const load = (({ url }) => {
	let pagePathList = url.pathname.split('/').slice(1);
	let titleIndex = pagePathList[-1];
	let title = formatCapitalizedString(pagePathList[pagePathList.length - 1], true);

	let crumbs: { name: string; path: string }[] = [];
	pagePathList.forEach((pathname, index) => {
		let fullPath = '/' + pathname;
		if (index > 0) {
			fullPath = '';
			for (let n = 0; n < index + 1; n++) {
				let prevPath = '/' + pagePathList[n];
				fullPath += prevPath;
			}
		}
		crumbs.push({
			name: formatCapitalizedString(pathname, false),
			path: fullPath
		});
	});

	// removal of the order_id from the crumbs list?
	if (crumbs.length > 3) {
		crumbs.pop();
	}

	crumbs[crumbs.length - 1].path = url.pathname;

	return { title, crumbs };
}) as LayoutLoad;

function formatCapitalizedString(word: string, allUpperCase?: boolean): string {
	let lowercaseWords = word.split('-');

	if (lowercaseWords[0].includes('%')) {
		lowercaseWords = lowercaseWords[0].split('%20');
	}

	let uppercaseWords = lowercaseWords.map((word) => {
		// this is the normal path, to capitalize initial letter in each word
		let capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
		if (capitalizedWord === 'Faq') {
			capitalizedWord = 'FAQ';
		}

		if (allUpperCase) {
			capitalizedWord = word.toUpperCase();
		}

		return capitalizedWord;
	});

	return uppercaseWords.join(' ');
}
