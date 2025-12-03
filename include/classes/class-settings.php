<?php
/**
 * Settings Class File
 *
 * Handles admin settings, settings page and AJAX endpoints for theme selection.
 *
 * @package DM_Highlighted_Code_Blocks
 **/

namespace DM_Highlighted_Code_Blocks;

use DM_Highlighted_Code_Blocks\Traits\Singleton;

/**
 * Settings class for admin settings page, scripts, and AJAX.
 */
class Settings {

	use Singleton;

	/**
	 * Constructor.
	 *
	 * Hooks the admin-specific actions.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );

		add_action( 'wp_ajax_hcb_save_theme', array( $this, 'ajax_save_theme' ) );
	}

	/**
	 * Register admin settings page under Settings menu.
	 *
	 * @return void
	 */
	public function register_settings_page() {
		add_theme_page(
			__( 'Synatax Highlight Settings', 'dm-hcb' ),
			__( 'Highlight Themes', 'dm-hcb' ),
			'edit_theme_options',
			'hcb-settings',
			array( $this, 'settings_page_callback' )
		);
	}

	/**
	 * Register settings (option to store selected theme).
	 *
	 * @return void
	 */
	public function register_settings() {
		register_setting(
			'hcb_options_group',
			'hcb_selected_theme',
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
	}

	/**
	 * Settings page callback. The React app will mount into the #hcb-admin-app div.
	 *
	 * @return void
	 */
	public function settings_page_callback() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Syntax Highlight Theme', 'dm-hcb' ); ?></h1>

			<form method="post" action="options.php">
				<?php
				settings_fields( 'hcb_options_group' );
				submit_button();
				?>
			</form>

			<div id="hcb-admin-app"></div>
		</div>
		<?php
	}

	/**
	 * Enqueue admin-side scripts/styles for the settings page.
	 *
	 * @param string $hook The current admin page hook.
	 *
	 * @return void
	 */
	public function enqueue_admin_assets( $hook ) {
		if ( 'appearance_page_hcb-settings' !== $hook ) {
			return;
		}

		$css_asset_path = HCB_PLUGIN_PATH . 'assets/build/css/admin.asset.php';
		if ( file_exists( $css_asset_path ) ) {
			$style_asset = include $css_asset_path;
			wp_enqueue_style(
				'hcb-admin-css',
				HCB_PLUGIN_URL . 'assets/build/css/admin.css',
				$style_asset['dependencies'],
				$style_asset['version']
			);
		}

		// Enqueue admin JS (React).
		$js_asset_path = HCB_PLUGIN_PATH . 'assets/build/js/admin.asset.php';
		if ( file_exists( $js_asset_path ) ) {
			$script_asset = include $js_asset_path;
			wp_enqueue_script(
				'hcb-admin-js',
				HCB_PLUGIN_URL . 'assets/build/js/admin.js',
				$script_asset['dependencies'],
				$script_asset['version'],
				true
			);
		} else {
			// Fallback: attempt to enqueue admin.js without asset file.
			wp_enqueue_script(
				'hcb-admin-js',
				HCB_PLUGIN_URL . 'assets/build/js/admin.js',
				array( 'wp-element', 'wp-components', 'wp-i18n' ),
				'1.0',
				true
			);
		}

		$themes   = $this->get_available_themes();
		$selected = get_option( 'dm_hcb_selected_theme', '' );

		wp_localize_script(
			'hcb-admin-js',
			'HCB_ADMIN',
			array(
				'themes'      => $themes,
				'selected'    => $selected,
				'ajax_url'    => admin_url( 'admin-ajax.php' ),
				'nonce'       => wp_create_nonce( 'hcb_admin_nonce' ),
				'option_name' => 'dm_hcb_selected_theme',
			)
		);
	}

	/**
	 * Read available theme files from build/themes and return as array usable by the React app.
	 *
	 * The webpack config copies highlight.js styles into assets/build/themes/*.min.css
	 *
	 * @return array
	 */
	protected function get_available_themes() {
		$themes_dir = HCB_PLUGIN_PATH . 'assets/build/themes';
		$themes     = array();

		if ( ! is_dir( $themes_dir ) ) {
			return $themes;
		}

		$files = scandir( $themes_dir );

		foreach ( $files as $file ) {
			if ( in_array( $file, array( '.', '..' ), true ) ) {
				continue;
			}

			$full_path = trailingslashit( $themes_dir ) . $file;

			if ( is_file( $full_path ) && preg_match( '/\.css$/i', $file ) ) {
				$slug     = preg_replace( '/\.min\.css$|\.css$/i', '', $file );
				$themes[] = array(
					'slug' => $slug,
					'name' => $slug,
					'url'  => HCB_PLUGIN_URL . 'assets/build/themes/' . $file,
					'file' => $file,
				);
			}
		}

		return $themes;
	}

	/**
	 * AJAX handler to save selected theme from admin UI.
	 *
	 * Expects POST 'theme' and 'nonce'. Only available to users with manage_options.
	 *
	 * @return void
	 */
	public function ajax_save_theme() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Forbidden' ), 403 );
		}

		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'hcb_admin_nonce' ) ) {
			wp_send_json_error( array( 'message' => 'Invalid nonce' ), 400 );
		}

		$theme = isset( $_POST['theme'] ) ? sanitize_text_field( wp_unslash( $_POST['theme'] ) ) : '';

		$available = $this->get_available_themes();
		$slugs     = array();
		foreach ( $available as $t ) {
			if ( is_array( $t ) && isset( $t['slug'] ) ) {
				$slugs[] = $t['slug'];
			}
		}

		// Allow empty value to clear selection.
		if ( '' !== $theme && ! in_array( $theme, $slugs, true ) ) {
			wp_send_json_error( array( 'message' => 'Theme not available' ), 400 );
		}

		update_option( 'dm_hcb_selected_theme', $theme );

		wp_send_json_success( array( 'selected' => $theme ) );
	}
}
