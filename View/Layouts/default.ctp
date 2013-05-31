<?php
$baseUrl = Router::url('/');
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
	echo $this->fetch('meta');

	//echo $this->AssetCompress->css('bootstrap.css', array('raw' => false));
	echo $this->AssetCompress->css('standard.css', array('raw' => false));
	echo $this->AssetCompress->css('print.css', array(' media' => 'print'));
	?>
	<!--[if IE 7]>
		<link rel="stylesheet" type="text/css" href="<?php echo $baseUrl; ?>js/bootstrap/font-awesome-ie7.min.css" />
	<![endif]-->

	<!--[if lt IE 9]>
		<link rel="stylesheet" type="text/css" href="<?php echo $baseUrl; ?>js/jQuery/css/jquery.ui.1.10.2.ie.css" />
	<![endif]-->

	<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
	<?php
	echo $this->AssetCompress->script('standard.js');
	echo $this->AssetCompress->script('gmap3.js');
	?>
	<!--[if lt IE 9]>
		<?php echo $this->Html->script('http://html5shim.googlecode.com/svn/trunk/html5.js'); ?>
	<![endif]-->

	<link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo $baseUrl;?>img/ico/apple-touch-icon-144-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo $baseUrl;?>img/ico/apple-touch-icon-114-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo $baseUrl;?>img/ico/apple-touch-icon-72-precomposed.png">
	<link rel="apple-touch-icon-precomposed" href="<?php echo $baseUrl;?>img/ico/apple-touch-icon-57-precomposed.png">
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
	$javascript = $this->fetch('javascript');
	$jquery     = $this->fetch('jquery');
	$okJs       = ($javascript || $jquery);
	if($okJs) {
		echo '\n<script type="text/javascript">\n';
		echo $javascript;
		echo "\n\$(function() {\n";
		echo $jquery;
		echo "\n});\n";
		echo '\n</script>';
	}
	?>
	</body>
</html>
