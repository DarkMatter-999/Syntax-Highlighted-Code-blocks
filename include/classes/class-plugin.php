<?php
/**
 * Main Plugin File for Plugin.
 *
 * @package DM_Highlighted_Code_Blocks
 */

namespace DM_Highlighted_Code_Blocks;

use DM_Highlighted_Code_Blocks\Traits\Singleton;

/**
 * Main Plugin File for the Plugin.
 */
class Plugin {


	use Singleton;

	/**
	 * Constructor for the Plugin.
	 *
	 * @return void
	 */
	public function __construct() {
		Assets::get_instance();
		Blocks::get_instance();
		Settings::get_instance();
	}
}
