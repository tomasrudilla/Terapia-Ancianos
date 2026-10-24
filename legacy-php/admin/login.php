<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';

if (admin_logged_in()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['user'] ?? '');
    $pass = $_POST['pass'] ?? '';
    if (attempt_login($user, $pass)) {
        header('Location: dashboard.php');
        exit;
    }
    $error = 'Usuario o contraseña incorrectos';
}

render_head('Administración');
?>
<body class="admin-body">
<div class="login-page">
    <div class="login-card">
        <p class="admin-badge">Panel administrador</p>
        <h1><?= htmlspecialchars(APP_NAME) ?></h1>
        <p class="subtitle">Gestioná reservas, eventos y horarios bloqueados</p>
        <?php if ($error): ?>
            <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <form method="post" action="">
            <div class="form-group">
                <label for="user">Usuario</label>
                <input type="text" id="user" name="user" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="pass">Contraseña</label>
                <input type="password" id="pass" name="pass" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Ingresar</button>
        </form>
        <p style="text-align:center;margin-top:1.5rem;font-size:0.85rem;color:var(--text-muted)">
            <a href="<?= htmlspecialchars(page_base() . '/index.php') ?>">← Volver al sitio</a>
        </p>
    </div>
</div>
</body>
</html>
