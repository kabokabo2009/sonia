<?php
mb_internal_encoding('UTF-8');
header('Content-Type: application/json; charset=UTF-8');

// ─── HTTPメソッドチェック ───
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ─── リファラチェック ───
$allowed_hosts = [
    $_SERVER['HTTP_HOST'] ?? '',
    'localhost',
    '127.0.0.1',
];
$referer_host = parse_url($_SERVER['HTTP_REFERER'] ?? '', PHP_URL_HOST);
if (!empty($referer_host) && !in_array($referer_host, $allowed_hosts, true)) {
    http_response_code(403);
    echo json_encode(['error' => '不正なリクエストです。']);
    exit;
}

// ─── レート制限 ───
function check_rate_limit(string $ip, int $max = 3, int $window = 3600): bool {
    $dir  = sys_get_temp_dir();
    $file = $dir . '/cf_' . md5($ip) . '.json';
    $now  = time();
    $log  = [];
    if (file_exists($file)) {
        $log = json_decode(file_get_contents($file), true) ?: [];
    }
    $log = array_values(array_filter($log, fn($t) => ($now - $t) < $window));
    if (count($log) >= $max) return false;
    $log[] = $now;
    file_put_contents($file, json_encode($log), LOCK_EX);
    return true;
}

$client_ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!check_rate_limit($client_ip)) {
    http_response_code(429);
    echo json_encode(['error' => '送信回数の上限に達しました。1時間後に再度お試しください。']);
    exit;
}

// ─── 入力取得 ───
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

// ─── ハニーポット ───
if (!empty($data['website'])) {
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}

// ─── サニタイズ ───
function sanitize_header(string $val): string {
    return trim(preg_replace('/[\r\n\t]/', '', $val));
}

$name    = sanitize_header(mb_substr($data['name']    ?? '', 0, 100));
$email   = sanitize_header(mb_substr($data['email']   ?? '', 0, 254));
$subject = sanitize_header(mb_substr($data['subject'] ?? '', 0, 100)) ?: 'その他';
$message = mb_substr(trim($data['message'] ?? ''), 0, 3000);

// ─── バリデーション ───
$errors = [];
if (!$name)                                     $errors[] = 'お名前を入力してください。';
if (!$email)                                    $errors[] = 'メールアドレスを入力してください。';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'メールアドレスの形式が正しくありません。';
if (!$message)                                  $errors[] = 'メッセージを入力してください。';

if ($errors) {
    http_response_code(400);
    echo json_encode(['error' => implode(' ', $errors)]);
    exit;
}

// ─── 設定 ───
$owner_email = 'info@example.com';   // 管理者の受信アドレス
$from_email  = 'noreply@example.com';   // ★送信元（サーバーのドメインアドレス）
$site_name   = '素二愛 Sonia 公式';
$site_url    = 'https://example.com/';

// ─── エンコード関数 ───
// 件名をUTF-8 Base64でエンコード（文字化け防止）
function mime_encode(string $str): string {
    return '=?UTF-8?B?' . base64_encode($str) . '?=';
}

// 本文をbase64エンコード（Content-Transfer-Encoding: base64 と一致させる）
function mail_body(string $text): string {
    return chunk_split(base64_encode($text));
}

// ─── 管理者への通知メール ───
$subject1 = mime_encode("【お問い合わせ】{$subject} ／ {$name}");
$body1    = implode("\n", [
    "お名前：{$name}",
    "Email：{$email}",
    "種別：{$subject}",
    "送信元IP：{$client_ip}",
    "",
    "【メッセージ】",
    $message,
]);
$headers1 = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    'From: ' . mime_encode($site_name) . " <{$from_email}>",
    "Reply-To: {$name} <{$email}>",
    'X-Mailer: PHP/' . PHP_VERSION,
]);

// ─── 送信者への自動返信メール ───
$subject2 = mime_encode("【{$site_name}】お問い合わせを受け付けました");
// HTML形式でURL をリンクにする
$message_html = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$body2 = <<<HTML
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;font-size:14px;color:#333;line-height:1.8;max-width:600px;margin:0 auto;padding:24px;">
  <p>{$name} 様</p>
  <p>お問い合わせありがとうございます。<br>
  内容を確認の上、担当者よりご連絡いたします。<br>
  返信までしばらくお待ちください。</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
  <p><strong>【送信内容】</strong><br>
  種別：{$subject}</p>
  <p>{$message_html}</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
  <p style="color:#888;font-size:12px;">
    {$site_name}<br>
    <a href="{$site_url}" style="color:#E8849A;">{$site_url}</a><br><br>
    ※このメールは自動送信です。このアドレスへの返信は受け付けておりません。
  </p>
</body>
</html>
HTML;
$headers2 = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: ' . mime_encode($site_name) . " <{$from_email}>",
    'X-Mailer: PHP/' . PHP_VERSION,
]);

// ─── 送信 ───
$ok1 = mail($owner_email, $subject1, mail_body($body1), $headers1);
$ok2 = mail($email,       $subject2, $body2,            $headers2);

if ($ok1 && $ok2) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'メール送信に失敗しました。サーバーの設定を確認してください。']);
}