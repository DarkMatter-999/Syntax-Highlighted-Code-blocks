import { __ } from '@wordpress/i18n';
import {
	RichText,
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, ComboboxControl } from '@wordpress/components';

const LANGUAGE_OPTIONS = [
	{ label: __( 'None', 'dm-hcb' ), value: 'none' },
	{ label: 'JavaScript', value: 'javascript' },
	{ label: 'HTML', value: 'html' },
	{ label: 'CSS', value: 'css' },
	{ label: 'PHP', value: 'php' },
	{ label: 'Python', value: 'python' },
];

/**
 * Editor UI for the highlighted code block.
 * - Provides a language selector in the block inspector.
 * - Provides a textarea for code content in the main canvas.
 * @param {Object}   props               - The props passed to the block editor component.
 * @param {Object}   props.attributes    - The attributes of the block.
 * @param {Function} props.setAttributes - Function to update block attributes.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { language = 'none' } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Code settings', 'dm-hcb' ) }
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

			<pre { ...blockProps }>
				<RichText
					tagName="code"
					identifier="content"
					value={ attributes.content }
					onChange={ ( content ) => setAttributes( { content } ) }
					placeholder={ __( 'Write code…', 'dm-hcb' ) }
					aria-label={ __( 'Code' ) }
					preserveWhiteSpace
					__unstablePastePlainText
				/>
			</pre>
		</>
	);
}
