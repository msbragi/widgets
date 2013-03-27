Cakephp Template & Widgets
==========================

<br />Cakephp bootstrap template with Authake/Cakemenu/FullCalendar plugins
<br />Template for cakephp based on Jquery-Ui Bootstrap
<br />The template use the bootstrapHelper(s) for correct rendering of cakephp forms fields
<br />Include submodule for Authake / Cakemenu / FullCalendar

<p>The projects is up & run except for the FullCalendar Plugin that requires a mysql connection</p>
<p>It uses SQLite/3 for database storage. You must have php >= 5.3 with PDO_Sqlite.</p>

<h2>Installation</h2>
Clone the repo with submodules

<h2>Configuration</h2>
<ol>
<li>Change webroot/index.php around line 65
<br /><code>$cakelib = '.library' . DS . 'cake' . DS . '2.3.1' . DS . 'lib';</code>
<br />to point to your cakephp installation.
<li>Change the Config/database.php for pointing to correct FullCalendar Database/Table
</ol>

<p>If you don't want to use some plugin. Edit Config/Bootstrap.php And Controller/AppController.php And remove references</p>
