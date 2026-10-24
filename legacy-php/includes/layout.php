<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function is_vercel(): bool
{
    return getenv('VERCEL') === '1';
}

function render_head(string $title, array $extraCss = []): void
{
    $fullTitle = $title . ' · ' . APP_NAME;
    ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?= htmlspecialchars(APP_TAGLINE) ?>">
    <title><?= htmlspecialchars($fullTitle) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= asset('css/style.css') ?>">
    <?php foreach ($extraCss as $href): ?>
    <link rel="stylesheet" href="<?= htmlspecialchars($href) ?>">
    <?php endforeach; ?>
</head>
<body>
    <?php
}

function asset(string $path): string
{
    if (is_vercel()) {
        return '/assets/' . ltrim($path, '/');
    }
    $base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');
    if (str_contains($base, '/admin') || str_contains($base, '/api')) {
        $base = preg_replace('#/(admin|api)(/.*)?$#', '', $base) ?: '';
    }
    return ($base === '' ? '' : $base) . '/assets/' . ltrim($path, '/');
}

function page_base(): string
{
    if (is_vercel()) {
        return '';
    }
    $base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');
    if (str_contains($base, '/admin')) {
        $base = preg_replace('#/admin(/.*)?$#', '', $base) ?: '';
    }
    return $base === '' ? '' : $base;
}

function nav_page_key(): string
{
    if (is_vercel()) {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
        $uri = rtrim($uri, '/') ?: '/';
        return match ($uri) {
            '/', '/index.php' => 'inicio',
            '/experiencias.php' => 'experiencias',
            '/reservar.php' => 'reservar',
            '/eventos.php' => 'eventos',
            default => '',
        };
    }
    $script = basename($_SERVER['SCRIPT_NAME'] ?? 'index.php');
    return match ($script) {
        'index.php' => 'inicio',
        'experiencias.php' => 'experiencias',
        'reservar.php' => 'reservar',
        'eventos.php' => 'eventos',
        default => '',
    };
}

function nav_active_class(string $key): string
{
    return nav_page_key() === $key ? ' is-active' : '';
}

function nav_aria_current(string $key): string
{
    return nav_page_key() === $key ? ' aria-current="page"' : '';
}

function render_nav(bool $minimal = false): void
{
    $home = page_base() . '/index.php';
    ?>
    <header class="site-header">
        <div class="container header-inner">
            <a href="<?= htmlspecialchars($home) ?>" class="logo">
                <span class="logo-mark" aria-hidden="true"></span>
                <span><?= htmlspecialchars(APP_NAME) ?></span>
            </a>
            <?php if (!$minimal):
                $base = page_base();
                $reservar = $base . '/reservar.php';
                $eventos = $base . '/eventos.php';
                $experiencias = $base . '/experiencias.php';
            ?>
            <nav class="main-nav" id="main-nav" aria-label="Principal" data-nav-page="<?= htmlspecialchars(nav_page_key()) ?>">
                <div class="nav-links">
                    <div class="nav-dropdown" data-nav-dropdown>
                        <button
                            type="button"
                            class="nav-dropdown-trigger<?= nav_active_class('inicio') ?>"
                            id="nav-inicio-trigger"
                            aria-expanded="false"
                            aria-controls="nav-inicio-panel"
                            <?= nav_aria_current('inicio') ?>
                        >
                            Inicio
                            <span class="nav-chevron" aria-hidden="true"></span>
                        </button>
                        <div class="nav-dropdown-panel" id="nav-inicio-panel" role="menu" aria-labelledby="nav-inicio-trigger" hidden>
                            <p class="nav-dropdown-eyebrow">Secciones del inicio</p>
                            <a href="<?= htmlspecialchars($home) ?>#servicios" role="menuitem" data-nav-section="servicios">Servicios</a>
                            <a href="<?= htmlspecialchars($home) ?>#sobre-mi" role="menuitem" data-nav-section="sobre-mi">Sobre mí</a>
                            <a href="<?= htmlspecialchars($home) ?>#contacto" role="menuitem" data-nav-section="contacto">Contacto</a>
                            <a href="<?= htmlspecialchars($home) ?>" class="nav-dropdown-foot" role="menuitem" data-nav-section="portada">Ver portada completa</a>
                        </div>
                    </div>
                    <a href="<?= htmlspecialchars($experiencias) ?>" class="nav-link<?= nav_active_class('experiencias') ?>"<?= nav_aria_current('experiencias') ?>>Experiencias</a>
                </div>

                <span class="nav-divider" aria-hidden="true"></span>

                <div class="nav-actions">
                    <a href="<?= htmlspecialchars($reservar) ?>" class="btn btn-small<?= nav_active_class('reservar') ?>"<?= nav_aria_current('reservar') ?>>Reservar sesión</a>
                    <a href="<?= htmlspecialchars($eventos) ?>" class="btn btn-small btn-nav-alt<?= nav_active_class('eventos') ?>"<?= nav_aria_current('eventos') ?>>Unirme a evento grupal</a>
                </div>
            </nav>
            <button type="button" class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="main-nav">
                <span></span><span></span>
            </button>
            <?php endif; ?>
        </div>
    </header>
    <?php
}

function render_footer(): void
{
    ?>
    <footer class="site-footer">
        <div class="container footer-inner">
            <div>
                <p class="footer-brand"><?= htmlspecialchars(APP_NAME) ?></p>
                <p class="footer-tagline"><?= htmlspecialchars(APP_TAGLINE) ?></p>
            </div>
            <p class="footer-copy">&copy; <?= date('Y') ?> · Cuidado con calma y respeto</p>
        </div>
    </footer>
    <script src="<?= asset('js/main.js') ?>"></script>
</body>
</html>
    <?php
}
