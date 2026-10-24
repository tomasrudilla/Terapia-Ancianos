<?php
declare(strict_types=1);

define('APP_NAME', 'Espacio Calma');
define('APP_TAGLINE', 'Acompañamiento terapéutico para adultos mayores');

// En Vercel: configurá ADMIN_USER y ADMIN_PASS en Environment Variables
define('ADMIN_USER', getenv('ADMIN_USER') ?: 'admin');
define('ADMIN_PASS', getenv('ADMIN_PASS') ?: 'calma2026');

define('DB_PATH', __DIR__ . '/data/terapia.db');

// Horarios de atención (días 1=lunes … 7=domingo)
define('WORK_DAYS', [1, 2, 3, 4, 5]);
define('WORK_START', '09:00');
define('WORK_END', '18:00');
define('SLOT_MINUTES', 60);

define('TIMEZONE', 'America/Argentina/Buenos_Aires');
date_default_timezone_set(TIMEZONE);
