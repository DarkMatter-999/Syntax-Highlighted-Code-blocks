import { RichText, useBlockProps } from '@wordpress/block-editor';

/**
 * Save component for the highlighted code block.
 * This is a static output (no client-side syntax highlighting).
 * @param {Object} props            - The props object.
 * @param {Object} props.attributes - The attributes for the block.
 */
export default function Save( { attributes } ) {
	return (
		<pre
			{ ...useBlockProps.save() }
			className={
				attributes.language && attributes.language !== 'none'
					? `language-${ attributes.language }`
					: undefined
			}
		>
			<RichText.Content
				tagName="code"
				value={
					typeof attributes.content === 'string'
						? attributes.content
						: attributes.content.toHTMLString( {
								preserveWhiteSpace: true,
						  } )
				}
			/>
		</pre>
	);
}
