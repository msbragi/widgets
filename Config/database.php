<?php
class DATABASE_CONFIG {

	public $default = array(
		'datasource' => 'Database/Mysql',
		'persistent' => false,
		'host' => 'localhost',
		'login' => 'joomla',
		'password' => 'joomla',
		'database' => 'mysql',
		'prefix' => '',
		'encoding' => 'utf8',
	);

	public $calendar = array(
		'datasource' => 'Database/Sqlite',
		'database'   => '',
		'persistent' => false
	);

	public $cakemenu = array(
		'datasource' => 'Database/Sqlite',
		'database'   => '',
		'persistent' => false
	);

	public $authake2 = array(
		'datasource' => 'Database/Sqlite',
		'database'   => '',
		'persistent' => false,
		'prefix'     => ''
	);

	function __construct() {
		$this->authake2['database'] = APP .DS. 'SQLite' .DS. 'authake2.sqlite';
		$this->cakemenu['database'] = APP .DS. 'SQLite' .DS. 'cakemenu.sqlite';
		$this->calendar['database'] = APP .DS. 'SQLite' .DS. 'fullcalendar.sqlite';
	}

}
