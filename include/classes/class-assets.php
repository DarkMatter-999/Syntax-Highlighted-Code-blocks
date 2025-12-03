<?php
/**
 * Main Assets Class File
 *
 * Main Theme Asset class file for the Plugin. This class enqueues the necessary scripts and styles.
 *
 * @package DM_Highlighted_Code_Blocks
 **/

namespace DM_Highlighted_Code_Blocks;

use DM_Highlighted_Code_Blocks\Traits\Singleton;

/**
 * Main Assets Class File
 *
 * Main Theme Asset class file for the Plugin. This class enqueues the necessary scripts and styles.
 *
 * @since 1.0.0
 **/
class Assets {

	use Singleton;

	/**
	 * Constructor for the Assets class.
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );
		add_action(
			'enqueue_block_editor_assets',
			array(
				$this,
				'enqueue_block_editor_assets',
			)
		);
	}

	/**
	 * Enqueues styles and scripts for the theme.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		$style_asset = include HCB_PLUGIN_PATH . 'assets/build/css/main.asset.php';
		wp_enqueue_style(
			'main-css',
			HCB_PLUGIN_PATH . 'assets/build/css/main.css',
			$style_asset['dependencies'],
			$style_asset['version']
		);

		$script_asset = include HCB_PLUGIN_PATH . 'assets/build/js/main.asset.php';

		wp_enqueue_script(
			'main-js',
			HCB_PLUGIN_PATH . 'assets/build/js/main.js',
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);

		// Enqueue selected highlight theme CSS on the frontend if option is set and the block is present on the page.
		if ( has_block( 'dm-hcb/highlighted-code-block' ) ) {
			$selected_theme = get_option( 'dm_hcb_selected_theme', '' );
			if ( $selected_theme ) {
				// Prefer the .min.css file (webpack copies minified files), fall back to .css.
				$min_path = HCB_PLUGIN_PATH . 'assets/build/themes/' . $selected_theme . '.min.css';
				$css_path = HCB_PLUGIN_PATH . 'assets/build/themes/' . $selected_theme . '.css';
				if ( file_exists( $min_path ) ) {
					wp_enqueue_style( 'dm-hcb-highlight-theme', HCB_PLUGIN_URL . 'assets/build/themes/' . $selected_theme . '.min.css', array(), filemtime( $min_path ) );
				} elseif ( file_exists( $css_path ) ) {
					wp_enqueue_style( 'dm-hcb-highlight-theme', HCB_PLUGIN_URL . 'assets/build/themes/' . $selected_theme . '.css', array(), filemtime( $css_path ) );
				}
			}
		}
	}

	/**
	 * Enqueues styles and scripts for the frontend.
	 *
	 * @return void
	 */
	public function enqueue_block_assets() {
		$style_asset = include HCB_PLUGIN_PATH . 'assets/build/css/screen.asset.php';
		wp_enqueue_style(
			'block-css',
			HCB_PLUGIN_PATH . 'assets/build/css/screen.css',
			$style_asset['dependencies'],
			$style_asset['version']
		);

		$script_asset = include HCB_PLUGIN_PATH . 'assets/build/js/screen.asset.php';

		wp_enqueue_script(
			'block-js',
			HCB_PLUGIN_PATH . 'assets/build/js/screen.js',
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);

		// Enqueue selected highlight theme CSS for front-end block assets as well.
		if ( has_block( 'dm-hcb/highlighted-code-block' ) ) {
			$selected_theme = get_option( 'dm_hcb_selected_theme', '' );
			if ( $selected_theme ) {
				$min_path = HCB_PLUGIN_PATH . 'assets/build/themes/' . $selected_theme . '.min.css';
				$css_path = HCB_PLUGIN_PATH . 'assets/build/themes/' . $selected_theme . '.css';
				if ( file_exists( $min_path ) ) {
					wp_enqueue_style( 'dm-hcb-highlight-theme-block', HCB_PLUGIN_URL . 'assets/build/themes/' . $selected_theme . '.min.css', array(), filemtime( $min_path ) );
				} elseif ( file_exists( $css_path ) ) {
					wp_enqueue_style( 'dm_hcb-highlight-theme-block', HCB_PLUGIN_URL . 'assets/build/themes/' . $selected_theme . '.css', array(), filemtime( $css_path ) );
				}
			}
		}
	}

	/**
	 * Enqueues styles and scripts for the block editor.
	 *
	 * @return void
	 */
	public function enqueue_block_editor_assets() {
		$style_asset = include HCB_PLUGIN_PATH . 'assets/build/css/editor.asset.php';

		wp_enqueue_style(
			'editor-css',
			HCB_PLUGIN_PATH . 'assets/build/css/editor.css',
			$style_asset['dependencies'],
			$style_asset['version']
		);

		$script_asset = include HCB_PLUGIN_PATH . 'assets/build/js/editor.asset.php';

		wp_enqueue_script(
			'editor-js',
			HCB_PLUGIN_PATH . 'assets/build/js/editor.asset.php',
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);

		// Enqueue selected highlight theme CSS in the block editor to preview it in the editor.
		$selected_theme = get_option( 'dm_hcb_selected_theme', '' );
		if ( $selected_theme ) {
			$min_path = HCB_PLUGIN_PATH . 'assets/build/themes/' . $selected_theme . '.min.css';
			$css_path = HCB_PLUGIN_PATH . 'assets/build/themes/' . $selected_theme . '.css';
			if ( file_exists( $min_path ) ) {
				wp_enqueue_style( 'dm-hcb-highlight-theme-editor', HCB_PLUGIN_URL . 'assets/build/themes/' . $selected_theme . '.min.css', array( 'editor-css' ), filemtime( $min_path ) );
			} elseif ( file_exists( $css_path ) ) {
				wp_enqueue_style( 'dm-hcb-highlight-theme-editor', HCB_PLUGIN_URL . 'assets/build/themes/' . $selected_theme . '.css', array( 'editor-css' ), filemtime( $css_path ) );
			}
		}
	}
}
