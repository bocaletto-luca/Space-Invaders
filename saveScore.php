<?php
date_default_timezone_set('Europe/Rome');
header('Content-Type: application/json');
$recordsFile = 'records.json';
$data = file_exists($recordsFile) ? file_get_contents($recordsFile) : '[]';
$records = json_decode($data, true);

$player = isset($_POST['player']) ? $_POST['player'] : 'Anonimo';
$score = isset($_POST['score']) ? $_POST['score'] : 0;
$level = isset($_POST['level']) ? $_POST['level'] : 1;

$record = [
  'date' => date("Y-m-d H:i:s"),
  'player' => $player,
  'score' => $score,
  'level' => $level
];
$records[] = $record;
file_put_contents($recordsFile, json_encode($records, JSON_PRETTY_PRINT));
echo json_encode(['status' => 'success', 'record' => $record]);
?>
