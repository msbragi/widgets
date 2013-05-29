<?php
$baseUrl = Router::url('/');
?>
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<?php 
	echo "\n\t" . $this->Html->charset();
	echo "\n\t<title> :: Cakephp: {$title_for_layout}</title>";
	echo "\n\t" . $this->Html->meta('icon');
	echo "\n\t" . $this->fetch('meta');

	echo "\n\t" . $this->AssetCompress->css('jquery.css');
	echo "\n\t" . $this->AssetCompress->css('jquery.plugins.css');
	echo "\n\t" . $this->AssetCompress->css('bootstrap.css');
	echo "\n\t" . $this->AssetCompress->css('site.css');
	echo "\n\t" . $this->AssetCompress->css('print.css', array(' media' => 'print'));

	echo $this->fetch('css');

	echo "\n\t" . $this->AssetCompress->script('jquery.js');
	echo "\n\t" . $this->AssetCompress->script('jquery.plugins.js');
	echo "\n\t" . $this->AssetCompress->script('bootstrap.js');
	//echo $this->AssetCompress->script('site.js');

	echo $this->fetch('script');
	?>

	<!--[if IE 7]>
		<?php echo "\n\t\t" . $this->Html->css('../js/bootstrap/font-awesome-ie7.min.css'); ?>
	<![endif]-->
	
	<!--[if lt IE 9]>
		<?php echo "\n\t\t" . $this->Html->css('../js/jQuery/css/jquery.ui.1.10.2.ie.css'); ?>
	<![endif]-->
		
	<!--[if lt IE 9]>
		<?php echo "\n\t\t" . $this->Html->script('http://html5shim.googlecode.com/svn/trunk/html5.js'); ?>
	<![endif]-->

	<link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo $baseUrl;?>img/ico/apple-touch-icon-144-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo $baseUrl;?>img/ico/apple-touch-icon-114-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo $baseUrl;?>img/ico/apple-touch-icon-72-precomposed.png">
	<link rel="apple-touch-icon-precomposed" href="<?php echo $baseUrl;?>img/ico/apple-touch-icon-57-precomposed.png">
	<link rel="shortcut icon" href="<?php echo $baseUrl;?>img/ico/favicon.png">

<?php 
$javascriptcode = $this->fetch('javascript');
$jquerycode     = $this->fetch('jQuery');

if($javascriptcode || $jquerycode) {
	echo "<script type=\"text/javascript\">\n";
	if($javascriptcode) {
		echo $javascriptcode;
	}
	if($jquerycode) {
		echo "jQuery(function($) {\n\t{$jquerycode}\n});";
	}
	echo "\n</script>";
}
?>
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
	?>
	</body>
</html>
