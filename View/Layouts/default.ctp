<?php
/**
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
 * @package       app.View.Layouts
 * @since         CakePHP(tm) v 0.10.0.1076
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

?>
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<?php echo $this->Html->charset(); ?>
	<title>
		<?php echo 'cakephp' ?>:
		<?php echo $title_for_layout; ?>
	</title>
	<?php
	echo $this->Html->meta('icon');
	/*
	 * Default Css
	 */
	echo $this->Html->css(
		array(
			'smoothness/jquery-ui.min.css',
			'ui-bootstrap/bootstrap.min',
			'ui-bootstrap/jquery-ui-1.10.1.custom',
			'font-awesome.min'
		)
	);
	/*
	 * IE Compat Css
	 */
	?>
	<!--[if IE 7]>
		<?php echo $this->Html->css('font-awesome-ie7.min'); ?>
	<![endif]-->
	<!--[if lt IE 9]>
		<?php echo $this->Html->css('ui-bootstrap/jquery.ui.1.10.1.ie'); ?>
	<![endif]-->
	<?php
	/*
	 * Custom Css
	 */
	echo $this->Html->css(
		array(
			'fullcalendar',
			'custom',
			'gc-prettify'
		)
	);
	/*
	 * Javascript
	 */
	echo $this->Html->script(
		array(
			'jQuery/jquery-1.9.1.js',
			'bootstrap/bootstrap.js',
			'holder.js',
			'jQuery/jquery-ui-1.10.2.custom.js',
			'jQuery/jquery.ui.datepicker-it.js',
			'jQuery/fullcalendar/fullcalendar.js',
			'gc-prettify/prettify.js',
			'custom.js'
		)
	);
		echo $this->fetch('meta');
		echo $this->fetch('css');
		echo $this->fetch('script');
	?>
	<!--[if lt IE 9]>
		<?php echo $this->Html->script('http://html5shim.googlecode.com/svn/trunk/html5.js'); ?>
	<![endif]-->

	<link rel="apple-touch-icon-precomposed" sizes="144x144" href="img/ico/apple-touch-icon-144-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="114x114" href="img/ico/apple-touch-icon-114-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="img/ico/apple-touch-icon-72-precomposed.png">
	<link rel="apple-touch-icon-precomposed" href="img/ico/apple-touch-icon-57-precomposed.png">
	<link rel="shortcut icon" href="img/ico/favicon.png">
	<style>
		#calendar {
			width: 900px;
			margin: 0 auto;
		}
	</style>
</head>
<body data-spy="scroll" data-target=".bs-docs-sidebar" data-twttr-rendered="true">

	<?php echo $this->fetch('mainnav'); ?>
	<?php echo $this->fetch('header');  ?>

	<div class="container">
		<section id="content">
			<?php echo $this->Session->flash(); ?>
			<?php echo $this->fetch('content'); ?>
		</section>
	</div>

	<?php echo $this->fetch('footer');  ?>
	<?php echo $this->element('sql_dump'); ?>
</body>
</html>
