<?php
$recordsFile = 'records.json';
$records = [];
if(file_exists($recordsFile)) {
    $data = file_get_contents($recordsFile);
    $records = json_decode($data, true);
}
usort($records, function($a, $b) {
    return intval($b['score']) - intval($a['score']);
});
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Record - Space Invaders</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container mt-5">
    <h1 class="text-center">Record - Space Invaders</h1>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Data</th>
          <th>Giocatore</th>
          <th>Punteggio</th>
          <th>Livello Raggiunto</th>
        </tr>
      </thead>
      <tbody>
        <?php if(!empty($records)): foreach($records as $record): ?>
          <tr>
            <td><?= htmlspecialchars($record['date']) ?></td>
            <td><?= htmlspecialchars($record['player']) ?></td>
            <td><?= htmlspecialchars($record['score']) ?></td>
            <td><?= htmlspecialchars($record['level']) ?></td>
          </tr>
        <?php endforeach; else: ?>
          <tr><td colspan="4" class="text-center">Nessun record salvato</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
    <div class="text-center">
      <button onclick="window.history.back()" class="btn btn-secondary">Torna Indietro</button>
    </div>
  </div>
</body>
</html>
