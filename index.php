<?php
$url = @$_GET['url'];
$url = urldecode($url);
//print($url);

$ch = curl_init($url);
//$fp = fopen("example_homepage.txt", "w");

//curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

$json = curl_exec($ch);
curl_close($ch);

//fclose($fp);
?>
<!--
https://twitter.com/SubZtep
Forked from an old version of jsonlint.com (https://github.com/umbrae/jsonlintdotcom)

Keep it simple \m/o.O\m/
-->
<!doctype html> 
<html lang="en"> 
<head>
	<meta charset="utf-8">
	<meta name="description" content="Json.City is a web based validator and beautifier.">
	<title>{ JSON_City }</title>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/codemirror.min.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/fold/foldgutter.min.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/dialog/dialog.min.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/search/matchesonscrollbar.min.css" />
	<link rel="stylesheet" href="css/style.css" type="text/css">

	<?php if ($_SERVER['SERVER_NAME'] !== 'localhost'): ?>
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-109574299-2"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());

	  gtag('config', 'UA-109574299-2');
	</script>
	<?php else: ?>
	<script>function gtag(){}</script>
	<?php endif; ?>
</head>
<body>

<div id="myModal" class="modal">
	<div class="modal-content">
		<span class="close">&times;</span>
		<p>Hello there, thanks for visiting!</p>
		<p>It’s a simple JSON formatter, I just made it because I needed it, I hope you’ll find it handy. <tt>:)</tt></p>
		<p>You know, paste an API result on the huge editor and click on the button. Simple as finding that button.</p>
		<p>Maybe I’ll add some functionality later, it’s really just a quick copy/paste code from several places.</p>
		<p>The main idea comes from the old version of <a href="https://github.com/umbrae/jsonlintdotcom" target="_blank" onclick="gtag('event', 'Link Click', {'event_category': 'Help', 'event_action': 'Old Jsonlint Github'})">jsonlint.com</a>. Keep it simple. <tt>\m/o.O\m/</tt></p>
		<p>Don’t worry, it's client-side only, I send nothing to my backend, although there is Google Analytics tracking for the fun.</p>
		<p>However, even I try to make it for good please use it at your own risk.</p>
		<p>2017, <a href="https://twitter.com/SubZtep" target="_blank" onclick="gtag('event', 'Link Click', {'event_category': 'Help', 'event_action': 'My Twitter'})">@SubZtep</a></p>
	</div>
</div>

<div id="head">

	<ul class="buildings clouds">
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_three"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_three"></li>
		<li class="buildings-cloud_four"></li>
		<li class="buildings-cloud_four"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_three"></li>
		<li class="buildings-cloud_four"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_three"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_three"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_three"></li>
		<li class="buildings-cloud_four"></li>
		<li class="buildings-cloud_four"></li>
		<li class="buildings-cloud_one"></li>
		<li class="buildings-cloud_two"></li>
		<li class="buildings-cloud_three"></li>
		<li class="buildings-cloud_four"></li>
		<li class="buildings-cloud_three"></li>
		<li class="buildings-cloud_four"></li>
	</ul>

	<ul class="buildings">
		<li class="buildings-building_one"></li>
		<li class="buildings-building_six"></li>
		<li class="buildings-building_seven"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_four"></li>
		<li class="buildings-building_two"></li>
		<li class="buildings-building_five"></li>
		<li class="buildings-building_three"></li>
		<li class="buildings-building_four"></li>
		<li class="buildings-building_six"></li>
		<li class="buildings-building_seven"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_six"></li>
		<li class="buildings-building_seven"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_four"></li>
		<li class="buildings-building_two"></li>
		<li class="buildings-building_five"></li>
		<li class="buildings-building_three"></li>
		<li class="buildings-building_four"></li>
		<li class="buildings-building_six"></li>
		<li class="buildings-building_seven"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_six"></li>
		<li class="buildings-building_seven"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_four"></li>
		<li class="buildings-building_two"></li>
		<li class="buildings-building_five"></li>
		<li class="buildings-building_three"></li>
		<li class="buildings-building_four"></li>
		<li class="buildings-building_six"></li>
		<li class="buildings-building_seven"></li>
		<li class="buildings-building_one"></li>
		<li class="buildings-building_four"></li>
		<li class="buildings-building_five"></li>
		<li class="buildings-building_four"></li>
	</ul>

	<div id="buttons">
		<button id="decompress">Beautify</button><button id="compress">Compress</button><button id="help">?</button>
	</div>

</div>

<textarea id="json_input"><?php echo @$json; ?></textarea>

<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/mode/javascript/javascript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/fold/foldcode.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/fold/foldgutter.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/fold/brace-fold.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/edit/matchbrackets.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/dialog/dialog.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/search/searchcursor.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/search/search.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/scroll/annotatescrollbar.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/search/matchesonscrollbar.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/search/jump-to-line.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsonlint/1.6.0/jsonlint.min.js"></script>
<script type="text/javascript" src="c/js/jsl.parser.js"></script>
<script src="js/main.js"></script>

<?php
if (!empty($json)) echo '<script>document.addEventListener("DOMContentLoaded", function(event) {compressJson(false);});</script>';
?>

</body>
</html>