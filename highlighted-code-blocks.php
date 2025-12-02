<?php
/**
 * Plugin Name:       Highlighted Code Blocks
 * Plugin URI:        https://github.com/DarkMatter-999/highlighted-code-blocks
 * Description:       Syntax highlighting for code block.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            DarkMatter-999
 * Author URI:        https://github.com/DarkMatter-999
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       highlighted-code-blocks
 * Domain Path:       /languages
 *
 * @category Plugin
 * @package  DM_Highlighted_Code_Blocks
 * @author   DarkMatter-999 <darkmatter999official@gmail.com>
 * @license  GPL v2 or later <https://www.gnu.org/licenses/gpl-2.0.html>
 * @link     https://github.com/DarkMatter-999/highlighted-code-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit();
}

/**
 * Plugin base path and URL.
 */
define( 'HCB_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'HCB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once HCB_PLUGIN_PATH . 'include/helpers/autoloader.php';

use DM_Highlighted_Code_Blocks\Plugin;

Plugin::get_instance();
