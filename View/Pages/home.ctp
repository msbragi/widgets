<?php
	$this->set('useGmap', array('sensor' => 'true', 'library' => 'places'));
?>
<?php $this->start('header'); ?>
<header class="jumbotron subhead" id="overview">
<div class="container">
<h1>Cakephp Bootstrap theme</h1>
<p class="lead">A Cakephp Bootstrap-themed kickstart with jQuery UI widgets.</p>
</div>
</header>
<?php $this->end(); ?>
<div id='map' style='width:100%; height:600px'></div>

<?php $this->start('myscript'); ?>

	// google.maps.visualRefresh = true;
	$("#map").gmap3({
		map: {
			options: {
				zoom: 17,
				center: [43.463214, 11.878231]
			}
		}
	});

<?php $this->end(); ?>
<?php $this->Js->buffer($this->fetch('myscript')); ?>