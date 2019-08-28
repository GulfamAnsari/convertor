<!DOCTYPE html>
<html lang="en">
<head>
<!-- Link page description -->
<?php include ($_SERVER['DOCUMENT_ROOT'].'/head.php');?>
<!--Link css files-->
<?php include ($_SERVER['DOCUMENT_ROOT'].'/link.php');?>
</head>
<body data-spy="scroll" data-target=".navbar" data-offset="50">
	<?php
	include ($_SERVER['DOCUMENT_ROOT'].'/nav.php');
	include ($_SERVER['DOCUMENT_ROOT'].'/upperSection.php');
	include ('article.php');
	include ($_SERVER['DOCUMENT_ROOT'].'/sideBar2.php');
	include ($_SERVER['DOCUMENT_ROOT'].'/lowerSection.php');
	include ($_SERVER['DOCUMENT_ROOT'].'/footer.php');
	?>
</body>
</html>