<?php
class DATABASE_CONFIG {

	public $default = array(
		'datasource' => 'Database/Mysql',
		'persistent' => false,
		'host' => 'localhost',
		'login' => 'login',
		'password' => 'password',
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
/*
	public $oracle = array(
		'datasource' => 'Database/Oracle',
		'persistent' => false,
		'host'       => 'oracleDB',
		'port'       => '1521',
		'instance'   => 'XE',
		'login'      => 'test',
		'password'   => 'test',
		'prefix'     => '',
		// 'connection_string' => '//localhost/XE',  // Overides host, port, instance
		// 'database' => 'test_database_name',       // Not Yet supported 
	);
 */
	function __construct() {
		$this->authake2['database'] = APP .DS. 'SQLite' .DS. 'authake2.sqlite';
		$this->cakemenu['database'] = APP .DS. 'SQLite' .DS. 'cakemenu.sqlite';
		$this->calendar['database'] = APP .DS. 'SQLite' .DS. 'fullcalendar.sqlite';
	}

}
