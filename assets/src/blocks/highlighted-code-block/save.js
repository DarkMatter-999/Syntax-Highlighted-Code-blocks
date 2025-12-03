import { useBlockProps } from '@wordpress/block-editor';
import hljs from 'highlight.js';

/**
 * Save component for the highlighted code block.
 * This is a static output (no client-side syntax highlighting).
 * @param {Object} props            - The props object.
 * @param {Object} props.attributes - The attributes for the block.
 */
export default function Save( { attributes } ) {
	const { content, language } = attributes;

	let highlightedContent = content;
	let codeClass = '';

	if ( content && language && language !== 'none' ) {
		const validLanguage = hljs.getLanguage( language )
			? language
			: 'plaintext';
		try {
			highlightedContent = hljs.highlight( content, {
				language: validLanguage,
			} ).value;

			codeClass = `hljs language-${ language }`;
		} catch ( error ) {}
	}

	return (
		<pre { ...useBlockProps.save() }>
			{ language === 'none' ? (
				<code>{ content }</code>
			) : (
				<code
					className={ codeClass }
					dangerouslySetInnerHTML={ { __html: highlightedContent } }
				/>
			) }
		</pre>
	);
}
