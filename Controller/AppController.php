<?php
/**
 * Application level Controller
 *
 * This file is application-wide controller file. You can put all
 * application-wide controller-related methods here.
 *
 * PHP 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.Controller
 * @since         CakePHP(tm) v 0.2.9
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
App::uses('Controller', 'Controller');
class AppController extends Controller {
	var $components = array(
		'Session',
		'Authake.Authake',
		'Cakemenu.Cakemenu',
		'RequestHandler',
		'DebugKit.Toolbar'
	);
	var $helpers = array('Session', 'Time', 'Js', 'Authake.Authake',
			'Cakemenu.Cakemenu' => array('className' => 'Cakemenu.Strapmenu'),
			'Paginator'         => array('className' => 'TwitterBootstrap.BootstrapPaginator'),
			'Html'              => array('className' => 'TwitterBootstrap.BootstrapHtml'),
			'Form'              => array('className' => 'TwitterBootstrap.BootstrapForm')
	);

	function beforeFilter() {
		if(!$this->request->is('ajax')) {
			$this->Authake->beforeFilter($this);
			$this->set('menu', $this->getMenu('MainMenu', false));
		}
	}

	function getMenu( $menuname, $showParent = false ) {
		$options = array(
			'subtree' => array(
				'name'   => $menuname,
				'parent' => $showParent
			)
		);
		$menu = $this->Cakemenu->nodes($options, $this->Authake);
		$menu = $this->Cakemenu->removeKey($menu, 'display', $this->Authake->getUserId() ? 1 : 2);
		return $menu;
	}

}
