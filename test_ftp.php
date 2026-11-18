<?php
// test_ftp.php - PROVA COLLEGAMENTO AUTODJ
$FTP_HOST = "listentomystream.com";
$FTP_USER = "bomyydij";
$FTP_PASS = "h76hlx39QLDJ"; // <--- CAMBIA QUI!

echo "<h2>Provo a collegarmi al tuo AutoDJ...</h2>";

$conn = ftp_connect($FTP_HOST, 21, 10);
if (!$conn) { echo "❌ Non riesco a collegarmi a $FTP_HOST"; exit; }
echo "✅ Collegato a $FTP_HOST<br>";

if (!ftp_login($conn, $FTP_USER, $FTP_PASS)) {
    echo "❌ Password errata o utente errato"; 
    ftp_close($conn); exit;
}
echo "✅ Login OK come $FTP_USER<br>";
ftp_pasv($conn, true);

$lista = ftp_nlist($conn, ".");
echo "<h3>Cartelle che vedo nel tuo AutoDJ:</h3><pre>";
print_r($lista);
echo "</pre>";

echo "<h3>Cerco un MP3 a caso...</h3>";
function cerca($conn, $dir, $prof=0){
  if($prof>3) return;
  $files = @ftp_nlist($conn, $dir);
  if(!$files) return;
  foreach($files as $f){
    if(strpos(strtolower($f), ".mp3")!==false){
      echo "🎵 Trovato: $f<br>";
      return $f;
    }
  }
  foreach($files as $f){
    if(strpos(basename($f), ".")===false){
      cerca($conn, $f, $prof+1);
    }
  }
}
cerca($conn, ".");

ftp_close($conn);
echo "<br><b>Se vedi le cartelle qui sopra, il collegamento FUNZIONA!</b>";
?>
