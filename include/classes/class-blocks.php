<?php
/**
 * Block Class file for the Plugin.
 *
 * @package DM_Highlighted_Code_Blocks
 */

namespace DM_Highlighted_Code_Blocks;

use DM_Highlighted_Code_Blocks\Traits\Singleton;

/**
 * Block Class file for the Plugin.
 */
class Blocks {


	use Singleton;

	/**
	 * Constructor for the Blocks class
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register' ) );
	}

	/**
	 * Register blocks.
	 *
	 * @return void
	 */
	public function register() {
		register_block_type(
			HCB_PLUGIN_PATH . 'assets/build/blocks/highlighted-code-block'
		);
	}
}
