import { __ } from '@wordpress/i18n';
import {
	PlainText,
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, ComboboxControl } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import hljs from 'highlight.js';
import './editor.scss';

const LANGUAGES = hljs.listLanguages();
const LANGUAGE_OPTIONS = [
	{ label: __( 'None', 'dm-hcb' ), value: 'none' },
	...LANGUAGES.map( ( lang ) => {
		const meta = hljs.getLanguage( lang );
		return {
			label: meta?.name || lang,
			value: lang,
		};
	} ),
];

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { language = 'none', content = '' } = attributes;
	const blockProps = useBlockProps();

	const highlightedContent = useMemo( () => {
		if ( ! content || language === 'none' ) {
			return content;
		}

		const validLanguage = hljs.getLanguage( language )
			? language
			: 'plaintext';

		try {
			return hljs.highlight( content, { language: validLanguage } ).value;
		} catch ( error ) {
			return content;
		}
	}, [ content, language ] );

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody
					title={ __( 'Code Settings', 'dm-hcb' ) }
					initialOpen={ true }
				>
					<ComboboxControl
						label={ __( 'Language', 'dm-hcb' ) }
						value={ language }
						options={ LANGUAGE_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { language: value || 'none' } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			{ /* Input area */ }
			{ isSelected && (
				<div className="dm-hcb-code-input">
					<PlainText
						tagName="textarea"
						value={ content }
						onChange={ ( newContent ) =>
							setAttributes( { content: newContent } )
						}
						placeholder={ __( 'Write code here…', 'dm-hcb' ) }
						style={ {
							fontFamily: 'monospace',
							minHeight: '100px',
						} }
					/>
				</div>
			) }

			{ /* Preview area */ }
			{ ! isSelected && (
				<div className="dm-hcb-code-preview">
					<pre>
						{ language === 'none' ? (
							<code>{ content }</code>
						) : (
							<code
								className={ `hljs language-${ language }` }
								dangerouslySetInnerHTML={ {
									__html: highlightedContent,
								} }
							/>
						) }
					</pre>
				</div>
			) }
		</div>
	);
}
