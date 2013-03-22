<?php
class TestController extends AppController {
	var $name = "Test";
	var $uses = array();

	function index() {

	}

	function getDays() {
		$this->layout = 'ajax';
		$year = date('Y');
		$month = date('m');
		echo json_encode(array(
			array(
				'id' => 111,
				'title' => "Event1",
				'start' => "$year-$month-10",
			),
			array(
				'id' => 222,
				'title' => "Event2",
				'start' => "$year-$month-20",
				'end' => "$year-$month-22",
			)
		));
		die();
	}
}