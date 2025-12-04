import { createRoot, useState, useEffect, useMemo } from '@wordpress/element';
import { ComboboxControl, Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import hljs from 'highlight.js';

/**
 * Admin settings page for Highlighted Code Blocks, mounts into `#hcb-admin-app`.
 */

const DATA = window.HCB_ADMIN || {
	themes: [],
	selected: '',
	ajax_url: '',
	nonce: '',
	option_name: 'dm_hcb_selected_theme',
};

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

/**
 * Helper function to apply a preview stylesheet link for a given theme slug.
 *
 * This function dynamically updates the `<link>` element in the document's `<head>`
 * to apply the stylesheet corresponding to the provided theme slug. If no theme slug
 * is provided, or if the theme cannot be found, the existing preview stylesheet (if any)
 * is removed.
 *
 * @param {string} themeSlug - The slug of the theme to apply. If falsy, the preview theme is removed.
 */
function applyPreviewTheme( themeSlug ) {
	const linkId = 'hcb-preview-theme';
	const existing = document.getElementById( linkId );

	if ( ! themeSlug ) {
		if ( existing ) {
			existing.remove();
		}
		return;
	}

	const theme = ( DATA.themes || [] ).find(
		( t ) => ( t.slug ? t.slug : t ) === themeSlug
	);
	if ( ! theme ) {
		if ( existing ) {
			existing.remove();
		}
		return;
	}

	const href =
		theme.url ||
		( theme.file ? DATA.ajax_url + '?file=' + theme.file : null );
	if ( ! href ) {
		if ( existing ) {
			existing.remove();
		}
		return;
	}

	if ( existing ) {
		if ( existing.getAttribute( 'href' ) !== href ) {
			existing.setAttribute( 'href', href );
		}
		return;
	}

	const link = document.createElement( 'link' );
	link.id = linkId;
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = href;
	link.media = 'all';
	document.head.appendChild( link );
}

/**
 * Save the selected theme to the server via admin-ajax.
 *
 * This function sends the selected theme to the server using a POST request.
 * It includes the action, theme, and nonce in the request body to ensure
 * proper handling and security on the server side.
 *
 * @param {string} theme - The slug of the theme to save.
 * @return {Promise<Object>} - A promise that resolves to the server's JSON response.
 */
async function saveThemeToServer( theme ) {
	const form = new window.FormData();
	form.append( 'action', 'hcb_save_theme' );
	form.append( 'theme', theme );
	form.append( 'nonce', DATA.nonce );

	const res = await fetch( DATA.ajax_url, {
		method: 'POST',
		credentials: 'same-origin',
		body: form,
	} );

	return res.json();
}

/**
 * Inline notice component for displaying messages.
 *
 * @param {Object} props                  - Component properties.
 * @param {string} [props.type='success'] - The type of notice, either 'success' or 'error'.
 * @param {Object} props.children         - The content to display inside the notice.
 * @return {JSX.Element} The rendered notice component.
 */
function NoticeInline( { type = 'success', children } ) {
	const style = {
		padding: '10px 14px',
		borderRadius: 3,
		marginTop: 12,
		marginBottom: 12,
		color: type === 'error' ? '#7f1d1d' : '#064e3b',
		background: type === 'error' ? '#fee2e2' : '#ecfdf5',
		border: '1px solid ' + ( type === 'error' ? '#fecaca' : '#bbf7d0' ),
	};
	return <div style={ style }>{ children }</div>;
}

function AdminSettings() {
	// Theme options for the theme Combobox
	const themeOptions = [
		{ value: '', label: __( 'Default / None', 'dm-hcb' ) },
		...( DATA.themes || [] ).map( ( t ) => {
			const slug =
				typeof t === 'string'
					? t
					: t.slug ||
					  t.name ||
					  ( t.file
							? t.file.replace( /\.min\.css$|\.css$/i, '' )
							: '' );
			const label =
				typeof t === 'string'
					? t
					: t.name ||
					  ( t.file
							? t.file.replace( /\.min\.css$|\.css$/i, '' )
							: slug );
			return { value: slug, label: label || slug };
		} ),
	];

	const [ theme, setTheme ] = useState( DATA.selected || '' );
	const [ originalTheme, setOriginalTheme ] = useState( DATA.selected || '' );
	const [ saving, setSaving ] = useState( false );
	const [ msg, setMsg ] = useState( null );

	const [ content, setContent ] = useState(
		'function hello() {\n\tconsole.log("hello world");\n}\n'
	);
	const [ language, setLanguage ] = useState( 'javascript' );

	useEffect( () => {
		applyPreviewTheme( theme );
	}, [ theme ] );

	useEffect( () => {
		setOriginalTheme( DATA.selected || '' );
	}, [] );

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

	async function onSaveTheme( e ) {
		e.preventDefault();
		setSaving( true );
		setMsg( null );

		try {
			const json = await saveThemeToServer( theme );
			setSaving( false );
			if ( json && json.success ) {
				setOriginalTheme( theme );
				setMsg( {
					type: 'success',
					text: __( 'Theme saved.', 'dm-hcb' ),
				} );
			} else {
				const text =
					( json && json.data && json.data.message ) ||
					( json && json.message ) ||
					__( 'Could not save theme', 'dm-hcb' );
				setMsg( { type: 'error', text } );
			}
		} catch ( err ) {
			setSaving( false );
			setMsg( { type: 'error', text: String( err ) } );
		}
	}

	function onReset() {
		setTheme( originalTheme );
		setMsg( null );
	}

	return (
		<div className="hcb-admin-root" style={ { maxWidth: 900 } }>
			<div>
				<h2>{ __( 'Global Highlight Theme', 'dm-hcb' ) }</h2>
				<p>
					{ __(
						'Select the highlight theme to load globally on the frontend. You can also edit code below and preview highlighting for different languages.',
						'dm-hcb'
					) }
				</p>

				<ComboboxControl
					label={ __( 'Theme', 'dm-hcb' ) }
					value={ theme }
					onChange={ setTheme }
					options={ themeOptions }
					placeholder={ __( 'Select a theme…', 'dm-hcb' ) }
					__next={ true }
				/>

				<div
					style={ {
						marginTop: 12,
						display: 'flex',
						gap: 8,
						alignItems: 'center',
					} }
				>
					<Button
						isPrimary
						onClick={ onSaveTheme }
						disabled={ saving }
					>
						{ saving ? (
							<Spinner size={ 20 } />
						) : (
							__( 'Save theme', 'dm-hcb' )
						) }
					</Button>

					<Button
						isSecondary
						onClick={ onReset }
						disabled={ saving || theme === originalTheme }
					>
						{ __( 'Reset', 'dm-hcb' ) }
					</Button>

					<Button
						isSecondary
						onClick={ () => setTheme( '' ) }
						disabled={ saving }
					>
						{ __( 'Clear', 'dm-hcb' ) }
					</Button>
				</div>

				{ msg && (
					<NoticeInline type={ msg.type }>{ msg.text }</NoticeInline>
				) }
			</div>

			<div>
				<h2>{ __( 'Interactive Preview', 'dm-hcb' ) } </h2>
				<ComboboxControl
					label={ __( 'Language', 'dm-hcb' ) }
					value={ language }
					options={ LANGUAGE_OPTIONS }
					onChange={ ( value ) => setLanguage( value || 'none' ) }
				/>

				{ /* Editable input area */ }
				<div style={ { marginTop: 12 } }>
					<textarea
						value={ content }
						onChange={ ( e ) => setContent( e.target.value ) }
						placeholder={ __( 'Write code here…', 'dm-hcb' ) }
						style={ {
							width: '100%',
							minHeight: 100,
							fontFamily: 'monospace',
							fontSize: 13,
							padding: 12,
							borderRadius: 4,
							border: '1px solid #ddd',
							boxSizing: 'border-box',
						} }
					/>
				</div>

				{ /* Preview area */ }
				<div style={ { marginTop: 16 } }>
					<h4>{ __( 'Preview', 'dm-hcb' ) }</h4>
					<pre
						style={ {
							padding: 12,
							borderRadius: 4,
							background: '#f7f7f7',
							overflowX: 'auto',
						} }
					>
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
			</div>
		</div>
	);
}

document.addEventListener( 'DOMContentLoaded', () => {
	const mount = document.getElementById( 'hcb-admin-app' );
	if ( mount ) {
		const root = createRoot( mount );
		root.render( <AdminSettings /> );
	}
} );
