<?php
App::uses('JsHelper', 'View/Helper');

class NospaceJsHelper extends JsHelper {

	public function __construct(View $View, $settings = array()) {
		parent::__construct($View, $settings);
	}

	/**
	 * Enhancements: if cache is true and folder is defined write to the defined WEBROOT/folder insted of WEBROOT/js
	 */
	public function writeBuffer($options = array()) {
		$domReady = !$this->request->is('ajax');
		$defaults = array(
				'onDomReady' => $domReady, 'inline' => true, 'folder' => '',
				'cache' => false, 'clear' => true, 'safe' => true
		);
		$options = array_merge($defaults, $options);
		
		$script = implode("\n", $this->getBuffer($options['clear']));
		if (empty($script)) {
			return null;
		}
		if ($options['onDomReady']) {
			$script = $this->{$this->_engineName}->domReady($script);
		}
		$opts = $options;
		unset($opts['onDomReady'], $opts['cache'], $opts['clear']);

		if($options['folder']) {
			if ($options['cache'] && $options['inline']) {
				$folder   = ltrim(rtrim($options['folder'],'/'),'/');
				$filename = md5($script);
				if(file_exists(WWW_ROOT . $folder . DS . $filename . '.js') || cache("{$folder}/{$filename}" . '.js', $script, '+999 days', 'public')) {
					return $this->Html->script("/$folder/{$filename}");
				}
			}
		}		
		$return = $this->Html->scriptBlock($script, $opts);
		if ($options['inline']) {
			return $return;
		}
		return null;
	}
}