<?php
class TestController extends AppController {
	var $name = "Test";
	var $uses = array();

	function beforeFilter() {
		return true;
	}
	
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
	
	function rule() {
		$this->autoRender = false;
		$url = "/full_calendar/events/upcoming/autoRender:1/return:0/bare:1/requested:1";
		$mat = "/ or /app or /authake/user/* or /authake/login* or /pages(/)?* or /*/*/pages/* or /full_calendar(/)? or /full_calendar/index* or /full_calendar/events/feed\?* or  /full_calendar/events/upcoming/*";
		$mat = str_replace(array('/','*', ' or '), array('\/', '.*', '|'), $mat);
		$mat = str_replace(' ', '', $mat);
		$mat = '\/|\/app|\/authake\/user\/.*|\/authake\/login.*|\/pages(\/)?.*|\/.*\/.*\/pages\/.*|\/full_calendar(\/)?|\/full_calendar\/index.*|\/full_calendar\/events\/feed\?.*|\/full_calendar\/events\/upcoming.*';
		if(preg_match("/^({$mat})$/i", $url, $matches)) {
			echo 'Matches';
		}
//echo 'preg_match("/^('. $mat . ')$/i", ' . $url . ', $matches);';
var_dump($matches);	
	}
}