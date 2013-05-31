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
	echo $this->fetch('meta');

	//echo $this->AssetCompress->css('bootstrap.css', array('raw' => false));
	echo $this->AssetCompress->css('standard.css', array('raw' => false));
	echo $this->AssetCompress->css('print.css', array(' media' => 'print'));
	?>
	<!--[if IE 7]>
		<?php echo $this->Html->css('../js/bootstrap/font-awesome-ie7.min.css'); ?>
	<![endif]-->

	<!--[if lt IE 9]>
		<?php echo $this->Html->css('../js/jQuery/css/jquery.ui.1.10.2.ie.css'); ?>
	<![endif]-->

	<?php echo $this->AssetCompress->script('standard.js'); ?>

	<?php
	if(isset($useGmap)) {
		if(!is_array($useGmap)) {
			$useGmap = array();
		}
		$useGmap = array_merge(array('url' => 'http://maps.google.com/maps/api/js', 'sensor'  => 'false','library' => ''), $useGmap);
		$gmapUrl = $useGmap['url'] . "?sensor=" . $useGmap['sensor'] . "&library=" . $useGmap['library'];
		echo $this->Html->script($gmapUrl);
		echo $this->AssetCompress->script('gmap3.js');
	}
	?>
	<!--[if lt IE 9]>
		<?php echo $this->Html->script('http://html5shim.googlecode.com/svn/trunk/html5.js'); ?>
	<![endif]-->
	<?php
		echo $this->Html->meta(array('rel' => 'apple-touch-icon-precomposed', 'sizes' => '144x144', 'link' => '/img/ico/apple-touch-icon-144-precomposed.png'));
		echo $this->Html->meta(array('rel' => 'apple-touch-icon-precomposed', 'sizes' => '114x114', 'link' => '/img/ico/apple-touch-icon-114-precomposed.png'));
		echo $this->Html->meta(array('rel' => 'apple-touch-icon-precomposed', 'sizes' => '72x72', 'link' => '/img/ico/apple-touch-icon-72-precomposed.png'));
		echo $this->Html->meta(array('rel' => 'apple-touch-icon-precomposed', 'link' => '/img/ico/apple-touch-icon-57-precomposed.png'));
	?>
<style>
img { max-width: none !important; } /* Google map twitter bootstrap hack */
</style>
</head>
<body data-twttr-rendered="true">
	<div class="navbar navbar-inverse navbar-fixed-top">
		<div class="navbar-inner">
			<div class="container">
				<a class="brand pull-right" href="/">UI-Bootstrap</a>
				<?php echo @$this->Cakemenu->generate($menu); ?>
			</div>
		</div>
	</div>

	<?php echo $this->fetch('header');  ?>

	<div class="breadcrumb">
		<div class="container">
			<?php echo $this->Cakemenu->getCrumb();  ?>
		</div>
	</div>
	<div class="container">
		<section id="content">
			<?php
				echo $this->Session->flash();
				echo $this->fetch('content');
			?>
		</section>
	</div>
	<?php echo $this->fetch('footer');  ?>
	<div class="container">
		<?php //echo $this->element('sql_dump'); ?>
	</div>
	<?php
		echo $scripts_for_layout;
		echo $this->Js->writeBuffer(array('cache' => true, 'onDomReady' => true, 'safe' => false));
	?>
	</body>
</html>
