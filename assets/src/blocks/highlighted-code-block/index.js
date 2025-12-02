import { registerBlockType } from '@wordpress/blocks';
import { code as icon } from '@wordpress/icons';
import Edit from './edit';
import Save from './save';
import { __ } from '@wordpress/i18n';

registerBlockType( 'dm-hcb/highlighted-code-block', {
	title: __( 'Highlighted code', 'dm-hcb' ),
	icon,
	category: 'text',
	edit: Edit,
	save: Save,
} );
